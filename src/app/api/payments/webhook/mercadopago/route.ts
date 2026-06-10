import { NextResponse, after } from "next/server"
import { getOrderPaymentInfo, markOrderFailed, markOrderPaid } from "@/lib/orders"
import { getPaymentProvider, isOnsiteProvider } from "@/lib/payments"
import { logPaymentEvent } from "@/lib/payments/audit"
import {
  extractDataId,
  verifyMpSignature,
  type MpWebhookBody,
} from "@/lib/payments/mercadopago/webhook"

/**
 * MercadoPago webhook: the only path allowed to settle orders.
 *
 * Contract with MP: answer 200 within 22s or the delivery is retried — so the
 * signature is checked synchronously and everything else (the status lookup
 * against MP's API plus the order update) runs via `after()`, once the
 * response is on the wire.
 *
 * The notification body is never trusted: it only tells us *which* payment to
 * look at. The authoritative status always comes from GET /v1/payments/{id}.
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  let body: MpWebhookBody | null = null
  try {
    body = JSON.parse(rawBody) as MpWebhookBody
  } catch {
    /* signature check below will reject */
  }

  const dataId = extractDataId(new URL(request.url), body)

  // Fail closed: without a configured secret no webhook can settle anything.
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET no está configurado — webhook rechazado")
    return NextResponse.json({ error: "No configurado" }, { status: 503 })
  }

  const valid = verifyMpSignature({
    dataId,
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    secret,
  })
  if (!valid) {
    console.warn("Webhook MercadoPago con firma inválida", { dataId })
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
  }

  // Acknowledge everything that isn't a payment event (merchant_order, etc.).
  if (body?.type !== "payment" || !dataId) {
    return NextResponse.json({ received: true })
  }

  after(() => processPaymentNotification(dataId))
  return NextResponse.json({ received: true })
}

async function processPaymentNotification(paymentId: string): Promise<void> {
  try {
    const provider = getPaymentProvider()
    if (!isOnsiteProvider(provider)) return

    // Authoritative state, fetched from MP — never from the notification body.
    const result = await provider.getPaymentStatus(paymentId)

    const orderId = result.orderReference
    if (!orderId) {
      console.warn("Webhook: pago sin external_reference", { paymentId })
      return
    }

    const order = await getOrderPaymentInfo(orderId)
    if (!order) {
      console.warn("Webhook: pedido no encontrado", { paymentId, orderId })
      return
    }

    await logPaymentEvent({
      orderId,
      provider: provider.name,
      event: `webhook.payment.${result.status}`,
      providerId: result.providerId,
      status: result.statusDetail,
      rawPayload: result.raw,
    })

    if (result.status === "approved") {
      // Guarded update — a duplicate delivery is a no-op.
      await markOrderPaid(orderId)
      return
    }

    if (result.status === "rejected") {
      // Only the order's CURRENT payment attempt may cancel it. A late
      // notification for a dead attempt (customer already retrying with a new
      // card) must not pull the order out from under them.
      if (order.paymentProviderId === result.providerId) {
        await markOrderFailed(orderId)
      }
    }
    // "pending" carries no transition — the next notification settles it.
  } catch (err) {
    console.error("Webhook MercadoPago: fallo procesando notificación", { paymentId, err })
  }
}
