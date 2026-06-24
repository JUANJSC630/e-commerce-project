import { NextResponse } from "next/server"
import { validateDiscount } from "@/lib/discounts"
import { loadAllSettings } from "@/lib/settings"

/**
 * Public checkout preview: validates a discount code against the current cart
 * subtotal and returns the amount it would take off. The real discount is
 * re-validated and consumed server-side when the order is created, so this is
 * purely informational and safe to expose.
 */
export async function POST(request: Request) {
  let body: { code?: unknown; subtotal?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: "Petición inválida" }, { status: 400 })
  }

  const code = typeof body.code === "string" ? body.code : ""
  const subtotal = typeof body.subtotal === "number" && body.subtotal >= 0 ? body.subtotal : 0
  if (!code.trim()) {
    return NextResponse.json({ ok: false, message: "Ingresa un código" }, { status: 400 })
  }

  const { shipping } = await loadAllSettings()
  const shippingCost = subtotal > shipping.freeThreshold ? 0 : shipping.standardCost

  const result = await validateDiscount(code, subtotal, shippingCost)
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 200 })
  }
  return NextResponse.json({ ok: true, ...result.application }, { status: 200 })
}
