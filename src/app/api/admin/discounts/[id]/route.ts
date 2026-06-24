import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { pickDiscountInput } from "@/lib/discounts"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "discounts", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  try {
    const discount = await prisma.discount.update({
      where: { id },
      data: pickDiscountInput(await request.json()),
    })
    return NextResponse.json(discount)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un código con ese nombre" }, { status: 409 })
    }
    throw err
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "discounts", "delete"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.discount.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
