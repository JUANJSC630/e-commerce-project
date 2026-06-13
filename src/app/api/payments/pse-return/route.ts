import { NextResponse } from "next/server"
import { getOrderPaymentInfo, markOrderFailed, markOrderPaid } from "@/lib/orders"
import { getPaymentProvider, isOnsiteProvider } from "@/lib/payments"
import { logPaymentEvent } from "@/lib/payments/audit"

/**
 * Where the bank sends the customer back after a PSE transfer. Query params
 * from this redirect are attacker-controlled (the customer can edit the URL),
 * so the outcome is ALWAYS re-verified against the gateway before any
 * navigation — collection_status and friends are ignored on purpose.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get("orderId")

  const redirect = (path: string) => NextResponse.redirect(new URL(path, url.origin))

  if (!orderId) return redirect("/pago-fallido")

  const order = await getOrderPaymentInfo(orderId)
  if (!order) return redirect("/pago-fallido")

  // Already settled (webhook beat the redirect) — route by final state.
  if (order.paymentStatus === "PAID") return redirect(`/order-success/${order.id}`)
  if (order.paymentStatus === "FAILED") return redirect(`/pago-fallido?orderId=${order.id}`)

  const provider = getPaymentProvider()
  if (!isOnsiteProvider(provider) || !order.paymentProviderId) {
    return redirect(`/pago/${order.id}`)
  }

  try {
    const result = await provider.getPaymentStatus(order.paymentProviderId)

    await logPaymentEvent({
      orderId: order.id,
      provider: provider.name,
      event: "pse.return",
      providerId: result.providerId,
      status: result.statusDetail,
      rawPayload: result.raw,
    })

    if (result.status === "approved") {
      await markOrderPaid(order.id)
      return redirect(`/order-success/${order.id}`)
    }
    if (result.status === "rejected") {
      await markOrderFailed(order.id)
      return redirect(`/pago-fallido?orderId=${order.id}`)
    }
    // Still pending at the bank — the success page shows the waiting state.
    return redirect(`/order-success/${order.id}`)
  } catch (err) {
    console.error("PSE return: no se pudo verificar el pago", { orderId, err })
    // Verification failed — don't guess; the webhook will settle it.
    return redirect(`/order-success/${order.id}`)
  }
}
