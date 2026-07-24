import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { AccountError, updateProfile } from "@/lib/account"

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    const profile = await updateProfile(userId, body)
    return NextResponse.json({ ok: true, profile })
  } catch (err) {
    if (err instanceof AccountError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Profile update failed:", err)
    return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 })
  }
}
