/**
 * Shipping-rate and tax (IVA) resolution, shared by the order server logic and
 * the checkout preview so both compute identical amounts.
 */

export interface ShippingZone {
  name: string
  states: string[]
  cost: number
}

export interface ShippingConfig {
  freeThreshold: number
  standardCost: number
  zones?: ShippingZone[]
  taxRate?: number
  taxIncluded?: boolean
}

/** Case/accents-insensitive compare so "Bogotá" matches "bogota". */
function norm(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

/**
 * Resolves the shipping cost for an order. Free above the threshold; otherwise
 * the first zone whose `states` includes the destination, falling back to the
 * standard cost when no zone matches (or no destination is known yet).
 */
export function resolveShippingCost(
  subtotal: number,
  state: string | undefined,
  config: ShippingConfig,
): number {
  if (subtotal > config.freeThreshold) return 0
  if (state && config.zones?.length) {
    const target = norm(state)
    const zone = config.zones.find((z) => z.states.some((s) => norm(s) === target))
    if (zone) return zone.cost
  }
  return config.standardCost
}

export interface TaxResult {
  /** The IVA amount on the order. */
  amount: number
  /** True when it's already inside the total (included); false when added on top. */
  included: boolean
}

/**
 * Computes the IVA for a taxable base. With `taxIncluded` the amount is the
 * portion already inside the base; otherwise it's added on top. Returns zero
 * when no rate is configured.
 */
export function computeTax(base: number, config: ShippingConfig): TaxResult {
  const rate = config.taxRate ?? 0
  const included = config.taxIncluded ?? true
  if (rate <= 0 || base <= 0) return { amount: 0, included }
  const amount = included
    ? Math.round(base - base / (1 + rate / 100))
    : Math.round(base * (rate / 100))
  return { amount, included }
}
