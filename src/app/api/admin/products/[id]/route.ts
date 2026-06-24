import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { deleteReplacedImage, deleteUploadedImages } from "@/lib/media-cleanup"
import { pickProductInput, pickGalleryUrls } from "@/lib/product-input"
import { revalidateProducts } from "@/lib/products"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

/**
 * Shared update path for PUT and PATCH. Writes the scalar product fields and, if
 * the request carries an `images` array, replaces the gallery (delete-then-create
 * in a transaction). UploadThing files orphaned by the edit — the replaced cover
 * plus any gallery photo no longer referenced — are cleaned up best-effort.
 */
async function updateProduct(id: string, body: unknown) {
  const prev = await prisma.product.findUnique({
    where: { id },
    select: { image: true, images: { select: { url: true } } },
  })

  const gallery = pickGalleryUrls(body)

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({ where: { id }, data: pickProductInput(body) })
    if (gallery !== null) {
      await tx.productImage.deleteMany({ where: { productId: id } })
      if (gallery.length > 0) {
        await tx.productImage.createMany({
          data: gallery.map((url, position) => ({ productId: id, url, position })),
        })
      }
    }
    return updated
  })

  await deleteReplacedImage(prev?.image, product.image)
  if (gallery !== null) {
    const kept = new Set([product.image, ...gallery])
    const orphans = (prev?.images ?? []).map((img) => img.url).filter((url) => !kept.has(url))
    await deleteUploadedImages(orphans)
  }

  revalidateProducts()
  return product
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const product = await updateProduct(id, await request.json())
  return NextResponse.json(product)
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const product = await updateProduct(id, await request.json())
  return NextResponse.json(product)
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "delete"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  // ProductImage rows cascade on delete; we still remove the CDN files (cover + gallery).
  const removed = await prisma.product.delete({
    where: { id },
    select: { image: true, images: { select: { url: true } } },
  })
  await deleteUploadedImages([removed.image, ...removed.images.map((img) => img.url)])
  revalidateProducts()
  return new NextResponse(null, { status: 204 })
}
