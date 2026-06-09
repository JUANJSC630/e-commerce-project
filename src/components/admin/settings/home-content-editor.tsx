"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LayoutTemplate, Plus, Trash2, GripVertical } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import type { HomeContent } from "@/config/store.config"
import { SectionCard, Field, saveSection } from "./primitives"
import { ImageUploadField } from "@/components/admin/media/image-upload-field"
import { IconPicker } from "./icon-picker"

/** Moves an array item from one index to another (immutably). */
function move<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * Native HTML5 drag-and-drop reordering for an array row. The row is only
 * `draggable` while the user holds the grip handle (armed on mousedown), so the
 * text inputs inside each row stay normally selectable/editable.
 */
function useSortable<T>(items: T[], onReorder: (next: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [armed, setArmed] = useState(false)

  const rowProps = (index: number) => ({
    draggable: armed,
    onDragStart: (e: React.DragEvent) => {
      setDragIndex(index)
      e.dataTransfer.effectAllowed = "move"
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      if (dragIndex !== null && dragIndex !== index) onReorder(move(items, dragIndex, index))
      setDragIndex(null)
      setArmed(false)
    },
    onDragEnd: () => {
      setDragIndex(null)
      setArmed(false)
    },
  })

  const handleProps = {
    onMouseDown: () => setArmed(true),
    onMouseUp: () => setArmed(false),
    onMouseLeave: () => setArmed(false),
  }

  return { rowProps, handleProps, dragIndex }
}

/** Grip handle that arms a row for dragging. */
function DragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Arrastrar para reordenar"
      className="mt-6 cursor-grab p-1 text-slate-300 hover:text-slate-500 active:cursor-grabbing shrink-0"
      {...props}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
}

/** Small heading that separates the sub-blocks inside the home content card. */
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
      {children}
    </h3>
  )
}

/** Remove button for an array row. */
function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Eliminar"
      className="mt-6 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}

