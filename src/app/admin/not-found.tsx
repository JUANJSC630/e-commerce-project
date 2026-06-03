"use client"

import Link from "next/link"
import { SearchX, Home, ArrowLeft } from "lucide-react"

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <SearchX className="h-8 w-8 text-slate-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Página no encontrada</h1>
        <p className="text-slate-500 text-sm mb-6">
          La página que buscas no existe o fue movida. Verifica la URL o regresa al dashboard.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al dashboard
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
