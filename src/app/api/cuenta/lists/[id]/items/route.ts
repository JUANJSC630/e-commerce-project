import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { SavedListError, addItemsToList } from "@/lib/saved-lists"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  let body: { productIds?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    const added = await addItemsToList(userId, id, body.productIds)
    return NextResponse.json({ ok: true, added })
  } catch (err) {
    if (err instanceof SavedListError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Saved list add-items failed:", err)
    return NextResponse.json({ error: "No se pudo añadir a la lista" }, { status: 500 })
  }
}
