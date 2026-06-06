import "server-only"

import { Prisma, type PaymentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { shipping } from "@/config/store.config"
import type { ShippingData } from "@/lib/validation"

/**
 * Order creation + read layer.
 *
 * The server is the single source of truth for money: prices, subtotal,
 * shipping and total are recomputed from the database on every order — the
 * client only says *which* products and *how many*. Stock is decremented with
 * a guarded `updateMany` so two simultaneous checkouts can never oversell.
 */

export type OrderErrorCode = "EMPTY_CART" | "PRODUCT_UNAVAILABLE" | "OUT_OF_STOCK" | "CONFLICT"

/** Domain error with an HTTP status, so the API route can map it cleanly. */
export class OrderError extends Error {
  constructor(
    readonly code: OrderErrorCode,
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = "OrderError"
  }
}

export interface CreateOrderItemInput {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[]
  customer: ShippingData
  paymentMethod: string
  /** Links the order to a logged-in customer account; omitted for guests. */
  userId?: string
}

export interface CreateOrderResult {
  id: string
  orderNumber: string
}

const MAX_ATTEMPTS = 3

function shippingCostFor(subtotal: number): number {
  return subtotal > shipping.freeThreshold ? 0 : shipping.standardCost
}

/** Sequential, human-friendly number reset per year: DI-2026-001. */
async function nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear()
  const count = await tx.order.count({ where: { createdAt: { gte: new Date(year, 0, 1) } } })
  return `DI-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { items, customer, paymentMethod, userId } = input
  if (items.length === 0) throw new OrderError("EMPTY_CART", "El carrito está vacío")

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const productIds = [...new Set(items.map((i) => i.productId))]
          const products = await tx.product.findMany({
            where: { id: { in: productIds }, isPublished: true },
            select: { id: true, name: true, price: true },
          })
          const byId = new Map(products.map((p) => [p.id, p]))

          // Aggregate quantity per product — a product can span several cart lines
          // (different size/color) and stock is checked against the combined total.
          const qtyByProduct = new Map<string, number>()
          for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
              throw new OrderError("OUT_OF_STOCK", "Cantidad inválida")
            }
            if (!byId.has(item.productId)) {
              throw new OrderError("PRODUCT_UNAVAILABLE", "Un producto ya no está disponible")
            }
            qtyByProduct.set(
              item.productId,
              (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
            )
          }

          // Guarded decrement: only succeeds while enough stock remains, so
          // concurrent checkouts can't drive stock negative.
          for (const [productId, qty] of qtyByProduct) {
            const { count } = await tx.product.updateMany({
              where: { id: productId, stock: { gte: qty } },
              data: { stock: { decrement: qty } },
            })
            if (count === 0) {
              throw new OrderError(
                "OUT_OF_STOCK",
                `Sin stock suficiente para "${byId.get(productId)?.name ?? "un producto"}"`,
              )
            }
          }

          const lineItems = items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: byId.get(item.productId)!.price,
            size: item.size ?? null,
            color: item.color ?? null,
          }))

          const subtotal = lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0)
          const shippingCost = shippingCostFor(subtotal)

          return tx.order.create({
            data: {
              orderNumber: await nextOrderNumber(tx),
              userId,
              customerName: `${customer.firstName} ${customer.lastName}`.trim(),
              customerEmail: customer.email,
              subtotal,
              shippingCost,
              total: subtotal + shippingCost,
              paymentMethod,
              shippingAddress: customer as unknown as Prisma.InputJsonValue,
              items: { create: lineItems },
            },
            select: { id: true, orderNumber: true },
          })
        },
        // Pooled Prisma Postgres can be slow to hand out a connection on the
        // first transaction after idle; widen the windows to avoid spurious
        // P2028 "unable to start a transaction" failures.
        { maxWait: 8000, timeout: 15000 },
      )
    } catch (err) {
      // A unique clash on the generated number means another order slipped in
      // concurrently — recompute and retry.
      const isNumberClash =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
      if (isNumberClash && attempt < MAX_ATTEMPTS) continue
      throw err
    }
  }

  throw new OrderError("CONFLICT", "No se pudo generar el pedido, intenta de nuevo", 409)
}

export interface OrderConfirmationItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  size: string | null
  color: string | null
}

export interface OrderConfirmationDTO {
  orderNumber: string
  customerName: string | null
  customerEmail: string | null
  status: string
  paymentStatus: PaymentStatus
  subtotal: number
  shippingCost: number
  total: number
  createdAt: Date
  shippingAddress: ShippingData | null
  items: OrderConfirmationItem[]
}

const ORDER_DETAIL_SELECT = {
  orderNumber: true,
  customerName: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  subtotal: true,
  shippingCost: true,
  total: true,
  createdAt: true,
  shippingAddress: true,
  items: {
    select: {
      id: true,
      quantity: true,
      price: true,
      size: true,
      color: true,
      product: { select: { name: true, image: true } },
    },
  },
} satisfies Prisma.OrderSelect

type OrderDetailRow = Prisma.OrderGetPayload<{ select: typeof ORDER_DETAIL_SELECT }>

function toConfirmationDTO(order: OrderDetailRow): OrderConfirmationDTO {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    createdAt: order.createdAt,
    shippingAddress: (order.shippingAddress as ShippingData | null) ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      image: item.product.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),
  }
}

/**
 * Read a single order for its confirmation page. The unguessable cuid acts as a
 * capability token (guest checkout has no account), so we expose only what the
 * customer needs to see — never payment internals.
 */
export async function getOrderForConfirmation(id: string): Promise<OrderConfirmationDTO | null> {
  const order = await prisma.order.findUnique({ where: { id }, select: ORDER_DETAIL_SELECT })
  return order ? toConfirmationDTO(order) : null
}

/** Same detail, but scoped to the owning account so customers can't read others'. */
export async function getCustomerOrder(
  id: string,
  userId: string,
): Promise<OrderConfirmationDTO | null> {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: ORDER_DETAIL_SELECT,
  })
  return order ? toConfirmationDTO(order) : null
}

export interface CustomerOrderSummary {
  id: string
  orderNumber: string
  status: string
  paymentStatus: PaymentStatus
  total: number
  itemCount: number
  createdAt: Date
}

/** Order history for a customer's account, newest first. */
export async function getOrdersByUser(userId: string): Promise<CustomerOrderSummary[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  })
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.total,
    createdAt: o.createdAt,
    itemCount: o._count.items,
  }))
}

export interface OrderPaymentInfo {
  id: string
  orderNumber: string
  total: number
  customerEmail: string | null
  paymentStatus: PaymentStatus
}

/** Minimal read used by the payment flow (amount + current settlement state). */
export function getOrderPaymentInfo(id: string): Promise<OrderPaymentInfo | null> {
  return prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      customerEmail: true,
      paymentStatus: true,
    },
  })
}

/** Stores the provider's reference (preference/session id) on the order. */
export async function setPaymentReference(id: string, reference: string): Promise<void> {
  await prisma.order.update({ where: { id }, data: { paymentRef: reference } })
}

/**
 * Idempotently settle a successful payment: paymentStatus → PAID, order →
 * CONFIRMED. The guarded `updateMany` ensures only the first call (e.g. a
 * webhook delivered twice) takes effect. Returns whether it changed anything.
 */
export async function markOrderPaid(id: string): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: { id, paymentStatus: "PENDING" },
    data: { paymentStatus: "PAID", status: "CONFIRMED" },
  })
  return count > 0
}

/**
 * Idempotently settle a failed payment: paymentStatus → FAILED, order →
 * CANCELLED, and return the reserved stock. The guarded `updateMany` runs first
 * inside the transaction so the restock happens exactly once.
 */
export async function markOrderFailed(id: string): Promise<boolean> {
  return prisma.$transaction(
    async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id, paymentStatus: "PENDING" },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      })
      if (count === 0) return false

      const items = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, quantity: true },
      })
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
      return true
    },
    { maxWait: 8000, timeout: 15000 },
  )
}
