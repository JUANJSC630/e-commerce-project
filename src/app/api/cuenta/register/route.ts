import { NextResponse } from "next/server"
import { AccountError, registerCustomer } from "@/lib/account"
import { clientIp, isRateLimited, recordRateLimitHit } from "@/lib/rate-limit"

const REGISTER_MAX = 5
const REGISTER_WINDOW_MS = 60 * 60 * 1000

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  if (
    await isRateLimited({
      action: "register",
      identifier: ip,
      max: REGISTER_MAX,
      windowMs: REGISTER_WINDOW_MS,
    })
  ) {
    return NextResponse.json(
      { error: "Demasiadas cuentas creadas. Intenta de nuevo más tarde." },
      { status: 429 },
    )
  }

  let body: { name?: unknown; email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const { name, email, password } = body
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  await recordRateLimitHit("register", ip, REGISTER_WINDOW_MS)

  try {
    const user = await registerCustomer({ name, email, password })
    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err) {
    if (err instanceof AccountError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Customer registration failed:", err)
    return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 500 })
  }
}
