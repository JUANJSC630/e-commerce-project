import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/session"
import { SavedListError, createSavedList, listSavedLists } from "@/lib/saved-lists"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const lists = await listSavedLists(userId)
  return NextResponse.json({ lists })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let body: { name?: unknown; productIds?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    const list = await createSavedList(userId, body.name, body.productIds)
    return NextResponse.json({ ok: true, list }, { status: 201 })
  } catch (err) {
    if (err instanceof SavedListError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("Saved list create failed:", err)
    return NextResponse.json({ error: "No se pudo crear la lista" }, { status: 500 })
  }
}
