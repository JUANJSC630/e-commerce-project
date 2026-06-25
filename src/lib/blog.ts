import "server-only"

import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"

/**
 * Blog data-access layer. Posts are cached under the `posts` tag (5-min ISR) and
 * the admin invalidates it on any mutation. Content is trusted HTML.
 */

export const POSTS_TAG = "posts"
const CACHE = { tags: [POSTS_TAG], revalidate: 300 }

export interface PostListItem {
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string
}

export interface PostDetail extends PostListItem {
  content: string
}

const PUBLISHED = { isPublished: true }

/** All published posts, newest first (list view). */
export const getPublishedPosts = unstable_cache(
  async (): Promise<PostListItem[]> => {
    const posts = await prisma.post.findMany({
      where: PUBLISHED,
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true },
    })
    return posts.map((p) => ({ ...p, publishedAt: p.publishedAt.toISOString() }))
  },
  ["published-posts"],
  CACHE,
)

/** A single published post by slug, or null. */
export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<PostDetail | null> => {
    const post = await prisma.post.findFirst({
      where: { slug, ...PUBLISHED },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        content: true,
        publishedAt: true,
      },
    })
    return post ? { ...post, publishedAt: post.publishedAt.toISOString() } : null
  },
  ["post-by-slug"],
  CACHE,
)

/** Slugs for static generation / sitemap. */
export const getAllPostSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const posts = await prisma.post.findMany({ where: PUBLISHED, select: { slug: true } })
    return posts.map((p) => p.slug)
  },
  ["all-post-slugs"],
  CACHE,
)

export function revalidatePosts(): void {
  revalidateTag(POSTS_TAG)
}
