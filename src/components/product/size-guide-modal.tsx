"use client"

import { useEffect, useState } from "react"
import { Ruler, X } from "lucide-react"

interface Row {
  size: string
  age: string
  height: string
  weight: string
}

const BABIES: Row[] = [
  { size: "0-3 m", age: "0-3 meses", height: "50-60 cm", weight: "3-6 kg" },
  { size: "3-6 m", age: "3-6 meses", height: "60-67 cm", weight: "6-8 kg" },
  { size: "6-9 m", age: "6-9 meses", height: "67-72 cm", weight: "8-9 kg" },
  { size: "9-12 m", age: "9-12 meses", height: "72-76 cm", weight: "9-11 kg" },
  { size: "12-18 m", age: "12-18 meses", height: "76-82 cm", weight: "11-12 kg" },
  { size: "18-24 m", age: "18-24 meses", height: "82-88 cm", weight: "12-13 kg" },
]

const KIDS: Row[] = [
  { size: "2", age: "2 años", height: "88-94 cm", weight: "13-14 kg" },
  { size: "3", age: "3 años", height: "94-102 cm", weight: "14-16 kg" },
  { size: "4", age: "4 años", height: "102-108 cm", weight: "16-18 kg" },
  { size: "6", age: "5-6 años", height: "108-118 cm", weight: "18-21 kg" },
  { size: "8", age: "7-8 años", height: "118-128 cm", weight: "21-26 kg" },
  { size: "10", age: "9-10 años", height: "128-138 cm", weight: "26-32 kg" },
  { size: "12", age: "11-12 años", height: "138-148 cm", weight: "32-40 kg" },
]

function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div>
      <h3 className="font-display font-semibold text-brand-ink mb-2">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface-alt/60 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Talla</th>
              <th className="px-3 py-2 font-medium">Edad</th>
              <th className="px-3 py-2 font-medium">Estatura</th>
              <th className="px-3 py-2 font-medium">Peso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.size}>
                <td className="px-3 py-2 font-semibold text-brand-ink">{r.size}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.age}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.height}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** "Guía de tallas" trigger + modal with the kids sizing chart. */
export function SizeGuideModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-base hover:underline"
      >
        <Ruler className="h-4 w-4" aria-hidden="true" />
        Guía de tallas
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-brand-surface-alt"
            >
              <X className="h-4 w-4" />
            </button>
            <h2
              id="size-guide-title"
              className="font-display font-bold text-xl text-brand-ink mb-1"
            >
              Guía de tallas
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Medidas de referencia. Si tu pequeño está entre dos tallas, elige la mayor.
            </p>
            <div className="space-y-6">
              <Table title="Bebés" rows={BABIES} />
              <Table title="Niños y niñas" rows={KIDS} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
