import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { AddressError, createAddress, listAddresses } from "@/lib/addresses"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const addresses = await listAddresses(userId)
  return NextResponse.json({ addresses })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    const address = await createAddress(userId, body)
    return NextResponse.json({ ok: true, address }, { status: 201 })
  } catch (err) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Address create failed:", err)
    return NextResponse.json({ error: "No se pudo guardar la dirección" }, { status: 500 })
  }
}
