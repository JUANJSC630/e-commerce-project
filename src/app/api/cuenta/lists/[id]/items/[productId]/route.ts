import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { SavedListError, removeItem } from "@/lib/saved-lists"

type Ctx = { params: Promise<{ id: string; productId: string }> }

export async function DELETE(_request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, productId } = await params

  try {
    await removeItem(userId, id, productId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof SavedListError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Saved list item remove failed:", err)
    return NextResponse.json({ error: "No se pudo quitar el producto" }, { status: 500 })
  }
}
