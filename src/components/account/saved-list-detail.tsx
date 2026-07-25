"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ProductCard } from "@/components/product/product-card"
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton"
import { useSettings } from "@/components/providers/settings-provider"
import { PRODUCT_GRID_CLASS } from "@/lib/theme"
import { routes } from "@/config/store.config"
import type { SavedListDetail as SavedListDetailData } from "@/lib/saved-lists"
import type { Product } from "@/lib/types"

/**
 * A saved list's products. Resolves the stored product ids to Products through
 * `/api/products?ids=` (same as favorites, so deleted products just drop out),
 * reuses `ProductCard` for consistency, and lets the customer remove items or
 * delete the whole list.
 */
export function SavedListDetail({ list }: { list: SavedListDetailData }) {
  const router = useRouter()
  const { theme } = useSettings()
  const [ids, setIds] = useState<string[]>(list.productIds)
  // `null` = still loading the catalog for the saved ids.
  const [products, setProducts] = useState<Product[] | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const idsKey = ids.join(",")
  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      return
    }
    const controller = new AbortController()
    setProducts(null)
    fetch(`/api/products?ids=${encodeURIComponent(idsKey)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Product[]>) : Promise.reject(res)))
      .then(setProducts)
      .catch((error) => {
        if (!controller.signal.aborted) setProducts([])
        return error
      })
    return () => controller.abort()
    // idsKey is the serialized identity of `ids`.
  }, [idsKey, ids.length])

  async function removeItem(productId: string) {
    const res = await fetch(`/api/cuenta/lists/${list.id}/items/${productId}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo quitar el producto")
      return
    }
    setIds((prev) => prev.filter((id) => id !== productId))
    setProducts((prev) => prev?.filter((p) => p.id !== productId) ?? prev)
    toast.success("Producto quitado de la lista")
  }

  async function deleteList() {
    setDeleting(true)
    const res = await fetch(`/api/cuenta/lists/${list.id}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo eliminar la lista")
      return
    }
    toast.success("Lista eliminada")
    router.push(`${routes.account}/listas`)
    router.refresh()
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <Link
        href={`${routes.account}/listas`}
        className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-base"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Listas guardadas
      </Link>

      <header className="mt-3 mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-ink">{list.name}</h1>
          <p className="mt-1 text-sm text-brand-muted">
            {ids.length} {ids.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmDelete(true)}
          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
        >
          Eliminar lista
        </Button>
      </header>

      {products === null ? (
        <ProductGridSkeleton count={ids.length || 4} />
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-brand-muted">
          Esta lista no tiene productos disponibles.
        </div>
      ) : (
        <div className={`grid ${PRODUCT_GRID_CLASS[theme.cardSize]} gap-4 md:gap-6`}>
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                aria-label={`Quitar ${product.name} de la lista`}
                className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-brand-muted shadow-sm hover:text-destructive"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <ProductCard product={product} priority={index < 4} />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmDelete}
        title="¿Eliminar lista?"
        description={`Se eliminará la lista "${list.name}" y sus productos.`}
        confirmLabel={deleting ? "Eliminando…" : "Eliminar"}
        destructive
        busy={deleting}
        onConfirm={deleteList}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  )
}
