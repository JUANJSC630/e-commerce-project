"use client"

import { useEffect, useState } from "react"
import { AlertCircle, ChevronDown, Landmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

/**
 * PSE: the customer picks their bank and identifies themselves; the server
 * builds the rest of the payer (names, address, phone) from the order and
 * responds with the bank's URL to finish the transfer.
 */

const DOC_TYPES: Record<"individual" | "association", Array<{ id: string; label: string }>> = {
  individual: [
    { id: "CC", label: "Cédula de ciudadanía" },
    { id: "CE", label: "Cédula de extranjería" },
    { id: "PAS", label: "Pasaporte" },
  ],
  association: [{ id: "NIT", label: "NIT" }],
}

const FIELD_HEIGHT = "h-11 rounded-lg px-3.5 text-sm"

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-lg border border-input bg-transparent px-3.5 pr-10 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

/** Native select dressed to match the design system (custom chevron, h-11). */
function StyledSelect({
  id,
  value,
  onChange,
  children,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        className={SELECT_CLASS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

interface PseFormProps {
  orderId: string
}

export function PseForm({ orderId }: PseFormProps) {
  const [banks, setBanks] = useState<ComboboxOption[]>([])
  const [banksLoading, setBanksLoading] = useState(true)
  const [banksError, setBanksError] = useState(false)
  const [bankId, setBankId] = useState("")
  const [entityType, setEntityType] = useState<"individual" | "association">("individual")
  const [docType, setDocType] = useState("CC")
  const [docNumber, setDocNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/payments/banks")
      .then((res) => res.json())
      .then((data: { banks?: Array<{ id: string; name: string }> }) => {
        if (cancelled) return
        if (data.banks?.length) {
          setBanks(data.banks.map((bank) => ({ value: bank.id, label: bank.name })))
        } else {
          setBanksError(true)
        }
        setBanksLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setBanksError(true)
          setBanksLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleEntityChange = (value: string) => {
    const entity = value === "association" ? "association" : "individual"
    setEntityType(entity)
    setDocType(DOC_TYPES[entity][0].id)
  }

  const canSubmit = !!bankId && docNumber.trim().length >= 5 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          method: "pse",
          pse: {
            bankId,
            entityType,
            identificationType: docType,
            identificationNumber: docNumber.trim(),
          },
        }),
      })
      const result = (await res.json()) as { redirectUrl?: string; error?: string }

      if (res.ok && result.redirectUrl) {
        // Off to the bank - pse-return verifies the outcome when they're back.
        window.location.assign(result.redirectUrl)
        return
      }
      setError(result.error ?? "No se pudo iniciar el pago con PSE. Intenta de nuevo.")
      setSubmitting(false)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="pse-bank">Tu banco</Label>
        <Combobox
          id="pse-bank"
          options={banks}
          value={bankId}
          onChange={setBankId}
          placeholder="Selecciona tu banco"
          searchPlaceholder="Buscar banco…"
          emptyText="No encontramos ese banco"
          loading={banksLoading}
          disabled={banksError}
          triggerClassName={FIELD_HEIGHT}
        />
        {banksError && (
          <p className="text-sm text-destructive">
            No pudimos cargar la lista de bancos. Recarga la página o paga con tarjeta.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pse-entity">Tipo de persona</Label>
        <StyledSelect id="pse-entity" value={entityType} onChange={handleEntityChange}>
          <option value="individual">Persona natural</option>
          <option value="association">Persona jurídica</option>
        </StyledSelect>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-3">
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="pse-doc-type">Tipo de documento</Label>
          <StyledSelect id="pse-doc-type" value={docType} onChange={setDocType}>
            {DOC_TYPES[entityType].map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.label}
              </option>
            ))}
          </StyledSelect>
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="pse-doc-number">Número</Label>
          <Input
            id="pse-doc-number"
            className={FIELD_HEIGHT}
            inputMode="numeric"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="1234567890"
          />
        </div>
      </div>

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
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Conectando con tu banco…
            </>
          ) : (
            <>
              <Landmark className="w-4 h-4 mr-2" aria-hidden="true" />
              Continuar al banco
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Serás redirigido a tu banco para autorizar la transferencia.
        </p>
      </div>
    </form>
  )
}
