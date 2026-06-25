import { LogoBadge } from "@/components/ui/logo-badge"

/**
 * Accepted payment methods as small brand-colored logo badges. Built with inline
 * marks (brand colors + wordmarks, Mastercard's iconic circles) rather than
 * third-party logo image assets — self-contained and crisp at any size.
 */
export function PaymentMethods() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-brand-surface/50 mr-1">Medios de pago:</span>
      <LogoBadge label="Visa">
        <span className="text-[13px] font-bold italic tracking-tight text-[#1434CB]">VISA</span>
      </LogoBadge>
      <LogoBadge label="Mastercard">
        <svg viewBox="0 0 32 20" className="h-4 w-auto" aria-hidden="true">
          <circle cx="13" cy="10" r="8" fill="#EB001B" />
          <circle cx="19" cy="10" r="8" fill="#F79E1B" />
          <path d="M16 4a8 8 0 000 12 8 8 0 000-12z" fill="#FF5F00" />
        </svg>
      </LogoBadge>
      <LogoBadge label="American Express">
        <span className="text-[11px] font-extrabold tracking-tight text-[#006FCF]">AMEX</span>
      </LogoBadge>
      <LogoBadge label="Mercado Pago">
        <span className="text-[11px] font-bold tracking-tight text-[#009EE3]">Mercado Pago</span>
      </LogoBadge>
      <LogoBadge label="PSE">
        <span className="text-[12px] font-extrabold tracking-tight text-[#0B4DA2]">PSE</span>
      </LogoBadge>
      <LogoBadge label="Nequi">
        <span className="text-[12px] font-extrabold tracking-tight text-[#200221]">Nequi</span>
      </LogoBadge>
    </div>
  )
}
