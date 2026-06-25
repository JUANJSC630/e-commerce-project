"use client"

import Image from "next/image"
import { useEffect, useState, type ReactNode } from "react"
import { Maximize2, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GalleryImage {
  url: string
  alt: string
}

interface ProductGalleryProps {
  /** Thumbnails source (cover first, then extra photos). */
  images: GalleryImage[]
  activeIndex: number
  onSelect: (index: number) => void
  /** Image actually shown (lets the parent override with a variant photo). */
  displayUrl: string
  displayAlt: string
  /** Overlay badges (Nuevo, -X%) rendered on the main image. */
  badges?: ReactNode
}

/**
 * Product image viewer: a compact main image with hover-magnifier (zooms into the
 * cursor), an "expand" button that opens a fullscreen lightbox, and a thumbnail
 * strip. Controlled (active index + display image come from the parent) so it
 * stays in sync with variant selection. Reusable across detail/quick-view.
 */
export function ProductGallery({
  images,
  activeIndex,
  onSelect,
  displayUrl,
  displayAlt,
  badges,
}: ProductGalleryProps) {
  const [origin, setOrigin] = useState("50% 50%")
  const [zooming, setZooming] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Lock scroll + close on Escape while the lightbox is open.
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [expanded])

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-brand-surface shadow-sm"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMove}
      >
        {badges}
        <Image
          src={displayUrl}
          alt={displayAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 18rem"
          className={cn(
            "object-cover transition-transform duration-200 ease-out",
            zooming ? "scale-[1.8]" : "scale-100",
          )}
          style={{ transformOrigin: origin }}
        />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Ver imagen completa"
          className="absolute bottom-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Thumbnails — only when there's more than one photo */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2" role="group" aria-label="Imágenes del producto">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-pressed={i === activeIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 bg-brand-surface transition-all",
                i === activeIndex
                  ? "border-brand-base ring-1 ring-brand-base"
                  : "border-border hover:border-brand-muted",
              )}
            >
              <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/80 p-4"
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="relative h-[85vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={displayUrl} alt={displayAlt} fill className="object-contain" sizes="90vw" />
          </div>
        </div>
      )}
    </div>
  )
}
