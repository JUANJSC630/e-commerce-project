"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { X, ImageOff, Loader2 } from "lucide-react"

interface MediaItem {
  key: string
  url: string
  name: string
  size: number
  uploadedAt: number
}

interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

/**
 * Modal that lists images already uploaded to the CDN so the admin can reuse one
 * without uploading again. Fetches lazily the first time it opens.
 */
export function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || items !== null) return
    setLoading(true)
    setError(null)
    fetch("/api/admin/media")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error")
        return res.json()
      })
      .then((data) => setItems(data.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [open, items])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Biblioteca de medios"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Elegir de la biblioteca</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          )}
          {error && <p className="py-12 text-center text-sm text-red-600">{error}</p>}
          {items && items.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
              <ImageOff className="h-6 w-6" />
              <p className="text-sm">Aún no hay imágenes subidas</p>
            </div>
          )}
          {items && items.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelect(item.url)
                    onClose()
                  }}
                  title={item.name}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:border-indigo-500 hover:ring-2 hover:ring-indigo-200"
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
