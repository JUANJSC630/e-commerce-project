import { NextResponse } from "next/server"
import { AccountError, registerCustomer } from "@/lib/account"

export async function POST(request: Request) {
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
