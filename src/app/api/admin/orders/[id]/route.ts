import { NextResponse, after } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { getOrderForConfirmation, markOrderFailed } from "@/lib/orders"
import { sendOrderShippedEmail } from "@/lib/email"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "orders", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "orders", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { status } = body

  const VALID_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Optional fulfillment tracking; trimmed, empty → null, absent → unchanged.
  const carrier = typeof body.carrier === "string" ? body.carrier.trim() || null : undefined
  const trackingNumber =
    typeof body.trackingNumber === "string" ? body.trackingNumber.trim() || null : undefined

  // Cancelling an unsettled order goes through markOrderFailed so the reserved
  // stock is returned exactly once; PAID orders only change status (refund flow
  // decides restock separately).
  if (status === "CANCELLED") await markOrderFailed(id)

  const previous = await prisma.order.findUnique({ where: { id }, select: { status: true } })
  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(carrier !== undefined ? { carrier } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
    },
  })

  // Notify the customer once, only on the transition into SHIPPED.
  if (status === "SHIPPED" && previous?.status !== "SHIPPED") {
    after(async () => {
      const dto = await getOrderForConfirmation(id)
      if (dto) await sendOrderShippedEmail(dto)
    })
  }

  return NextResponse.json(order)
}
