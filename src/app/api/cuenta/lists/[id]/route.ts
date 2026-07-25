import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { SavedListError, deleteSavedList, getSavedList, renameSavedList } from "@/lib/saved-lists"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  try {
    const list = await getSavedList(userId, id)
    return NextResponse.json({ list })
  } catch (err) {
    if (err instanceof SavedListError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Saved list read failed:", err)
    return NextResponse.json({ error: "No se pudo cargar la lista" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  let body: { name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    await renameSavedList(userId, id, body.name)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof SavedListError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Saved list rename failed:", err)
    return NextResponse.json({ error: "No se pudo renombrar la lista" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  try {
    await deleteSavedList(userId, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof SavedListError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Saved list delete failed:", err)
    return NextResponse.json({ error: "No se pudo eliminar la lista" }, { status: 500 })
  }
}
