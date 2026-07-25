"use client"

import { MapPin, Pencil, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Address } from "@/lib/addresses"

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (address: Address) => void
  onSetDefault: (address: Address) => void
  className?: string
}

/** Read-only summary of a saved address with edit / delete / set-default actions. */
export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  className,
}: AddressCardProps) {
  const place = [address.city, address.state].filter(Boolean).join(", ")

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-brand-base" aria-hidden="true" />
          <span className="font-semibold text-brand-ink">{address.label || "Dirección"}</span>
          {address.isDefault && (
            <span className="rounded-full bg-brand-surface-alt px-2 py-0.5 text-xs font-medium text-brand-base">
              Principal
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!address.isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(address)}
              aria-label="Marcar como principal"
              title="Marcar como principal"
              className="grid h-8 w-8 place-items-center rounded-full text-brand-muted hover:bg-brand-surface-alt hover:text-brand-base"
            >
              <Star className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(address)}
            aria-label="Editar dirección"
            title="Editar"
            className="grid h-8 w-8 place-items-center rounded-full text-brand-muted hover:bg-brand-surface-alt hover:text-brand-base"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(address)}
            aria-label="Eliminar dirección"
            title="Eliminar"
            className="grid h-8 w-8 place-items-center rounded-full text-brand-muted hover:bg-brand-surface-alt hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-0.5 text-sm text-brand-muted">
        <p className="text-brand-ink">{address.address}</p>
        {place && <p>{place}</p>}
        <p>
          {address.country}
          {address.zipCode ? ` · ${address.zipCode}` : ""}
        </p>
        {address.recipientName && <p>Recibe: {address.recipientName}</p>}
        {address.phone && <p>Tel: {address.phone}</p>}
      </div>
    </div>
  )
}
