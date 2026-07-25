"use client"

import { useState } from "react"
import Link from "next/link"
import { ListChecks, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useSettings } from "@/components/providers/settings-provider"
import { routes } from "@/config/store.config"
import type { SavedListSummary } from "@/lib/saved-lists"

/** Account "Listas guardadas" tab: overview table of the customer's saved lists. */
export function SavedListsSection({ initialLists }: { initialLists: SavedListSummary[] }) {
  const { locale } = useSettings()
  const [lists, setLists] = useState<SavedListSummary[]>(initialLists)
  const [deleteTarget, setDeleteTarget] = useState<SavedListSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale.dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/cuenta/lists/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo eliminar la lista")
      return
    }
    setLists((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success("Lista eliminada")
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-brand-ink">Listas guardadas</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Guarda tu carrito como una lista con nombre para volver a comprarlo cuando quieras.
      </p>

      {lists.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-5 py-14 text-center">
          <div className="rounded-full bg-brand-surface-alt p-6">
            <ListChecks className="h-10 w-10 text-brand-muted" aria-hidden="true" />
          </div>
          <p className="text-brand-muted">
            Aún no tienes listas. Guarda tu carrito desde{" "}
            <Link href={routes.cart} className="font-medium text-brand-base hover:underline">
              el carrito
            </Link>{" "}
            para empezar.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-brand-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Productos</th>
                <th className="px-3 py-2 font-medium">Creada</th>
                <th className="px-3 py-2 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lists.map((list) => (
                <tr key={list.id}>
                  <td className="px-3 py-3">
                    <Link
                      href={`${routes.account}/listas/${list.id}`}
                      className="font-medium text-brand-ink hover:text-brand-base hover:underline"
                    >
                      {list.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-brand-muted">{list.itemCount}</td>
                  <td className="px-3 py-3 text-brand-muted">{formatDate(list.createdAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`${routes.account}/listas/${list.id}`}
                        className="rounded-full px-3 py-1 text-brand-base hover:bg-brand-surface-alt"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(list)}
                        aria-label={`Eliminar lista ${list.name}`}
                        className="grid h-8 w-8 place-items-center rounded-full text-brand-muted hover:bg-brand-surface-alt hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="¿Eliminar lista?"
        description={
          deleteTarget ? `Se eliminará la lista "${deleteTarget.name}" y sus productos.` : ""
        }
        confirmLabel={deleting ? "Eliminando…" : "Eliminar"}
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}
