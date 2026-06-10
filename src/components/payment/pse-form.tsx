"use client"

import { useEffect, useState } from "react"
import { Landmark, Loader2 } from "lucide-react"
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

const SELECT_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

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
        // Off to the bank — pse-return verifies the outcome when they're back.
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="pse-bank">Tu banco</Label>
        <div className="mt-1.5">
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
          />
        </div>
        {banksError && (
          <p className="text-sm text-destructive mt-1">
            No pudimos cargar la lista de bancos. Recarga la página o paga con tarjeta.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="pse-entity">Tipo de persona</Label>
        <select
          id="pse-entity"
          className={`${SELECT_CLASS} mt-1.5`}
          value={entityType}
          onChange={(e) => handleEntityChange(e.target.value)}
        >
          <option value="individual">Persona natural</option>
          <option value="association">Persona jurídica</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pse-doc-type">Tipo de documento</Label>
          <select
            id="pse-doc-type"
            className={`${SELECT_CLASS} mt-1.5`}
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {DOC_TYPES[entityType].map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="pse-doc-number">Número de documento</Label>
          <Input
            id="pse-doc-number"
            className="mt-1.5"
            inputMode="numeric"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="1234567890"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
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
    </form>
  )
}
