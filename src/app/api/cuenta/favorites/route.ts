import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { addFavorite, getFavoriteIds, mergeFavorites, removeFavorite } from "@/lib/favorites"

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user.id ?? null
}

export async function GET() {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  return NextResponse.json(await getFavoriteIds(userId))
}

export async function POST(request: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { productId } = await request.json().catch(() => ({}))
  if (typeof productId !== "string") {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 })
  }
  await addFavorite(userId, productId)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { productId } = await request.json().catch(() => ({}))
  if (typeof productId !== "string") {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 })
  }
  await removeFavorite(userId, productId)
  return NextResponse.json({ ok: true })
}

/** Merge the caller's local favorites into the account; returns the full list. */
export async function PUT(request: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { productIds } = await request.json().catch(() => ({}))
  const ids = Array.isArray(productIds) ? productIds.filter((x) => typeof x === "string") : []
  return NextResponse.json(await mergeFavorites(userId, ids))
}
