import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { AccountError, changePassword } from "@/lib/account"

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let body: { currentPassword?: unknown; newPassword?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const { currentPassword, newPassword } = body
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  try {
    await changePassword(userId, currentPassword, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AccountError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Password change failed:", err)
    return NextResponse.json({ error: "No se pudo cambiar la contraseña" }, { status: 500 })
  }
}
