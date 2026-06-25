import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog"
import { loadAllSettings } from "@/lib/settings"

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [post, { brand }] = await Promise.all([getPostBySlug(slug), loadAllSettings()])
  if (!post) return { title: `Artículo no encontrado - ${brand.name}` }

  const description = post.excerpt ?? `Lee "${post.title}" en el blog de ${brand.name}.`
  return {
    title: `${post.title} - ${brand.name}`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
    },
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="container mx-auto px-4 py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-base transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Volver al blog
        </Link>

        <time className="text-sm text-muted-foreground" dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
        <h1 className="font-display font-black text-3xl md:text-4xl text-brand-ink mt-2 leading-tight">
          {post.title}
        </h1>

        {post.coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-surface my-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Content is trusted HTML (seed/admin authored). */}
        <div
          className="blog-content max-w-none mt-8 text-foreground leading-relaxed [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-brand-ink [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:text-brand-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-muted-foreground [&_li]:mb-1 [&_strong]:text-brand-ink"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  )
}