export function HomeContentEditor({ data }: { data: HomeContent }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Deep clone so edits never mutate the server-provided object.
  const [form, setForm] = useState<HomeContent>(() => structuredClone(data))
  const [original] = useState(() => JSON.stringify(data))
  const isDirty = JSON.stringify(form) !== original

  function patch(next: Partial<HomeContent>) {
    setForm((prev) => ({ ...prev, ...next }))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.homeContent, form)
        toast.success("Contenido del inicio actualizado")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  const { heroBanners, featuredCategories, homeFeatures, copy } = form
  const bannerSort = useSortable(heroBanners, (next) => patch({ heroBanners: next }))
  const categorySort = useSortable(featuredCategories, (next) =>
    patch({ featuredCategories: next }),
  )

  return (
    <SectionCard
      icon={LayoutTemplate}
      title="Contenido del inicio"
      onSave={handleSave}
      onReset={() => setForm(structuredClone(data))}
      isPending={isPending}
      isDirty={isDirty}
    >
      {/* ── Hero banners ── */}
      <SubHeading>Banners del hero ({heroBanners.length})</SubHeading>
      <div className="space-y-3">
        {heroBanners.map((banner, i) => (
          <div
            key={i}
            {...bannerSort.rowProps(i)}
            className={`flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition-opacity ${
              bannerSort.dragIndex === i ? "opacity-40" : ""
            }`}
          >
            <DragHandle {...bannerSort.handleProps} />
            <div className="w-44 shrink-0">
              <span className="block text-xs font-medium text-slate-600 mb-1">Imagen</span>
              <ImageUploadField
                slot="hero"
                value={banner.image}
                onChange={(url) =>
                  patch({
                    heroBanners: heroBanners.map((b, j) => (j === i ? { ...b, image: url } : b)),
                  })
                }
                emptyValue=""
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field
                label="Título"
                value={banner.title}
                onChange={(v) =>
                  patch({
                    heroBanners: heroBanners.map((b, j) => (j === i ? { ...b, title: v } : b)),
                  })
                }
              />
              <Field
                label="Descripción"
                value={banner.description}
                onChange={(v) =>
                  patch({
                    heroBanners: heroBanners.map((b, j) =>
                      j === i ? { ...b, description: v } : b,
                    ),
                  })
                }
              />
              <Field
                label="Texto del botón"
                value={banner.buttonText}
                onChange={(v) =>
                  patch({
                    heroBanners: heroBanners.map((b, j) => (j === i ? { ...b, buttonText: v } : b)),
                  })
                }
              />
              <Field
                label="Enlace del botón"
                value={banner.buttonLink}
                onChange={(v) =>
                  patch({
                    heroBanners: heroBanners.map((b, j) => (j === i ? { ...b, buttonLink: v } : b)),
                  })
                }
                placeholder="/products"
              />
              <Field
                label="Alt de la imagen"
                value={banner.imageAlt ?? ""}
                onChange={(v) =>
                  patch({
                    heroBanners: heroBanners.map((b, j) => (j === i ? { ...b, imageAlt: v } : b)),
                  })
                }
                placeholder="Vacío = usar el título"
              />
            </div>
            <RemoveButton
              onClick={() => patch({ heroBanners: heroBanners.filter((_, j) => j !== i) })}
            />
          </div>
        ))}
        <AddButton
          label="Agregar banner"
          onClick={() =>
            patch({
              heroBanners: [
                ...heroBanners,
                { title: "", description: "", image: "", buttonText: "", buttonLink: "" },
              ],
            })
          }
        />
      </div>

      {/* ── Featured categories ── */}
      <SubHeading>Categorías destacadas ({featuredCategories.length})</SubHeading>
      <div className="space-y-3">
        {featuredCategories.map((cat, i) => (
          <div
            key={i}
            {...categorySort.rowProps(i)}
            className={`flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition-opacity ${
              categorySort.dragIndex === i ? "opacity-40" : ""
            }`}
          >
            <DragHandle {...categorySort.handleProps} />
            <div className="w-44 shrink-0">
              <span className="block text-xs font-medium text-slate-600 mb-1">Imagen</span>
              <ImageUploadField
                slot="category"
                endpoint="settingsImage"
                value={cat.image}
                onChange={(url) =>
                  patch({
                    featuredCategories: featuredCategories.map((c, j) =>
                      j === i ? { ...c, image: url } : c,
                    ),
                  })
                }
                emptyValue=""
                previewClassName="w-28 aspect-square"
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field
                label="Nombre"
                value={cat.name}
                onChange={(v) =>
                  patch({
                    featuredCategories: featuredCategories.map((c, j) =>
                      j === i ? { ...c, name: v } : c,
                    ),
                  })
                }
              />
              <Field
                label="Enlace"
                value={cat.href}
                onChange={(v) =>
                  patch({
                    featuredCategories: featuredCategories.map((c, j) =>
                      j === i ? { ...c, href: v } : c,
                    ),
                  })
                }
                placeholder="/category/babies"
              />
              <Field
                label="Alt de la imagen"
                value={cat.imageAlt ?? ""}
                onChange={(v) =>
                  patch({
                    featuredCategories: featuredCategories.map((c, j) =>
                      j === i ? { ...c, imageAlt: v } : c,
                    ),
                  })
                }
                placeholder="Vacío = usar el nombre"
              />
            </div>
            <RemoveButton
              onClick={() =>
                patch({ featuredCategories: featuredCategories.filter((_, j) => j !== i) })
              }
            />
          </div>
        ))}
        <AddButton
          label="Agregar categoría destacada"
          onClick={() =>
            patch({
              featuredCategories: [...featuredCategories, { name: "", image: "", href: "" }],
            })
          }
        />
      </div>

      {/* ── Trust bar features ── */}
      <SubHeading>Tira de confianza ({homeFeatures.length})</SubHeading>
      <div className="space-y-3">
        {homeFeatures.map((feat, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <IconPicker
                label="Ícono"
                value={feat.icon}
                onChange={(v) =>
                  patch({
                    homeFeatures: homeFeatures.map((f, j) => (j === i ? { ...f, icon: v } : f)),
                  })
                }
              />
              <Field
                label="Título"
                value={feat.title}
                onChange={(v) =>
                  patch({
                    homeFeatures: homeFeatures.map((f, j) => (j === i ? { ...f, title: v } : f)),
                  })
                }
              />
              <Field
                label="Descripción"
                value={feat.description}
                onChange={(v) =>
                  patch({
                    homeFeatures: homeFeatures.map((f, j) =>
                      j === i ? { ...f, description: v } : f,
                    ),
                  })
                }
              />
            </div>
            <RemoveButton
              onClick={() => patch({ homeFeatures: homeFeatures.filter((_, j) => j !== i) })}
            />
          </div>
        ))}
        <AddButton
          label="Agregar ítem"
          onClick={() =>
            patch({
              homeFeatures: [...homeFeatures, { icon: "Package", title: "", description: "" }],
            })
          }
        />
      </div>

      {/* ── Copy / textos ── */}
      <SubHeading>Textos de las secciones</SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Field
          label="Hero: eyebrow"
          value={copy.hero.eyebrow}
          onChange={(v) => patch({ copy: { ...copy, hero: { ...copy.hero, eyebrow: v } } })}
        />
        <Field
          label="Hero: ver todo"
          value={copy.hero.viewAllLabel}
          onChange={(v) => patch({ copy: { ...copy, hero: { ...copy.hero, viewAllLabel: v } } })}
        />
        <Field
          label="Categorías: eyebrow"
          value={copy.categories.eyebrow}
          onChange={(v) =>
            patch({ copy: { ...copy, categories: { ...copy.categories, eyebrow: v } } })
          }
        />
        <Field
          label="Categorías: título"
          value={copy.categories.heading}
          onChange={(v) =>
            patch({ copy: { ...copy, categories: { ...copy.categories, heading: v } } })
          }
        />
        <Field
          label="Promesa: cita"
          value={copy.promise.quote}
          onChange={(v) => patch({ copy: { ...copy, promise: { ...copy.promise, quote: v } } })}
        />
        <Field
          label="Promesa: subtexto"
          value={copy.promise.subtext}
          onChange={(v) => patch({ copy: { ...copy, promise: { ...copy.promise, subtext: v } } })}
        />
        <Field
          label="Promesa: texto CTA"
          value={copy.promise.ctaLabel}
          onChange={(v) => patch({ copy: { ...copy, promise: { ...copy.promise, ctaLabel: v } } })}
        />
        <Field
          label="Productos: eyebrow"
          value={copy.products.eyebrow}
          onChange={(v) => patch({ copy: { ...copy, products: { ...copy.products, eyebrow: v } } })}
        />
        <Field
          label="Productos: título"
          value={copy.products.heading}
          onChange={(v) => patch({ copy: { ...copy, products: { ...copy.products, heading: v } } })}
        />
        <Field
          label="Productos: ver todo"
          value={copy.products.viewAllLabel}
          onChange={(v) =>
            patch({ copy: { ...copy, products: { ...copy.products, viewAllLabel: v } } })
          }
        />
        <Field
          label="Productos: ver todo (móvil)"
          value={copy.products.viewAllMobileLabel}
          onChange={(v) =>
            patch({ copy: { ...copy, products: { ...copy.products, viewAllMobileLabel: v } } })
          }
        />
        <Field
          label="Productos: cantidad a mostrar"
          type="number"
          value={String(copy.products.limit)}
          onChange={(v) =>
            patch({
              copy: { ...copy, products: { ...copy.products, limit: Number(v) || 0 } },
            })
          }
        />
      </div>
    </SectionCard>
  )
}
