import Image from "next/image"
import Link from "next/link"
import { Instagram } from "lucide-react"

export interface InstagramPost {
  image: string
  /** Where the tile links — the product page (shoppable grid). */
  href: string
  alt: string
}

interface InstagramFeedProps {
  /** Raw `social.instagram` value (handle or full URL). Hidden when empty. */
  instagram: string
  posts: InstagramPost[]
}

/** Extracts a display "@handle" and a profile URL from a handle or full URL. */
function parseInstagram(value: string): { handle: string; url: string } | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) {
    const handle = trimmed.replace(/\/+$/, "").split("/").pop() || "instagram"
    return { handle: `@${handle.replace(/^@/, "")}`, url: trimmed }
  }
  const handle = trimmed.replace(/^@/, "")
  return { handle: `@${handle}`, url: `https://instagram.com/${handle}` }
}

/**
 * "Follow us on Instagram" section: a shoppable grid of the store's product
 * photos that link to their product pages, plus a CTA to the real profile. Pure
 * presentational — the home passes the profile value and the post tiles.
 */
export function InstagramFeed({ instagram, posts }: InstagramFeedProps) {
  const profile = parseInstagram(instagram)
  if (!profile || posts.length === 0) return null

  return (
    <section aria-labelledby="instagram-heading" className="py-14 md:py-20 bg-brand-surface-alt">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <p className="flex items-center justify-center gap-1.5 text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
            <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
            Síguenos
          </p>
          <h2
            id="instagram-heading"
            className="font-display font-black text-3xl md:text-4xl text-brand-ink"
          >
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-base transition-colors"
            >
              {profile.handle}
            </a>
          </h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {posts.map((post, i) => (
            <Link
              key={post.href + i}
              href={post.href}
              className="group relative aspect-square overflow-hidden rounded-lg bg-brand-surface"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <span className="absolute inset-0 grid place-items-center bg-brand-ink/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Instagram className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
