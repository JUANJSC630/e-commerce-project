import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/stock-alerts - Subscribe to back-in-stock notification.
 * Body: { email: string, productId: string }
 * Idempotent: re-subscribing resets the `notified` flag.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; productId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { email, productId } = body
  if (typeof email !== "string" || typeof productId !== "string") {
    return NextResponse.json({ error: "email and productId are required" }, { status: 400 })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  // Verify product exists and is actually out of stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  })
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  if (product.stock > 0) {
    return NextResponse.json({ error: "Product is in stock" }, { status: 409 })
  }

  await prisma.stockAlert.upsert({
    where: { email_productId: { email, productId } },
    create: { email, productId },
    update: { notified: false },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
