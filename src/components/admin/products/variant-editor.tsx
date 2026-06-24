"use client"

import { Plus, Trash2 } from "lucide-react"
import { ImageUploadField } from "@/components/admin/media/image-upload-field"

/** One editable variant row in the admin form (all values as form strings). */
export interface VariantRow {
  /** Present when editing an existing variant; absent for newly added rows. */
  id?: string
  size: string
  color: string
  sku: string
  /** Empty string = inherit the product price. */
  price: string
  stock: string
  /** Empty string = use the product cover. */
  imageUrl: string
}

export function emptyVariant(): VariantRow {
  return { size: "", color: "", sku: "", price: "", stock: "0", imageUrl: "" }
}

interface VariantEditorProps {
  value: VariantRow[]
  onChange: (rows: VariantRow[]) => void
  /** Shown as the price placeholder so the admin knows the inherited value. */
  basePrice: string
}

/**
 * Admin editor for a product's purchasable variants (size×color). Each row has
 * its own stock, optional price override (blank = inherits the product price),
 * SKU and image. When a product has no variants the product-level stock/price
 * still apply, so this is purely additive.
 */
export function VariantEditor({ value, onChange, basePrice }: VariantEditorProps) {
  function update(index: number, patch: Partial<VariantRow>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-sm text-slate-400">
          Sin variantes. El producto usa el stock y precio generales de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((row, i) => (
            <li
              key={row.id ?? `new-${i}`}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <LabeledInput
                  label="Talla"
                  value={row.size}
                  onChange={(v) => update(i, { size: v })}
                  placeholder="2 años"
                />
                <LabeledInput
                  label="Color"
                  value={row.color}
                  onChange={(v) => update(i, { color: v })}
                  placeholder="Rosa"
                />
                <LabeledInput
                  label="SKU"
                  value={row.sku}
                  onChange={(v) => update(i, { sku: v })}
                  placeholder="VF-R2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <LabeledInput
                    label="Precio"
                    type="number"
                    value={row.price}
                    onChange={(v) => update(i, { price: v })}
                    placeholder={basePrice || "Hereda"}
                  />
                  <LabeledInput
                    label="Stock"
                    type="number"
                    value={row.stock}
                    onChange={(v) => update(i, { stock: v })}
                  />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <span className="block text-xs font-medium text-slate-500 mb-1">Imagen</span>
                  <ImageUploadField
                    slot="product"
                    value={row.imageUrl || "/placeholder.svg"}
                    onChange={(url) =>
                      update(i, { imageUrl: url === "/placeholder.svg" ? "" : url })
                    }
                    previewClassName="w-16 aspect-[3/4]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Quitar variante"
                  className="mt-5 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onChange([...value, emptyVariant()])}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Agregar variante
      </button>
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
      />
    </label>
  )
}
