import { NextResponse } from "next/server"
import { remindAbandonedOrders } from "@/lib/orders"

/**
 * Daily cron (configured in vercel.json) that emails a payment reminder for
 * orders abandoned before paying. Authenticated with CRON_SECRET: Vercel Cron
 * sends `Authorization: Bearer <CRON_SECRET>`. Fails closed — no secret, no run.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error("CRON_SECRET no configurado — cron rechazado")
    return NextResponse.json({ error: "No configurado" }, { status: 503 })
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reminded = await remindAbandonedOrders()
    return NextResponse.json({ reminded })
  } catch (err) {
    console.error("Cron abandoned-orders falló", err)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
