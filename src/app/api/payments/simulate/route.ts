import { NextResponse } from "next/server"
import { markOrderFailed, markOrderPaid } from "@/lib/orders"
import { isMockPaymentsEnabled } from "@/lib/payments"

/**
 * Mock-only settlement endpoint, standing in for MercadoPago's webhook. The
 * simulated payment page calls it with the chosen outcome. Disabled entirely
 * unless the mock provider is active, so it can never confirm orders in prod.
 */
export async function POST(request: Request) {
  if (!isMockPaymentsEnabled()) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 })
  }

  let body: { orderId?: unknown; outcome?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const { orderId, outcome } = body
  if (typeof orderId !== "string" || (outcome !== "approved" && outcome !== "rejected")) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
  }

  const changed =
    outcome === "approved" ? await markOrderPaid(orderId) : await markOrderFailed(orderId)

  return NextResponse.json({ ok: true, changed })
}
