import { NextResponse, after } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { deleteReplacedImage, deleteUploadedImages } from "@/lib/media-cleanup"
import { pickProductInput, pickGalleryUrls, pickVariants } from "@/lib/product-input"
import { revalidateProducts } from "@/lib/products"
import { notifyBackInStock } from "@/lib/stock-alerts"

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
 * in a transaction). UploadThing files orphaned by the edit - the replaced cover
 * plus any gallery photo no longer referenced - are cleaned up best-effort.
 */
async function updateProduct(id: string, body: unknown) {
  const prev = await prisma.product.findUnique({
    where: { id },
    select: {
      stock: true,
      image: true,
      images: { select: { url: true } },
      variants: { select: { imageUrl: true } },
    },
  })

  const gallery = pickGalleryUrls(body)
  const variants = pickVariants(body)

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
    if (variants !== null) {
      // Replace the set; OrderItem.variantId is SetNull, so order history is kept.
      await tx.productVariant.deleteMany({ where: { productId: id } })
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, position) => ({ ...v, productId: id, position })),
        })
      }
    }
    return updated
  })

  await deleteReplacedImage(prev?.image, product.image)
  // Remove UploadThing files orphaned by the edit (cover, gallery, variant images).
  const kept = new Set<string>([product.image])
  if (gallery !== null) gallery.forEach((url) => kept.add(url))
  else (prev?.images ?? []).forEach((img) => kept.add(img.url))
  if (variants !== null) variants.forEach((v) => v.imageUrl && kept.add(v.imageUrl))
  else (prev?.variants ?? []).forEach((v) => v.imageUrl && kept.add(v.imageUrl))

  const prevUrls = [
    ...(prev?.images ?? []).map((img) => img.url),
    ...(prev?.variants ?? []).map((v) => v.imageUrl),
  ]
  const orphans = prevUrls.filter((url): url is string => url !== null && !kept.has(url))
  await deleteUploadedImages(orphans)

  revalidateProducts()

  // Back-in-stock: if stock went from 0 → >0, notify subscribers.
  if ((prev?.stock ?? 0) <= 0 && product.stock > 0) {
    after(() => notifyBackInStock(id))
  }

  return product
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  try {
    const product = await updateProduct(id, await request.json())
    return NextResponse.json(product)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Hay un SKU de variante duplicado" }, { status: 409 })
    }
    throw err
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  try {
    const product = await updateProduct(id, await request.json())
    return NextResponse.json(product)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Hay un SKU de variante duplicado" }, { status: 409 })
    }
    throw err
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "delete"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  // ProductImage/ProductVariant rows cascade on delete; we still remove the CDN
  // files (cover + gallery + variant images).
  const removed = await prisma.product.delete({
    where: { id },
    select: {
      image: true,
      images: { select: { url: true } },
      variants: { select: { imageUrl: true } },
    },
  })
  await deleteUploadedImages([
    removed.image,
    ...removed.images.map((img) => img.url),
    ...removed.variants.map((v) => v.imageUrl),
  ])
  revalidateProducts()
  return new NextResponse(null, { status: 204 })
}
