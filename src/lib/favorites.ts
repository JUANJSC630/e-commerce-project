import "server-only"

import { prisma } from "@/lib/prisma"

/** Product ids a customer has favorited, newest first. */
export async function getFavoriteIds(userId: string): Promise<string[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
    orderBy: { createdAt: "desc" },
  })
  return favorites.map((f) => f.productId)
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  await prisma.favorite.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  })
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  await prisma.favorite.deleteMany({ where: { userId, productId } })
}

/**
 * Merges a set of product ids into the account (e.g. the guest's localStorage
 * favorites on login) and returns the full, deduplicated list.
 */
export async function mergeFavorites(userId: string, productIds: string[]): Promise<string[]> {
  const unique = [...new Set(productIds)].filter(Boolean)
  if (unique.length > 0) {
    await prisma.favorite.createMany({
      data: unique.map((productId) => ({ userId, productId })),
      skipDuplicates: true,
    })
  }
  return getFavoriteIds(userId)
}
