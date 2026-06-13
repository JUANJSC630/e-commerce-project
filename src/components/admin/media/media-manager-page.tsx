"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, ImageOff, Loader2, RefreshCw, Trash2 } from "lucide-react"
import type { ScanResult, ScannedFile } from "@/lib/media-manager"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Tab = "all" | "used" | "orphan"
const PER_PAGE = 25

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const RELATIVE = new Intl.RelativeTimeFormat("es", { numeric: "auto" })
function relativeTime(ms: number): string {
  const diffDays = Math.round((ms - Date.now()) / 86_400_000)
  if (diffDays === 0) return "hoy"
  if (Math.abs(diffDays) < 30) return RELATIVE.format(diffDays, "day")
  return RELATIVE.format(Math.round(diffDays / 30), "month")
}

export function MediaManagerPage({ initialScan }: { initialScan: ScanResult }) {
  const [scan, setScan] = useState(initialScan)
  const [tab, setTab] = useState<Tab>("all")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const filtered = useMemo(() => {
    if (tab === "orphan") return scan.files.filter((f) => f.isOrphan)
    if (tab === "used") return scan.files.filter((f) => !f.isOrphan)
    return scan.files
  }, [scan.files, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageFiles = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const selectedFiles = scan.files.filter((f) => selected.has(f.key))
  const selectedSize = selectedFiles.reduce((sum, f) => sum + f.size, 0)
  const selectedInUse = selectedFiles.filter((f) => !f.isOrphan)

  function changeTab(next: Tab) {
    setTab(next)
    setPage(1)
  }

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function selectAllOrphans() {
    setSelected(new Set(scan.files.filter((f) => f.isOrphan).map((f) => f.key)))
  }

  async function refresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/media/scan")
      if (!res.ok) throw new Error()
      setScan(await res.json())
      setSelected(new Set())
    } catch {
      toast.error("No se pudo actualizar el escaneo")
    } finally {
      setRefreshing(false)
    }
  }

  async function deleteKeys(keys: string[]) {
    if (keys.length === 0) return
    setDeleting(true)
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      })
      if (!res.ok) throw new Error()
      const { deleted, skipped }: { deleted: number; skipped: string[] } = await res.json()
      toast.success(
        `${deleted} archivo${deleted === 1 ? "" : "s"} eliminado${deleted === 1 ? "" : "s"}` +
          (skipped.length
            ? ` · ${skipped.length} en uso omitido${skipped.length === 1 ? "" : "s"}`
            : ""),
      )
      await refresh()
    } catch {
      toast.error("No se pudieron eliminar los archivos")
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "Todos", count: scan.totalFiles },
    { value: "used", label: "En uso", count: scan.totalFiles - scan.orphanCount },
    { value: "orphan", label: "Huérfanos", count: scan.orphanCount },
  ]

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">
        <span>
          <strong className="text-slate-900">{scan.totalFiles}</strong> archivos
        </span>
        <span>·</span>
        <span>{formatBytes(scan.totalSize)}</span>
        {scan.orphanCount > 0 && (
          <>
            <span>·</span>
            <span className="text-amber-700">
              ⚠️ <strong>{scan.orphanCount}</strong> huérfanos ({formatBytes(scan.orphanSize)})
            </span>
          </>
        )}
        <button
          onClick={refresh}
          disabled={refreshing}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Tabs + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => changeTab(t.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {scan.orphanCount > 0 && (
            <button
              onClick={() => deleteKeys(scan.files.filter((f) => f.isOrphan).map((f) => f.key))}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar todos los huérfanos ({scan.orphanCount})
            </button>
          )}
          {scan.orphanCount > 0 && (
            <button
              onClick={selectAllOrphans}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Seleccionar huérfanos
            </button>
          )}
          {selected.size > 0 && (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar seleccionados ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {pageFiles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
          <ImageOff className="h-7 w-7" />
          <p className="text-sm">No hay archivos en esta vista</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {pageFiles.map((file) => (
            <MediaCard
              key={file.key}
              file={file}
              selected={selected.has(file.key)}
              onToggle={() => toggle(file.key)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {(safePage - 1) * PER_PAGE + 1}–
            {Math.min(safePage * PER_PAGE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {confirmOpen && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar {selected.size} archivos</AlertDialogTitle>
              <AlertDialogDescription>
                Se liberarán {formatBytes(selectedSize)} del CDN. Esta acción no se puede deshacer.
                {selectedInUse.length > 0 && (
                  <span className="mt-2 block font-medium text-amber-700">
                    ⚠️ {selectedInUse.length} de los seleccionados están en uso y se omitirán
                    automáticamente.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmOpen(false)} disabled={deleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteKeys([...selected])}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

function MediaCard({
  file,
  selected,
  onToggle,
}: {
  file: ScannedFile
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition ${selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200"}`}
    >
      <div className="relative aspect-square bg-slate-50">
        <Image src={file.url} alt={file.name} fill sizes="200px" className="object-cover" />
        <label className="absolute left-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-md bg-white/90 shadow">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="h-4 w-4 accent-indigo-600"
          />
        </label>
        {file.isOrphan && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Huérfano
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-xs font-medium text-slate-800" title={file.name}>
          {file.name}
        </p>
        <p className="text-[11px] text-slate-400">
          {formatBytes(file.size)} · {relativeTime(file.uploadedAt)}
        </p>
        {file.usedBy.length > 0 ? (
          <p
            className="text-[11px] text-slate-500"
            title={file.usedBy.map((u) => `${u.entity}: ${u.entityName}`).join(", ")}
          >
            Usado en: {file.usedBy.map((u) => `${u.entity} ${u.entityName}`).join(", ")}
          </p>
        ) : (
          <p className="text-[11px] text-amber-600">Sin referencias</p>
        )}
      </div>
    </div>
  )
}
