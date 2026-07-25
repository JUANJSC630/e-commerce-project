import "server-only"

import { prisma } from "@/lib/prisma"

/** Domain error with an HTTP status for the saved-list API routes to map. */
export class SavedListError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = "SavedListError"
  }
}

const NAME_MAX = 80
const MAX_ITEMS = 200

/** A saved list as shown in the list overview (no products resolved yet). */
export interface SavedListSummary {
  id: string
  name: string
  itemCount: number
  createdAt: string
}

/** A saved list with the ids of its products (resolved to Products by the UI). */
export interface SavedListDetail {
  id: string
  name: string
  productIds: string[]
  createdAt: string
}

const TX_OPTS = { maxWait: 10_000, timeout: 20_000 }

function assertName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new SavedListError("El nombre de la lista es requerido")
  }
  const name = value.trim()
  if (name.length > NAME_MAX) throw new SavedListError("El nombre es demasiado largo")
  return name
}

/**
 * Normalizes the requested product ids: keeps strings, dedupes, caps the count,
 * and drops any id that isn't a real product - so a list never stores junk ids.
 */
async function resolveProductIds(input: unknown): Promise<string[]> {
  if (!Array.isArray(input)) return []
  const unique = [
    ...new Set(input.filter((id): id is string => typeof id === "string" && id.trim() !== "")),
  ]
  if (unique.length === 0) return []
  if (unique.length > MAX_ITEMS)
    throw new SavedListError(`Una lista admite máximo ${MAX_ITEMS} productos`)

  const existing = await prisma.product.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  })
  const valid = new Set(existing.map((p) => p.id))
  return unique.filter((id) => valid.has(id))
}

export async function listSavedLists(userId: string): Promise<SavedListSummary[]> {
  const lists = await prisma.savedList.findMany({
    where: { userId },
    select: { id: true, name: true, createdAt: true, _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  })
  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    itemCount: l._count.items,
    createdAt: l.createdAt.toISOString(),
  }))
}

export async function getSavedList(userId: string, id: string): Promise<SavedListDetail> {
  const list = await prisma.savedList.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      items: { select: { productId: true }, orderBy: { createdAt: "asc" } },
    },
  })
  if (!list) throw new SavedListError("Lista no encontrada", 404)
  return {
    id: list.id,
    name: list.name,
    productIds: list.items.map((i) => i.productId),
    createdAt: list.createdAt.toISOString(),
  }
}

export async function createSavedList(
  userId: string,
  nameInput: unknown,
  productIdsInput: unknown,
): Promise<SavedListSummary> {
  const name = assertName(nameInput)
  const productIds = await resolveProductIds(productIdsInput)

  const list = await prisma.savedList.create({
    data: {
      userId,
      name,
      items: { create: productIds.map((productId) => ({ productId })) },
    },
    select: { id: true, name: true, createdAt: true, _count: { select: { items: true } } },
  })
  return {
    id: list.id,
    name: list.name,
    itemCount: list._count.items,
    createdAt: list.createdAt.toISOString(),
  }
}

export async function renameSavedList(
  userId: string,
  id: string,
  nameInput: unknown,
): Promise<void> {
  const name = assertName(nameInput)
  const { count } = await prisma.savedList.updateMany({ where: { id, userId }, data: { name } })
  if (count === 0) throw new SavedListError("Lista no encontrada", 404)
}

export async function deleteSavedList(userId: string, id: string): Promise<void> {
  const { count } = await prisma.savedList.deleteMany({ where: { id, userId } })
  if (count === 0) throw new SavedListError("Lista no encontrada", 404)
}

/**
 * Adds products to an existing list, skipping ones already there. Ids are
 * validated to real products first. Returns how many rows were newly added.
 */
export async function addItemsToList(
  userId: string,
  listId: string,
  productIdsInput: unknown,
): Promise<number> {
  const productIds = await resolveProductIds(productIdsInput)
  return prisma.$transaction(async (tx) => {
    const list = await tx.savedList.findFirst({
      where: { id: listId, userId },
      select: { id: true },
    })
    if (!list) throw new SavedListError("Lista no encontrada", 404)
    if (productIds.length === 0) return 0
    const { count } = await tx.savedListItem.createMany({
      data: productIds.map((productId) => ({ listId, productId })),
      skipDuplicates: true,
    })
    return count
  }, TX_OPTS)
}

/** Removes one product from a list (ownership enforced via the list's userId). */
export async function removeItem(userId: string, listId: string, productId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const list = await tx.savedList.findFirst({
      where: { id: listId, userId },
      select: { id: true },
    })
    if (!list) throw new SavedListError("Lista no encontrada", 404)
    await tx.savedListItem.deleteMany({ where: { listId, productId } })
  }, TX_OPTS)
}
