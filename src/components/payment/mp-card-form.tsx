"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

/**
 * MercadoPago CardForm (Checkout API). Card number, expiry and CVV render
 * inside MP-hosted iframes — raw card data never touches our page, our state
 * or our server; we only ever see the single-use token.
 */

interface CardFormData {
  token: string
  paymentMethodId: string
  issuerId: string
  installments: string
  identificationType: string
  identificationNumber: string
}

interface MpCardFormInstance {
  getCardFormData(): CardFormData
  unmount(): void
}

interface MpInstance {
  cardForm(config: unknown): MpCardFormInstance
}

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MpInstance
  }
}

let sdkPromise: Promise<unknown> | null = null

function loadSdk(): Promise<unknown> {
  sdkPromise ??= import("@mercadopago/sdk-js").then(({ loadMercadoPago }) => loadMercadoPago())
  return sdkPromise
}

interface MpCardFormProps {
  orderId: string
  /** Amount in store currency — display/installments only; the charge amount comes from the DB. */
  amount: number
}

const FIELD_BOX = "h-10 rounded-md border border-input bg-background px-3 py-2 [&_iframe]:h-full"
const INPUT_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function MpCardForm({ orderId, amount }: MpCardFormProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const formRef = useRef<MpCardFormInstance | null>(null)
  const mountedRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // StrictMode re-runs effects; the CardForm must only mount once.
    if (mountedRef.current) return
    mountedRef.current = true

    let cancelled = false

    async function mount() {
      await loadSdk()
      if (cancelled || !window.MercadoPago) return

      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
      if (!publicKey) {
        setError("La pasarela de pago no está configurada.")
        return
      }

      const mp = new window.MercadoPago(publicKey, { locale: "es-CO" })
      formRef.current = mp.cardForm({
        amount: String(amount),
        iframe: true,
        form: {
          id: "mp-card-form",
          cardNumber: { id: "mp-card-number", placeholder: "Número de tarjeta" },
          expirationDate: { id: "mp-card-expiration", placeholder: "MM/AA" },
          securityCode: { id: "mp-card-cvv", placeholder: "CVV" },
          cardholderName: { id: "mp-card-holder", placeholder: "Como aparece en la tarjeta" },
          issuer: { id: "mp-card-issuer" },
          installments: { id: "mp-card-installments" },
          identificationType: { id: "mp-card-doc-type" },
          identificationNumber: { id: "mp-card-doc-number", placeholder: "Número de documento" },
          cardholderEmail: { id: "mp-card-email", placeholder: "tu@email.com" },
        },
        callbacks: {
          onFormMounted: (err: unknown) => {
            if (err) setError("No se pudo cargar el formulario de pago. Recarga la página.")
            else setReady(true)
          },
          onSubmit: (event: { preventDefault(): void }) => {
            event.preventDefault()
            void submit()
          },
        },
      })
    }

    void mount()

    return () => {
      cancelled = true
      formRef.current?.unmount()
      formRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit() {
    if (!formRef.current) return
    setSubmitting(true)
    setError(null)

    try {
      const data = formRef.current.getCardFormData()
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          method: "card",
          card: {
            token: data.token,
            paymentMethodId: data.paymentMethodId,
            issuerId: data.issuerId,
            installments: Number(data.installments) || 1,
            identificationType: data.identificationType,
            identificationNumber: data.identificationNumber,
          },
        }),
      })
      const result = (await res.json()) as { status?: string; error?: string }

      if (res.ok && (result.status === "approved" || result.status === "pending")) {
        if (result.status === "approved") clearCart()
        router.push(`/order-success/${orderId}`)
        return
      }
      setError(result.error ?? "No se pudo procesar el pago. Intenta de nuevo.")
      setSubmitting(false)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      setSubmitting(false)
    }
  }

  return (
    <form id="mp-card-form" className="space-y-4">
      <div>
        <label htmlFor="mp-card-holder" className="text-sm font-medium block mb-1.5">
          Titular de la tarjeta
        </label>
        <input id="mp-card-holder" className={INPUT_CLASS} autoComplete="cc-name" />
      </div>

      <div>
        <span className="text-sm font-medium block mb-1.5">Número de tarjeta</span>
        <div id="mp-card-number" className={FIELD_BOX} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium block mb-1.5">Vencimiento</span>
          <div id="mp-card-expiration" className={FIELD_BOX} />
        </div>
        <div>
          <span className="text-sm font-medium block mb-1.5">CVV</span>
          <div id="mp-card-cvv" className={FIELD_BOX} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="mp-card-doc-type" className="text-sm font-medium block mb-1.5">
            Tipo de documento
          </label>
          <select id="mp-card-doc-type" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="mp-card-doc-number" className="text-sm font-medium block mb-1.5">
            Documento
          </label>
          <input id="mp-card-doc-number" className={INPUT_CLASS} inputMode="numeric" />
        </div>
      </div>

      <div>
        <label htmlFor="mp-card-email" className="text-sm font-medium block mb-1.5">
          Email
        </label>
        <input id="mp-card-email" type="email" className={INPUT_CLASS} autoComplete="email" />
      </div>

      <div>
        <label htmlFor="mp-card-installments" className="text-sm font-medium block mb-1.5">
          Cuotas
        </label>
        <select id="mp-card-installments" className={INPUT_CLASS} />
      </div>

      {/* MP resolves the issuer automatically; kept hidden but present for the SDK. */}
      <select id="mp-card-issuer" className="hidden" aria-hidden="true" tabIndex={-1} />

      {error && (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={!ready || submitting}>
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            Procesando pago…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
            Pagar ahora
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Procesado de forma segura por MercadoPago. No almacenamos los datos de tu tarjeta.
      </p>
    </form>
  )
}
