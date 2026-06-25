"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Product, ProductImage, ProductVariant } from "@prisma/client"
import { ImageUploadField } from "@/components/admin/media/image-upload-field"
import { GalleryUploadField } from "@/components/admin/media/gallery-upload-field"
import { VariantEditor, type VariantRow } from "@/components/admin/products/variant-editor"

interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  product?: (Product & { images?: ProductImage[]; variants?: ProductVariant[] }) | null
  categories: CategoryOption[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [form, setForm] = useState({
    name: product?.name ?? "",
    price: product?.price?.toString() ?? "",
    originalPrice: product?.originalPrice?.toString() ?? "",
    image: product?.image ?? "/placeholder.svg",
    imageAlt: product?.imageAlt ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    description: product?.description ?? "",
    stock: product?.stock?.toString() ?? "0",
    sizes: product?.sizes?.join(", ") ?? "",
    colors: product?.colors?.join(", ") ?? "",
    tags: product?.tags?.join(", ") ?? "",
    isOnSale: product?.isOnSale ?? false,
    isNew: product?.isNew ?? false,
    isFeatured: product?.isFeatured ?? false,
    isPublished: product?.isPublished ?? true,
    isPreorder: product?.isPreorder ?? false,
  })

  // Extra gallery photos (ordered URLs), kept separate from the form scalar fields.
  const [gallery, setGallery] = useState<string[]>(
    (product?.images ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url),
  )

  // Purchasable variants (size×color). Empty = product uses its general stock/price.
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((v) => ({
        id: v.id,
        size: v.size ?? "",
        color: v.color ?? "",
        sku: v.sku ?? "",
        price: v.price?.toString() ?? "",
        stock: v.stock.toString(),
        imageUrl: v.imageUrl ?? "",
      })),
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const selectedCategory = categories.find((c) => c.id === form.categoryId)
    const body = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      image: form.image.trim() || "/placeholder.svg",
      imageAlt: form.imageAlt.trim() || null,
      categoryId: form.categoryId || null,
      // Legacy non-null string column, kept in sync with the chosen category.
      category: selectedCategory?.slug ?? "",
      description: form.description.trim() || null,
      stock: parseInt(form.stock, 10),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isOnSale: form.isOnSale,
      isNew: form.isNew,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
      isPreorder: form.isPreorder,
      // Gallery is a relation; the API replaces ProductImage rows from this list.
      images: gallery,
      // Variants are a relation; the API replaces ProductVariant rows. Drop fully
      // empty rows and coerce numbers (blank price = inherit → null).
      variants: variants
        .filter((v) => v.size.trim() || v.color.trim() || v.sku.trim())
        .map((v) => ({
          id: v.id,
          size: v.size.trim() || null,
          color: v.color.trim() || null,
          sku: v.sku.trim() || null,
          price: v.price.trim() ? parseFloat(v.price) : null,
          stock: parseInt(v.stock, 10) || 0,
          imageUrl: v.imageUrl.trim() || null,
        })),
    }

    const url = isEditing ? `/api/admin/products/${product!.id}` : "/api/admin/products"
    const method = isEditing ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Error al guardar el producto")
      return
    }

    router.push("/admin/productos")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Información básica</h2>

          <Field label="Nombre *">
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio *">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Precio original">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
                className={inputClass}
                placeholder="Solo si está en oferta"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={inputClass}
              >
                {categories.length === 0 && <option value="">Sin categorías</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Imagen del producto">
            <ImageUploadField
              slot="product"
              value={form.image}
              onChange={(url) => set("image", url)}
            />
          </Field>

          <Field label="Texto alternativo de la imagen (alt)">
            <input
              type="text"
              value={form.imageAlt}
              onChange={(e) => set("imageAlt", e.target.value)}
              placeholder="Descripción de la imagen (vacío = usar el nombre del producto)"
              className={inputClass}
            />
          </Field>

          <Field label="Galería (imágenes adicionales)">
            <GalleryUploadField value={gallery} onChange={setGallery} />
          </Field>

          <Field label="Descripción">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Tallas (separadas por coma)">
            <input
              type="text"
              value={form.sizes}
              onChange={(e) => set("sizes", e.target.value)}
              placeholder="XS, S, M, L, XL"
              className={inputClass}
            />
          </Field>

          <Field label="Colores (separados por coma)">
            <input
              type="text"
              value={form.colors}
              onChange={(e) => set("colors", e.target.value)}
              placeholder="Rosa, Azul, Blanco"
              className={inputClass}
            />
          </Field>

          <Field label="Tags (separados por coma)">
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="verano, algodón, unisex"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="font-semibold text-slate-900">Visibilidad y etiquetas</h2>
          {(
            [
              { field: "isPublished", label: "Publicado", desc: "Visible en la tienda" },
              {
                field: "isFeatured",
                label: "Destacado",
                desc: "Aparece en la sección de destacados",
              },
              { field: "isNew", label: "Nuevo", desc: "Muestra la etiqueta NUEVO" },
              { field: "isOnSale", label: "En oferta", desc: "Muestra la etiqueta OFERTA" },
              {
                field: "isPreorder",
                label: "Preventa",
                desc: "Permite comprar aunque no haya stock",
              },
            ] as const
          ).map(({ field, label, desc }) => (
            <label key={field} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form[field]}
                onChange={(e) => set(field, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-900">{label}</span>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <div>
          <h2 className="font-semibold text-slate-900">Variantes (talla × color)</h2>
          <p className="text-xs text-slate-400">
            Opcional. Cada variante tiene su propio stock, precio (vacío = hereda el del producto),
            SKU e imagen. Si agregas variantes, el stock y precio de la tienda se toman de ellas.
          </p>
        </div>
        <VariantEditor value={variants} onChange={setVariants} basePrice={form.price} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
        <Link
          href="/admin/productos"
          className="px-6 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
