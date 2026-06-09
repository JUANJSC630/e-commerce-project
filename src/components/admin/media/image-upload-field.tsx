"use client"

import Image from "next/image"
import { useState } from "react"
import { X, Images } from "lucide-react"
import { toast } from "sonner"
import { UploadDropzone } from "@/lib/uploadthing"
import type { UploadRouter } from "@/app/api/uploadthing/core"
import { MediaLibraryModal } from "@/components/admin/media/media-library-modal"

const PLACEHOLDER = "/placeholder.svg"

/**
 * Per-slot media presets. A "slot" is where an image is used (product card,
 * category tile, home hero, brand logo): it fixes the upload endpoint, the
 * preview shape, the recommended dimensions shown as guidance, the minimum size
 * we warn below, and the `sizes` hint for the preview <Image>. Centralizing this
 * keeps every call site consistent and makes the guidance match reality.
 */
export type MediaSlot = "product" | "category" | "hero" | "logo"

interface SlotConfig {
  endpoint: keyof UploadRouter
  previewClassName: string
  /** Human-readable aspect/size guidance shown under the dropzone. */
  hint: string
  /** Minimum recommended pixels; smaller uploads trigger a (non-blocking) warning. */
  minWidth: number
  minHeight: number
  /** `sizes` hint for the preview image. */
  sizes: string
}

const SLOTS: Record<MediaSlot, SlotConfig> = {
  product: {
    endpoint: "productImage",
    previewClassName: "w-40 aspect-[3/4]",
    hint: "Vertical 3:4 · mín. 600×800px",
    minWidth: 600,
    minHeight: 800,
    sizes: "240px",
  },
  category: {
    endpoint: "categoryImage",
    previewClassName: "w-28 aspect-square",
    hint: "Cuadrada 1:1 · mín. 600×600px",
    minWidth: 600,
    minHeight: 600,
    sizes: "160px",
  },
  hero: {
    endpoint: "settingsImage",
    previewClassName: "w-40 aspect-video",
    hint: "Horizontal 16:9 · mín. 1280×720px",
    minWidth: 1280,
    minHeight: 720,
    sizes: "240px",
  },
  logo: {
    endpoint: "settingsImage",
    previewClassName: "w-40 aspect-video",
    hint: "PNG transparente · mín. 200px de alto",
    minWidth: 0,
    minHeight: 200,
    sizes: "240px",
  },
}

interface ImageUploadFieldProps {
  /** Current image URL (may be the placeholder/empty). */
  value: string
  /** Called with the new URL after upload, or `emptyValue` after removal. */
  onChange: (url: string) => void
  /** Where this image is used — sets endpoint, shape, guidance and validation. */
  slot?: MediaSlot
  /** Override the upload endpoint (defaults to the slot's). */
  endpoint?: keyof UploadRouter
  /** Value treated as "no image" (shown as dropzone) and set on removal. */
  emptyValue?: string
  /** Override the preview box sizing (defaults to the slot's). */
  previewClassName?: string
}

/** Reads an image file's pixel dimensions in the browser. */
function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("No se pudo leer la imagen"))
    }
    img.src = url
  })
}

/**
 * Admin image control. Shows a preview when an image is set, otherwise an
 * UploadThing dropzone. Uploads start automatically on drop (mode: "auto") and
 * the resulting CDN URL is lifted to the parent form via `onChange`. The `slot`
 * drives the shape, the recommended-size guidance, a low-resolution warning, and
 * a live upload progress bar.
 */
export function ImageUploadField({
  value,
  onChange,
  slot = "product",
  endpoint,
  emptyValue = PLACEHOLDER,
  previewClassName,
}: ImageUploadFieldProps) {
  const cfg = SLOTS[slot]
  const resolvedEndpoint = endpoint ?? cfg.endpoint
  const resolvedPreview = previewClassName ?? cfg.previewClassName

  const [progress, setProgress] = useState<number | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const hasImage = Boolean(value) && value !== PLACEHOLDER && value !== emptyValue

  if (hasImage) {
    return (
      <div
        className={`relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 ${resolvedPreview}`}
      >
        <Image src={value} alt="Vista previa" fill className="object-cover" sizes={cfg.sizes} />
        <button
          type="button"
          onClick={() => onChange(emptyValue)}
          aria-label="Quitar imagen"
          className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <UploadDropzone
        endpoint={resolvedEndpoint}
        config={{ mode: "auto" }}
        onBeforeUploadBegin={async (files) => {
          for (const file of files) {
            try {
              const { width, height } = await readImageSize(file)
              if (width < cfg.minWidth || height < cfg.minHeight) {
                toast.warning(`Imagen pequeña (${width}×${height}px). Recomendado: ${cfg.hint}.`)
              }
            } catch {
              // Unreadable file — let UploadThing surface the real error.
            }
          }
          return files
        }}
        onUploadBegin={() => setProgress(0)}
        onUploadProgress={(p) => setProgress(p)}
        onClientUploadComplete={(res) => {
          setProgress(null)
          const url = res?.[0]?.serverData?.url
          if (url) {
            onChange(url)
            toast.success("Imagen subida")
          }
        }}
        onUploadError={(error) => {
          setProgress(null)
          toast.error(error.message || "Error al subir la imagen")
        }}
        className="ut-button:bg-indigo-600 ut-button:ut-readying:bg-indigo-600/60 ut-label:text-indigo-600 ut-allowed-content:text-slate-400 border-slate-300 py-6"
      />
      {progress !== null ? (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">Subiendo… {progress}%</p>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1">
          <p className="text-xs text-slate-400">{cfg.hint}</p>
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Images className="h-3.5 w-3.5" />
            Elegir de la biblioteca
          </button>
        </div>
      )}
      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  )
}
