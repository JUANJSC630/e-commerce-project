import "server-only"

import { Prisma, type PaymentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { loadAllSettings } from "@/lib/settings"
import { consumeDiscountInTx } from "@/lib/discounts"
import { resolveShippingCost, computeTax } from "@/lib/shipping"
import { sendAbandonedOrderEmail, sendOrderPaidEmail } from "@/lib/email"
import type { ShippingData } from "@/lib/validation"

/**
 * Order creation + read layer.
 *
 * The server is the single source of truth for money: prices, subtotal,
 * shipping and total are recomputed from the database on every order - the
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
  /** When set, stock is deducted from this variant (and its price is used). */
  variantId?: string
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
  /** Optional discount code; re-validated and consumed server-side. */
  discountCode?: string
}

export interface CreateOrderResult {
  id: string
  orderNumber: string
}

const MAX_ATTEMPTS = 3

/** Sequential, human-friendly number reset per year: DI-2026-001. */
async function nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear()
  const count = await tx.order.count({ where: { createdAt: { gte: new Date(year, 0, 1) } } })
  return `DI-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { items, customer, paymentMethod, userId, discountCode } = input
  if (items.length === 0) throw new OrderError("EMPTY_CART", "El carrito está vacío")

  const { shipping } = await loadAllSettings()

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const productIds = [...new Set(items.map((i) => i.productId))]
          const products = await tx.product.findMany({
            where: { id: { in: productIds }, isPublished: true },
            select: { id: true, name: true, price: true, isPreorder: true },
          })
          const byId = new Map(products.map((p) => [p.id, p]))

          const variantIds = [
            ...new Set(items.map((i) => i.variantId).filter((v): v is string => Boolean(v))),
          ]
          const variants = variantIds.length
            ? await tx.productVariant.findMany({
                where: { id: { in: variantIds } },
                select: { id: true, productId: true, price: true, size: true, color: true },
              })
            : []
          const variantById = new Map(variants.map((v) => [v.id, v]))

          // Aggregate quantity per stock unit. Variant items deduct from the
          // variant's stock; plain items from the product's. A unit can span
          // several cart lines, so stock is checked against the combined total.
          const qtyByProduct = new Map<string, number>()
          const qtyByVariant = new Map<string, number>()
          for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
              throw new OrderError("OUT_OF_STOCK", "Cantidad inválida")
            }
            if (!byId.has(item.productId)) {
              throw new OrderError("PRODUCT_UNAVAILABLE", "Un producto ya no está disponible")
            }
            if (item.variantId) {
              const variant = variantById.get(item.variantId)
              if (!variant || variant.productId !== item.productId) {
                throw new OrderError("PRODUCT_UNAVAILABLE", "Una variante ya no está disponible")
              }
              qtyByVariant.set(
                item.variantId,
                (qtyByVariant.get(item.variantId) ?? 0) + item.quantity,
              )
            } else {
              qtyByProduct.set(
                item.productId,
                (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
              )
            }
          }

          // Guarded decrement: only succeeds while enough stock remains, so
          // concurrent checkouts can't drive stock negative - except preorder
          // products, which are allowed to backorder (stock may go negative).
          for (const [productId, qty] of qtyByProduct) {
            if (byId.get(productId)?.isPreorder) {
              await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: qty } },
              })
              continue
            }
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
          for (const [variantId, qty] of qtyByVariant) {
            const productId = variantById.get(variantId)?.productId
            if (productId && byId.get(productId)?.isPreorder) {
              await tx.productVariant.update({
                where: { id: variantId },
                data: { stock: { decrement: qty } },
              })
              continue
            }
            const { count } = await tx.productVariant.updateMany({
              where: { id: variantId, stock: { gte: qty } },
              data: { stock: { decrement: qty } },
            })
            if (count === 0) {
              throw new OrderError(
                "OUT_OF_STOCK",
                `Sin stock suficiente para "${byId.get(productId ?? "")?.name ?? "un producto"}"`,
              )
            }
          }

          // Money is recomputed server-side: a variant uses its own price (or the
          // product price when it inherits); plain items use the product price.
          const lineItems = items.map((item) => {
            const variant = item.variantId ? variantById.get(item.variantId) : undefined
            const price = variant?.price ?? byId.get(item.productId)!.price
            return {
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: item.quantity,
              price,
              size: item.size ?? variant?.size ?? null,
              color: item.color ?? variant?.color ?? null,
            }
          })

          const subtotal = lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0)
          // Shipping rate by destination zone (customer.state), free above threshold.
          const shippingCost = resolveShippingCost(subtotal, customer.state, shipping)

          // Re-validate + atomically consume the discount. An invalid code is
          // treated as "no discount" so the order still goes through.
          const discount = discountCode
            ? await consumeDiscountInTx(tx, discountCode, subtotal, shippingCost)
            : null
          const discountAmount = discount?.amount ?? 0
          // Goods discount reduces the taxable base; a free-shipping code doesn't.
          const goodsDiscount = discount && !discount.freeShipping ? discount.amount : 0
          const tax = computeTax(subtotal - goodsDiscount, shipping)

          const baseTotal = subtotal + shippingCost - discountAmount
          return tx.order.create({
            data: {
              orderNumber: await nextOrderNumber(tx),
              userId,
              customerName: `${customer.firstName} ${customer.lastName}`.trim(),
              customerEmail: customer.email,
              subtotal,
              shippingCost,
              discountCode: discount?.code ?? null,
              discountAmount,
              taxAmount: tax.amount,
              // Included tax is already inside the total; added tax bumps it.
              total: tax.included ? baseTotal : baseTotal + tax.amount,
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
      // concurrently - recompute and retry.
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
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  size: string | null
  color: string | null
}

export interface OrderConfirmationDTO {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string | null
  status: string
  paymentStatus: PaymentStatus
  /** A gateway attempt exists and hasn't settled - show "waiting", not "pay". */
  paymentInFlight: boolean
  subtotal: number
  shippingCost: number
  discountCode: string | null
  discountAmount: number
  taxAmount: number
  total: number
  carrier: string | null
  trackingNumber: string | null
  createdAt: Date
  shippingAddress: ShippingData | null
  items: OrderConfirmationItem[]
}

const ORDER_DETAIL_SELECT = {
  id: true,
  userId: true,
  orderNumber: true,
  customerName: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  paymentProviderId: true,
  subtotal: true,
  shippingCost: true,
  discountCode: true,
  discountAmount: true,
  taxAmount: true,
  total: true,
  carrier: true,
  trackingNumber: true,
  createdAt: true,
  shippingAddress: true,
  items: {
    select: {
      id: true,
      productId: true,
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
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentInFlight:
      order.paymentProviderId !== null &&
      (order.paymentStatus === "PENDING" || order.paymentStatus === "PROCESSING"),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discountCode: order.discountCode,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    total: order.total,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    shippingAddress: (order.shippingAddress as ShippingData | null) ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
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
 * Read a single order for its confirmation page. For guest orders the unguessable
 * cuid acts as a capability token, so anyone with the link may view it. Orders
 * that belong to an account are scoped to that account: a viewer who isn't the
 * owner gets `null` (the caller renders notFound, never revealing existence).
 */
export async function getOrderForConfirmation(
  id: string,
  viewerId?: string | null,
): Promise<OrderConfirmationDTO | null> {
  const order = await prisma.order.findUnique({ where: { id }, select: ORDER_DETAIL_SELECT })
  if (!order) return null
  if (order.userId && order.userId !== viewerId) return null
  return toConfirmationDTO(order)
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
  customerName: string | null
  userId: string | null
  paymentStatus: PaymentStatus
  paymentProviderId: string | null
  paymentMethod: string | null
  paymentAttempts: number
  pseRedirectUrl: string | null
  shippingAddress: ShippingData | null
}

/** Minimal read used by the payment flow (amount + current settlement state). */
export async function getOrderPaymentInfo(id: string): Promise<OrderPaymentInfo | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      customerEmail: true,
      customerName: true,
      userId: true,
      paymentStatus: true,
      paymentProviderId: true,
      paymentMethod: true,
      paymentAttempts: true,
      pseRedirectUrl: true,
      shippingAddress: true,
    },
  })
  if (!order) return null
  return { ...order, shippingAddress: (order.shippingAddress as ShippingData | null) ?? null }
}

/** Don't nag before this, and don't chase orders older than the window (stale). */
const ABANDON_AFTER_MS = 24 * 60 * 60 * 1000
const ABANDON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Emails a one-time "complete your payment" reminder for orders left PENDING
 * (checkout abandoned before paying). The reminder is claimed with a guarded
 * update before sending, so concurrent cron runs - or a duplicate invocation -
 * can never email the same customer twice. Returns how many were sent.
 */
export async function remindAbandonedOrders(): Promise<number> {
  const now = Date.now()
  const candidates = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      reminderSentAt: null,
      customerEmail: { not: null },
      createdAt: { lt: new Date(now - ABANDON_AFTER_MS), gt: new Date(now - ABANDON_WINDOW_MS) },
    },
    select: { id: true },
  })

  let sent = 0
  for (const { id } of candidates) {
    const { count } = await prisma.order.updateMany({
      where: { id, reminderSentAt: null },
      data: { reminderSentAt: new Date() },
    })
    if (count === 0) continue
    const order = await getOrderForConfirmation(id)
    if (order) {
      await sendAbandonedOrderEmail(order)
      sent++
    }
  }
  return sent
}

/** Hard cap on charge attempts per order (brute-force / card-testing guard). */
export const MAX_PAYMENT_ATTEMPTS = 5

/**
 * Atomically claims one payment attempt: only succeeds while the order can
 * still settle and hasn't exhausted its attempts. The fresh idempotency key is
 * stored BEFORE the gateway is called, so a crash mid-charge can never lead to
 * a double bill - retrying reuses the stored key.
 */
export async function claimPaymentAttempt(
  id: string,
  data: { provider: string; method: string; idempotencyKey: string },
): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: {
      id,
      paymentStatus: { in: SETTLEABLE },
      paymentAttempts: { lt: MAX_PAYMENT_ATTEMPTS },
    },
    data: {
      paymentProvider: data.provider,
      paymentMethod: data.method,
      idempotencyKey: data.idempotencyKey,
      paymentAttempts: { increment: 1 },
    },
  })
  return count > 0
}

/** Persists the gateway-side payment id (and PSE redirect state) after initiation. */
export async function recordPaymentInitiated(
  id: string,
  data: { providerId: string; processing?: boolean; pseRedirectUrl?: string },
): Promise<void> {
  await prisma.order.update({
    where: { id },
    data: {
      paymentProviderId: data.providerId,
      ...(data.processing ? { paymentStatus: "PROCESSING" as PaymentStatus } : {}),
      ...(data.pseRedirectUrl ? { pseRedirectUrl: data.pseRedirectUrl } : {}),
    },
  })
}

/** Stores the provider's reference (preference/session id) on the order. */
export async function setPaymentReference(id: string, reference: string): Promise<void> {
  await prisma.order.update({ where: { id }, data: { paymentProviderId: reference } })
}

/** States a payment can still settle from - PENDING (card) or PROCESSING (PSE at the bank). */
const SETTLEABLE: PaymentStatus[] = ["PENDING", "PROCESSING"]

/**
 * Idempotently settle a successful payment: paymentStatus → PAID, order →
 * CONFIRMED. The guarded `updateMany` ensures only the first call (e.g. a
 * webhook delivered twice) takes effect. Returns whether it changed anything.
 */
export async function markOrderPaid(id: string): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: { id, paymentStatus: { in: SETTLEABLE } },
    data: { paymentStatus: "PAID", status: "CONFIRMED" },
  })
  if (count === 0) return false

  // The guard above guarantees this runs once per settlement (a duplicate webhook
  // finds the order already PAID and does nothing), so the email is sent exactly once.
  const order = await getOrderForConfirmation(id)
  if (order) await sendOrderPaidEmail(order)
  return true
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
        where: { id, paymentStatus: { in: SETTLEABLE } },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      })
      if (count === 0) return false

      const items = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, variantId: true, quantity: true },
      })
      for (const item of items) {
        // Return stock to the same unit it came from: the variant when the line
        // had one (and it still exists), otherwise the product.
        if (item.variantId) {
          await tx.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
      return true
    },
    { maxWait: 8000, timeout: 15000 },
  )
}
