"use client"

import Image from "next/image"
import { useState } from "react"
import { X, Images, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { UploadButton } from "@/lib/uploadthing"
import { MediaLibraryModal } from "@/components/admin/media/media-library-modal"

interface GalleryUploadFieldProps {
  /** Ordered list of image URLs (the product's extra gallery photos). */
  value: string[]
  /** Called with the new ordered list after add/remove/reorder. */
  onChange: (urls: string[]) => void
}

/**
 * Admin control for a product's image gallery (the photos shown after the cover
 * on the detail page). Manages an ordered list of CDN URLs: upload more via
 * UploadThing or pick from the media library, remove, and reorder with the
 * arrow buttons. Duplicates are ignored so the same photo can't be added twice.
 */
export function GalleryUploadField({ value, onChange }: GalleryUploadFieldProps) {
  const [libraryOpen, setLibraryOpen] = useState(false)

  function add(url: string) {
    if (!url || value.includes(url)) return
    onChange([...value, url])
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  function move(index: number, delta: number) {
    const next = [...value]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <li
              key={url}
              className="relative w-24 aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group"
            >
              <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label="Quitar imagen"
                className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 flex justify-between bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Mover a la izquierda"
                  className="grid h-6 w-6 place-items-center text-white disabled:opacity-30"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label="Mover a la derecha"
                  className="grid h-6 w-6 place-items-center text-white disabled:opacity-30"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <UploadButton
          endpoint="productImage"
          config={{ mode: "auto" }}
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.serverData?.url
            if (url) {
              add(url)
              toast.success("Imagen agregada")
            }
          }}
          onUploadError={(error) => {
            toast.error(error.message || "Error al subir la imagen")
          }}
          content={{ button: ({ ready }) => (ready ? "Agregar imagen" : "…"), allowedContent: " " }}
          className="ut-button:bg-indigo-600 ut-button:ut-readying:bg-indigo-600/60 ut-button:h-9 ut-button:px-4 ut-button:text-sm ut-allowed-content:hidden"
        />
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Images className="h-3.5 w-3.5" />
          Elegir de la biblioteca
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Fotos adicionales del detalle (frente, espalda, detalle). La portada se configura arriba.
      </p>

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => add(url)}
      />
    </div>
  )
}
