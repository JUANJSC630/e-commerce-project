import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import type { OrderStatus } from "@prisma/client"

const VALID_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]

/**
 * Bulk-update order statuses. Accepts up to 100 order IDs at once.
 * Does NOT fire individual emails - admin should use single-order PATCH
 * if shipping notifications are needed per order.
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "orders", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: { ids?: unknown; status?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { ids, status } = body

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
    return NextResponse.json({ error: "ids must be an array of 1-100 strings" }, { status: 400 })
  }
  if (!ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "All ids must be strings" }, { status: 400 })
  }
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const result = await prisma.order.updateMany({
    where: { id: { in: ids as string[] } },
    data: { status: status as OrderStatus },
  })

  return NextResponse.json({ updated: result.count })
}
