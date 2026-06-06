import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { createOrder, OrderError } from "@/lib/orders"
import type { CreateOrderItemInput } from "@/lib/orders"
import { validateShippingData } from "@/lib/validation"
import type { ShippingData } from "@/lib/validation"
import { isCustomer } from "@/lib/permissions"

interface OrderRequestBody {
  items?: unknown
  customer?: unknown
  paymentMethod?: unknown
}

function parseItems(raw: unknown): CreateOrderItemInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const items: CreateOrderItemInput[] = []
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) return null
    const { productId, quantity, size, color } = entry as Record<string, unknown>
    if (typeof productId !== "string" || typeof quantity !== "number") return null
    items.push({
      productId,
      quantity,
      size: typeof size === "string" ? size : undefined,
      color: typeof color === "string" ? color : undefined,
    })
  }
  return items
}

export async function POST(request: Request) {
  let body: OrderRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 })
  }

  const items = parseItems(body.items)
  if (!items) {
    return NextResponse.json({ error: "El carrito está vacío o es inválido" }, { status: 400 })
  }

  // Re-validate shipping server-side — never trust the client's own checks.
  const customer = body.customer as ShippingData
  if (!validateShippingData(customer).isValid) {
    return NextResponse.json({ error: "Datos de envío incompletos" }, { status: 400 })
  }

  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "unknown"

  // Link the order to a logged-in customer so it shows in their history.
  const session = await getServerSession(authOptions)
  const userId = session && isCustomer(session.user.role.slug) ? session.user.id : undefined

  try {
    const result = await createOrder({ items, customer, paymentMethod, userId })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
    }
    console.error("Order creation failed:", err)
    return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 500 })
  }
}
