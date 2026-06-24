"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ReviewDTO } from "@/lib/reviews"

interface ReviewsSectionProps {
  productId: string
  reviews: ReviewDTO[]
}

/** Star row: read-only display, or interactive when `onSelect` is provided. */
function Stars({
  value,
  onSelect,
  size = "w-4 h-4",
}: {
  value: number
  onSelect?: (v: number) => void
  size?: string
}) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value
        const star = (
          <Star
            className={cn(size, filled ? "text-brand-base fill-brand-base" : "text-brand-muted")}
          />
        )
        return onSelect ? (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        )
      })}
    </div>
  )
}

export function ReviewsSection({ productId, reviews }: ReviewsSectionProps) {
  const router = useRouter()
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo enviar la reseña")
      return
    }
    setComment("")
    setRating(5)
    toast.success("¡Gracias por tu reseña!")
    router.refresh()
  }

  return (
    <section className="mt-16 md:mt-20" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-display font-bold text-2xl text-brand-ink mb-6">
        Reseñas{" "}
        {reviews.length > 0 && <span className="text-muted-foreground">({reviews.length})</span>}
      </h2>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-8 lg:gap-14 items-start">
        {/* Submit form / login prompt */}
        <div className="bg-brand-surface-alt/40 rounded-2xl p-6">
          <h3 className="font-semibold text-brand-ink mb-3">Deja tu opinión</h3>
          {isLoggedIn ? (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <span className="block text-sm text-muted-foreground mb-1.5">Tu calificación</span>
                <Stars value={rating} onSelect={setRating} size="w-7 h-7" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Cuéntanos qué te pareció (opcional)"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-brand-base/40"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-cta inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Enviando…" : "Enviar reseña"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/cuenta/login" className="text-brand-base font-medium hover:underline">
                Inicia sesión
              </Link>{" "}
              para dejar una reseña de este producto.
            </p>
          )}
        </div>

        {/* Reviews list */}
        <div>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no hay reseñas. ¡Sé el primero en opinar!
            </p>
          ) : (
            <ul className="space-y-5">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-border pb-5 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-brand-ink text-sm">{r.authorName}</span>
                    <time className="text-xs text-muted-foreground" dateTime={r.createdAt}>
                      {new Date(r.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <Stars value={r.rating} />
                  {r.comment && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
