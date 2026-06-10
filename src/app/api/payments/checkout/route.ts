import { NextResponse } from "next/server"
import { getOrderPaymentInfo, setPaymentReference } from "@/lib/orders"
import { getPaymentProvider } from "@/lib/payments"

/**
 * Starts payment for an existing (PENDING) order: asks the active provider for
 * a checkout and returns the URL the client should redirect to. With the mock
 * provider this is the internal /pago/[orderId] simulator.
 */
export async function POST(request: Request) {
  let orderId: unknown
  try {
    orderId = (await request.json()).orderId
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  if (typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 })
  }

  const order = await getOrderPaymentInfo(orderId)
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  if (order.paymentStatus !== "PENDING") {
    return NextResponse.json({ error: "El pedido ya fue procesado" }, { status: 409 })
  }

  try {
    const checkout = await getPaymentProvider().createCheckout({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customerEmail: order.customerEmail,
    })
    // On-site providers (MercadoPago) have no gateway object yet at handoff.
    if (checkout.reference) await setPaymentReference(order.id, checkout.reference)
    return NextResponse.json({ redirectUrl: checkout.redirectUrl })
  } catch (err) {
    console.error("Payment checkout failed:", err)
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 })
  }
}
