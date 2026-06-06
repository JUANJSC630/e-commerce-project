"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"
import type { AdminCategory } from "@/lib/categories"

interface CategoriesTableProps {
  categories: AdminCategory[]
  canEdit: boolean
  canDelete: boolean
}

export function CategoriesTable({ categories, canEdit, canDelete }: CategoriesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"? Sus productos quedarán sin categoría.`)) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    if (res.ok) startTransition(() => router.refresh())
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
        No hay categorías todavía.
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${isPending ? "opacity-60" : ""}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium text-center">Productos</th>
              <th className="px-4 py-3 font-medium text-center">Estado</th>
              {(canEdit || canDelete) && (
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr
                key={c.id}
                className={i !== categories.length - 1 ? "border-b border-slate-100" : ""}
              >
                <td className="px-4 py-3 text-slate-400">{c.order}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-center text-slate-500">{c.productCount}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}
                  >
                    {c.isActive ? "Activa" : "Oculta"}
                  </span>
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <Link
                          href={`/admin/categorias/${c.id}`}
                          aria-label={`Editar ${c.name}`}
                          className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          aria-label={`Eliminar ${c.name}`}
                          className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
