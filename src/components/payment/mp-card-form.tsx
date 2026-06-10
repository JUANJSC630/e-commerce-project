"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ChevronDown, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useFormatPrice } from "@/components/providers/settings-provider"

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

const FIELD_BOX =
  "h-11 rounded-lg border border-input bg-transparent px-3.5 py-2.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] [&_iframe]:h-full"
const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3.5 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
const SELECT_CLASS = `${INPUT_CLASS} appearance-none pr-10`

/**
 * The card iframes are cross-origin documents: they inherit nothing from our
 * stylesheet, so whatever theme is active (including dark-mode extensions
 * that rewrite the page's CSS) never reaches them. The current input colors
 * are probed from a real themed input and handed to the SDK per field.
 */
function probeFieldStyle(): Record<string, string> {
  const style: Record<string, string> = { "font-size": "14px" }
  const probe = document.getElementById("mp-card-holder")
  if (!probe) return style
  style.color = getComputedStyle(probe).color
  const placeholder = getComputedStyle(probe, "::placeholder").color
  if (placeholder) style["placeholder-color"] = placeholder
  return style
}

/** Native select dressed to match the design system (custom chevron, h-11). */
function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

export function MpCardForm({ orderId, amount }: MpCardFormProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const formatPrice = useFormatPrice()
  const formatPriceLabel = formatPrice(amount)
  const formRef = useRef<MpCardFormInstance | null>(null)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})

  /** Adds the error ring when the SDK reported the field as invalid. */
  const fieldClass = (name: string, base: string) =>
    invalid[name] ? `${base} border-destructive` : base

  useEffect(() => {
    // StrictMode runs mount→cleanup→mount: each run owns its `disposed` flag,
    // so the first (cancelled) run never creates a form and the second one
    // mounts normally. A shared "only once" ref would block the second run.
    let disposed = false

    async function mount() {
      await loadSdk()
      if (disposed || !window.MercadoPago) return

      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
      if (!publicKey) {
        setError("La pasarela de pago no está configurada.")
        return
      }

      const mp = new window.MercadoPago(publicKey, { locale: "es-CO" })
      const fieldStyle = probeFieldStyle()
      formRef.current = mp.cardForm({
        amount: String(amount),
        iframe: true,
        form: {
          id: "mp-card-form",
          cardNumber: { id: "mp-card-number", placeholder: "Número de tarjeta", style: fieldStyle },
          expirationDate: { id: "mp-card-expiration", placeholder: "MM/AA", style: fieldStyle },
          securityCode: { id: "mp-card-cvv", placeholder: "CVV", style: fieldStyle },
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
          // Fires as the customer types: clears/sets the per-field error ring.
          onValidityChange: (errors: unknown, field: string) => {
            const hasError = Array.isArray(errors) && errors.length > 0
            setInvalid((prev) => ({ ...prev, [field]: hasError }))
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
      disposed = true
      try {
        formRef.current?.unmount()
      } catch {
        /* the SDK throws if the iframes are already gone */
      }
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

      // No token means the SDK's validation failed (empty/invalid fields):
      // surface it here instead of sending a doomed request to the server.
      if (!data.token) {
        setError("Revisa los datos de la tarjeta: hay campos vacíos o inválidos.")
        setSubmitting(false)
        return
      }

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
    <form id="mp-card-form" className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="mp-card-holder" className="text-sm font-medium block">
          Titular de la tarjeta
        </label>
        <input
          id="mp-card-holder"
          className={fieldClass("cardholderName", INPUT_CLASS)}
          autoComplete="cc-name"
          placeholder="Como aparece en la tarjeta"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium block">Número de tarjeta</span>
        <div id="mp-card-number" className={fieldClass("cardNumber", FIELD_BOX)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <span className="text-sm font-medium block">Vencimiento</span>
          <div id="mp-card-expiration" className={fieldClass("expirationDate", FIELD_BOX)} />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium block">CVV</span>
          <div id="mp-card-cvv" className={fieldClass("securityCode", FIELD_BOX)} />
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-3">
        <div className="space-y-1.5 min-w-0">
          <label htmlFor="mp-card-doc-type" className="text-sm font-medium block">
            Tipo de documento
          </label>
          <SelectShell>
            <select id="mp-card-doc-type" className={SELECT_CLASS} />
          </SelectShell>
        </div>
        <div className="space-y-1.5 min-w-0">
          <label htmlFor="mp-card-doc-number" className="text-sm font-medium block">
            Número
          </label>
          <input
            id="mp-card-doc-number"
            className={fieldClass("identificationNumber", INPUT_CLASS)}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mp-card-email" className="text-sm font-medium block">
          Email
        </label>
        <input
          id="mp-card-email"
          type="email"
          className={fieldClass("cardholderEmail", INPUT_CLASS)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mp-card-installments" className="text-sm font-medium block">
          Cuotas
        </label>
        <SelectShell>
          <select id="mp-card-installments" className={SELECT_CLASS} />
        </SelectShell>
      </div>

      {/* MP resolves the issuer automatically; kept hidden but present for the SDK. */}
      <select id="mp-card-issuer" className="hidden" aria-hidden="true" tabIndex={-1} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-3 pt-1">
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 rounded-xl text-base font-semibold"
          disabled={!ready || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Procesando pago…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
              Pagar {formatPriceLabel}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          No almacenamos los datos de tu tarjeta.
        </p>
      </div>
    </form>
  )
}
