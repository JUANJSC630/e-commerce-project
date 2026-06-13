import type { Metadata } from "next"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { routes } from "@/config/store.config"
import { privatePageMetadata } from "@/lib/seo"

interface PageProps {
  searchParams: Promise<{ orderId?: string }>
}

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Pago no completado")
}

export default async function PaymentFailedPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams

  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
        <XCircle className="h-9 w-9 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="font-display font-bold text-2xl text-brand-ink">El pago no se completó</h1>
      <p className="text-brand-muted mt-2">
        No se realizó ningún cargo. Puedes intentar el pago de nuevo cuando quieras.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        {orderId ? (
          <Link
            href={`/pago/${orderId}`}
            className="px-6 py-3 rounded-xl bg-brand-base text-brand-on-base font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Intentar de nuevo
          </Link>
        ) : (
          <Link
            href={routes.cart}
            className="px-6 py-3 rounded-xl bg-brand-base text-brand-on-base font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Volver al carrito
          </Link>
        )}
        <Link
          href={routes.home}
          className="px-6 py-3 rounded-xl border border-border text-brand-ink font-medium text-center hover:bg-brand-surface transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
