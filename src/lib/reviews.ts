import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PRODUCTS_TAG, revalidateProducts } from "@/lib/products"

/**
 * Product reviews + the denormalized rating aggregate.
 *
 * A product's `rating` and `reviewCount` are recomputed from its approved
 * reviews whenever a review is created or removed, so the storefront card/detail
 * read a single cheap column instead of aggregating on every render.
 */

export interface ReviewDTO {
  id: string
  authorName: string
  rating: number
  comment: string | null
  createdAt: string
}

/** A standout review surfaced as a home testimonial, with its product. */
export interface TestimonialDTO {
  id: string
  authorName: string
  rating: number
  comment: string
  productId: string
  productName: string
  productImage: string
}

/**
 * Top reviews (≥4★ with a comment) across the catalog, for the home testimonials
 * section. Cached under the products tag so a new review refreshes it. Returns an
 * empty list when there are no qualifying reviews (the section then hides).
 */
export const getFeaturedReviews = unstable_cache(
  async (limit = 6): Promise<TestimonialDTO[]> => {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true, rating: { gte: 4 }, comment: { not: null } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        authorName: true,
        rating: true,
        comment: true,
        product: { select: { id: true, name: true, image: true } },
      },
    })
    return reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment ?? "",
      productId: r.product.id,
      productName: r.product.name,
      productImage: r.product.image,
    }))
  },
  ["featured-reviews"],
  { tags: [PRODUCTS_TAG], revalidate: 300 },
)

/** Reads a product's approved reviews, newest first. */
export async function getProductReviews(productId: string): Promise<ReviewDTO[]> {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
  })
  return reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
}

/** Recomputes and stores `rating` (avg) + `reviewCount` from approved reviews. */
async function recomputeAggregate(
  tx: Pick<typeof prisma, "review" | "product">,
  productId: string,
): Promise<void> {
  const agg = await tx.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  })
  await tx.product.update({
    where: { id: productId },
    data: {
      reviewCount: agg._count,
      // Round to one decimal so the star display reads cleanly; null when none.
      rating: agg._avg.rating !== null ? Math.round(agg._avg.rating * 10) / 10 : null,
    },
  })
}

export type ReviewErrorCode = "INVALID" | "ALREADY_REVIEWED" | "PRODUCT_NOT_FOUND"

export class ReviewError extends Error {
  constructor(
    readonly code: ReviewErrorCode,
    message: string,
  ) {
    super(message)
    this.name = "ReviewError"
  }
}

export interface CreateReviewInput {
  productId: string
  userId: string
  authorName: string
  rating: number
  comment?: string
}

/**
 * Creates a review (one per user per product) and refreshes the product's rating
 * aggregate in the same transaction. Throws ReviewError on invalid input, a
 * duplicate review, or an unknown product.
 */
export async function createReview(input: CreateReviewInput): Promise<void> {
  const rating = Math.trunc(input.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewError("INVALID", "La calificación debe ser de 1 a 5 estrellas")
  }
  const comment = input.comment?.trim() || null

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: input.productId },
      select: { id: true },
    })
    if (!product) throw new ReviewError("PRODUCT_NOT_FOUND", "El producto no existe")

    const existing = await tx.review.findUnique({
      where: { productId_userId: { productId: input.productId, userId: input.userId } },
    })
    if (existing)
      throw new ReviewError("ALREADY_REVIEWED", "Ya dejaste una reseña de este producto")

    await tx.review.create({
      data: {
        productId: input.productId,
        userId: input.userId,
        authorName: input.authorName,
        rating,
        comment,
      },
    })
    await recomputeAggregate(tx, input.productId)
  })

  // Bust the cached storefront product reads so the new review/rating shows.
  revalidateProducts()
}
