"use client"

import { useEffect } from "react"
import { ImageOff, RefreshCw } from "lucide-react"

/**
 * Degraded state for the media manager when the CDN scan fails (e.g.
 * UPLOADTHING_TOKEN missing or UploadThing unreachable). Keeps the admin usable
 * instead of bubbling to the global admin error boundary.
 */
export default function MediaError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // The error is already logged server-side; nothing else to do here.
  }, [])

  return (
    <div className="p-6">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-center">
        <ImageOff className="h-8 w-8 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800">No se pudo escanear el CDN</p>
          <p className="mt-1 text-sm text-slate-500">
            Revisa que <code className="rounded bg-slate-100 px-1">UPLOADTHING_TOKEN</code> esté
            configurado y que UploadThing esté disponible.
          </p>
        </div>
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  )
}
