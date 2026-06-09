"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImageUploadField } from "@/components/admin/media/image-upload-field"

export interface CategoryFormData {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  imageAlt: string | null
  metaTitle: string | null
  metaDescription: string | null
  order: number
  isActive: boolean
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CategoryForm({ category }: { category?: CategoryFormData }) {
  const router = useRouter()
  const isEditing = !!category

  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image: category?.image ?? "",
    imageAlt: category?.imageAlt ?? "",
    metaTitle: category?.metaTitle ?? "",
    metaDescription: category?.metaDescription ?? "",
    order: category?.order?.toString() ?? "0",
    isActive: category?.isActive ?? true,
  })
  // Track whether the slug was hand-edited so we stop auto-deriving it.
  const [slugTouched, setSlugTouched] = useState(isEditing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleName(value: string) {
    setForm((f) => ({ ...f, name: value, slug: slugTouched ? f.slug : slugify(value) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const body = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      imageAlt: form.imageAlt.trim() || null,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      order: parseInt(form.order, 10) || 0,
      isActive: form.isActive,
    }

    const url = isEditing ? `/api/admin/categories/${category!.id}` : "/api/admin/categories"
    const res = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Error al guardar la categoría")
      return
    }
    router.push("/admin/categorias")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Información</h2>

          <Field label="Nombre *">
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => handleName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Slug *">
            <input
              required
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setField("slug", e.target.value)
              }}
              className={inputClass}
              placeholder="bebes"
            />
            <p className="text-xs text-slate-400 mt-1">URL: /category/{form.slug || "…"}</p>
          </Field>

          <Field label="Descripción">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Imagen">
            <ImageUploadField
              slot="category"
              value={form.image}
              onChange={(url) => setField("image", url)}
            />
          </Field>

          <Field label="Texto alternativo de la imagen (alt)">
            <input
              type="text"
              value={form.imageAlt}
              onChange={(e) => setField("imageAlt", e.target.value)}
              placeholder="Descripción de la imagen (vacío = usar el nombre de la categoría)"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Orden">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setField("order", e.target.value)}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-3 cursor-pointer pt-7">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setField("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-900">
                Activa (visible en la tienda)
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">SEO</h2>
          <Field label="Meta título">
            <input
              type="text"
              value={form.metaTitle}
              onChange={(e) => setField("metaTitle", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Meta descripción">
            <textarea
              rows={2}
              value={form.metaDescription}
              onChange={(e) => setField("metaDescription", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear categoría"}
        </button>
        <Link
          href="/admin/categorias"
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
