"use client"

import Image from "next/image"
import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { UploadDropzone } from "@/lib/uploadthing"

const PLACEHOLDER = "/placeholder.svg"

interface ImageUploadFieldProps {
  /** Current image URL (may be the placeholder). */
  value: string
  /** Called with the new URL after upload, or the placeholder after removal. */
  onChange: (url: string) => void
}

/**
 * Admin product image control. Shows a preview when an image is set, otherwise
 * an UploadThing dropzone. Uploads start automatically on drop (mode: "auto")
 * and the resulting CDN URL is lifted to the parent form via `onChange`.
 */
export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const hasImage = Boolean(value) && value !== PLACEHOLDER

  if (hasImage) {
    return (
      <div className="relative w-40 aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
        <Image
          src={value}
          alt="Vista previa del producto"
          fill
          className="object-cover"
          sizes="160px"
        />
        <button
          type="button"
          onClick={() => onChange(PLACEHOLDER)}
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
        endpoint="productImage"
        config={{ mode: "auto" }}
        onUploadBegin={() => setIsUploading(true)}
        onClientUploadComplete={(res) => {
          setIsUploading(false)
          const url = res?.[0]?.serverData?.url
          if (url) {
            onChange(url)
            toast.success("Imagen subida")
          }
        }}
        onUploadError={(error) => {
          setIsUploading(false)
          toast.error(error.message || "Error al subir la imagen")
        }}
        className="ut-button:bg-indigo-600 ut-button:ut-readying:bg-indigo-600/60 ut-label:text-indigo-600 ut-allowed-content:text-slate-400 border-slate-300 py-6"
      />
      {isUploading && <p className="text-xs text-slate-400">Subiendo…</p>}
    </div>
  )
}
