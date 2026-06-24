import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { createReview, ReviewError } from "@/lib/reviews"

type Params = { params: Promise<{ id: string }> }

/**
 * Submit a review for a product. Requires a logged-in account (one review per
 * user per product); the author name comes from the session, never the client.
 */
export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Inicia sesión para dejar una reseña" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const rating = typeof body.rating === "number" ? body.rating : NaN
  const comment = typeof body.comment === "string" ? body.comment : undefined
  const authorName = session.user.name?.trim() || session.user.email || "Cliente"

  try {
    await createReview({ productId: id, userId: session.user.id, authorName, rating, comment })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    if (err instanceof ReviewError) {
      const status =
        err.code === "ALREADY_REVIEWED" ? 409 : err.code === "PRODUCT_NOT_FOUND" ? 404 : 400
      return NextResponse.json({ error: err.message }, { status })
    }
    throw err
  }
}
