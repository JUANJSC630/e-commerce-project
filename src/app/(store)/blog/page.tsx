import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getPublishedPosts } from "@/lib/blog"
import { loadAllSettings } from "@/lib/settings"

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await loadAllSettings()
  return {
    title: `Blog - ${brand.name}`,
    description: `Consejos de crianza, moda infantil y guías para padres en el blog de ${brand.name}.`,
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
          Blog
        </p>
        <h1 className="font-display font-black text-3xl md:text-4xl text-brand-ink">
          Consejos para crecer juntos
        </h1>
        <p className="text-muted-foreground mt-3">
          Crianza, moda infantil y guías prácticas para acompañarte en cada etapa.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">Pronto publicaremos nuestros primeros artículos.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-surface mb-4">
                  <Image
                    src={post.coverImage || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <time className="text-xs text-muted-foreground" dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <h2 className="font-display font-bold text-lg text-brand-ink mt-1 leading-tight group-hover:text-brand-base transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.excerpt}</p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
