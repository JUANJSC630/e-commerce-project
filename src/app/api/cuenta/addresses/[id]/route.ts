import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { AddressError, deleteAddress, setDefaultAddress, updateAddress } from "@/lib/addresses"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    // `{ action: "default" }` just promotes the address; anything else is a full edit.
    if (body.action === "default") {
      await setDefaultAddress(userId, id)
      return NextResponse.json({ ok: true })
    }
    const address = await updateAddress(userId, id, body)
    return NextResponse.json({ ok: true, address })
  } catch (err) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Address update failed:", err)
    return NextResponse.json({ error: "No se pudo actualizar la dirección" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  try {
    await deleteAddress(userId, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Address delete failed:", err)
    return NextResponse.json({ error: "No se pudo eliminar la dirección" }, { status: 500 })
  }
}
