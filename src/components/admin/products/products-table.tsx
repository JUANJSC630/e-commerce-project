"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@prisma/client"
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react"
import { isLowStock, isOutOfStock } from "@/lib/inventory"

type StockFilter = "low" | "out"

interface ProductsTableProps {
  products: Product[]
  total: number
  page: number
  perPage: number
  canEdit: boolean
  canDelete: boolean
  searchQuery?: string
  stockFilter?: StockFilter
}

const STOCK_TABS: { value?: StockFilter; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "low", label: "Stock bajo" },
  { value: "out", label: "Agotados" },
]

export function ProductsTable({
  products,
  total,
  page,
  perPage,
  canEdit,
  canDelete,
  searchQuery,
  stockFilter,
}: ProductsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchQuery ?? "")
  const [isPending, startTransition] = useTransition()
  const totalPages = Math.ceil(total / perPage)

  const [importMsg, setImportMsg] = useState<string | null>(null)

  function navigate(overrides: { q?: string; stock?: StockFilter; page?: number }) {
    const params = new URLSearchParams()
    const q = overrides.q ?? search
    const stock = "stock" in overrides ? overrides.stock : stockFilter
    if (q) params.set("q", q)
    if (stock) params.set("stock", stock)
    params.set("page", String(overrides.page ?? 1))
    startTransition(() => router.push(`/admin/productos?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ q: search, page: 1 })
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    if (res.ok) startTransition(() => router.refresh())
  }

  async function toggleField(
    id: string,
    field: "isPublished" | "isFeatured" | "isOnSale",
    current: boolean,
  ) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    })
    startTransition(() => router.refresh())
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMsg(null)
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/admin/products/import", { method: "POST", body: form })
    const data = await res.json()
    if (res.ok) {
      setImportMsg(`Importación: ${data.created} creados, ${data.updated} actualizados`)
      startTransition(() => router.refresh())
    } else {
      setImportMsg(`Error: ${data.error}`)
    }
    e.target.value = ""
  }

  return (
    <div className="space-y-4">
      {/* Search + stock filter */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex gap-1">
          {STOCK_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => navigate({ stock: tab.value, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${stockFilter === tab.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {tab.label}
            </button>
          ))}
          <span className="w-px bg-slate-200 mx-1" />
          <a
            href="/api/admin/products/export"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            download
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </a>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <Upload className="h-3.5 w-3.5" /> Importar
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="sr-only"
            />
          </label>
        </div>
      </div>
      {importMsg && (
        <p className={`text-sm px-1 ${importMsg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
          {importMsg}
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Categoría</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Precio</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Publicado</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Destacado</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Oferta</th>
                {(canEdit || canDelete) && (
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                products.map((product, i) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 transition-colors ${i !== products.length - 1 ? "border-b border-slate-100" : ""} ${isPending ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                        />
                        <span className="font-medium text-slate-900 line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      ${product.price.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle
                        value={product.isPublished}
                        disabled={!canEdit}
                        onChange={() => toggleField(product.id, "isPublished", product.isPublished)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle
                        value={product.isFeatured}
                        disabled={!canEdit}
                        onChange={() => toggleField(product.id, "isFeatured", product.isFeatured)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle
                        value={product.isOnSale}
                        disabled={!canEdit}
                        onChange={() => toggleField(product.id, "isOnSale", product.isOnSale)}
                      />
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {canEdit && (
                            <a
                              href={`/admin/productos/${product.id}`}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </a>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => navigate({ page: page - 1 })}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate({ page: page + 1 })}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (isOutOfStock(stock)) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
        Agotado
      </span>
    )
  }
  if (isLowStock(stock)) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
        Stock bajo ({stock})
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
      {stock}
    </span>
  )
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean
  onChange: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${value ? "bg-indigo-600" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  )
}
