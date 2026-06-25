import "server-only"

import type { Discount, DiscountType, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Discount validation + application.
 *
 * The server is the single source of truth: a code entered at checkout is
 * re-validated here against the database (active, within its window, under its
 * redemption cap, meeting the minimum subtotal) and the amount is recomputed -
 * the client preview can never set the actual discount.
 */

export type DiscountErrorCode =
  | "NOT_FOUND"
  | "INACTIVE"
  | "NOT_STARTED"
  | "EXPIRED"
  | "MAX_REDEMPTIONS"
  | "MIN_SUBTOTAL"

const ERROR_MESSAGES: Record<DiscountErrorCode, string> = {
  NOT_FOUND: "El código no existe",
  INACTIVE: "El código no está activo",
  NOT_STARTED: "El código aún no está disponible",
  EXPIRED: "El código ya expiró",
  MAX_REDEMPTIONS: "El código alcanzó su límite de usos",
  MIN_SUBTOTAL: "El pedido no alcanza el mínimo para este código",
}

export interface DiscountApplication {
  code: string
  type: DiscountType
  /** Amount taken off the order total (off subtotal, or the shipping cost when free shipping). */
  amount: number
  /** True when the code zeroes the shipping cost. */
  freeShipping: boolean
}

/** Codes are case-insensitive: stored and compared uppercase, trimmed. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

/** Money rounded to whole units (the store uses integer COP). */
function round(n: number): number {
  return Math.round(n)
}

/**
 * Computes the discount an active code yields for the given amounts. Pure - the
 * caller decides whether the code is allowed to be applied (see `validateDiscount`).
 */
export function computeDiscount(
  discount: Pick<Discount, "code" | "type" | "value">,
  subtotal: number,
  shippingCost: number,
): DiscountApplication {
  switch (discount.type) {
    case "PERCENTAGE":
      return {
        code: discount.code,
        type: discount.type,
        amount: round(subtotal * (discount.value / 100)),
        freeShipping: false,
      }
    case "FIXED":
      return {
        code: discount.code,
        type: discount.type,
        amount: Math.min(round(discount.value), subtotal),
        freeShipping: false,
      }
    case "FREE_SHIPPING":
      return { code: discount.code, type: discount.type, amount: shippingCost, freeShipping: true }
  }
}

/** Returns the error code if the discount can't be applied right now, else null. */
export function checkDiscountUsable(
  discount: Pick<
    Discount,
    "isActive" | "startsAt" | "endsAt" | "maxRedemptions" | "redemptions" | "minSubtotal"
  >,
  subtotal: number,
  now = new Date(),
): DiscountErrorCode | null {
  if (!discount.isActive) return "INACTIVE"
  if (discount.startsAt && now < discount.startsAt) return "NOT_STARTED"
  if (discount.endsAt && now > discount.endsAt) return "EXPIRED"
  if (discount.maxRedemptions !== null && discount.redemptions >= discount.maxRedemptions) {
    return "MAX_REDEMPTIONS"
  }
  if (discount.minSubtotal !== null && subtotal < discount.minSubtotal) return "MIN_SUBTOTAL"
  return null
}

export type ValidateResult =
  | { ok: true; application: DiscountApplication }
  | { ok: false; code: DiscountErrorCode; message: string }

/**
 * Read-only validation for the checkout preview. Looks up the code, checks it's
 * usable for `subtotal`, and returns the computed amount. Does NOT consume a
 * redemption - that happens atomically when the order is created.
 */
export async function validateDiscount(
  rawCode: string,
  subtotal: number,
  shippingCost: number,
): Promise<ValidateResult> {
  const code = normalizeCode(rawCode)
  if (!code) return { ok: false, code: "NOT_FOUND", message: ERROR_MESSAGES.NOT_FOUND }

  const discount = await prisma.discount.findUnique({ where: { code } })
  if (!discount) return { ok: false, code: "NOT_FOUND", message: ERROR_MESSAGES.NOT_FOUND }

  const error = checkDiscountUsable(discount, subtotal)
  if (error) return { ok: false, code: error, message: ERROR_MESSAGES[error] }

  return { ok: true, application: computeDiscount(discount, subtotal, shippingCost) }
}

/**
 * Re-validates inside an order transaction and atomically consumes one
 * redemption with a guarded update (so a capped code can't be over-redeemed by
 * concurrent checkouts). Returns the application, or null when the code is no
 * longer usable - the caller treats that as "no discount" rather than failing
 * the whole order.
 */
export async function consumeDiscountInTx(
  tx: Prisma.TransactionClient,
  rawCode: string,
  subtotal: number,
  shippingCost: number,
): Promise<DiscountApplication | null> {
  const code = normalizeCode(rawCode)
  if (!code) return null

  const discount = await tx.discount.findUnique({ where: { code } })
  if (!discount) return null
  if (checkDiscountUsable(discount, subtotal)) return null

  // Guarded increment: only consumes a redemption while the cap allows it.
  const { count } = await tx.discount.updateMany({
    where:
      discount.maxRedemptions === null
        ? { id: discount.id }
        : { id: discount.id, redemptions: { lt: discount.maxRedemptions } },
    data: { redemptions: { increment: 1 } },
  })
  if (count === 0) return null

  return computeDiscount(discount, subtotal, shippingCost)
}

const EDITABLE_FIELDS = [
  "code",
  "type",
  "value",
  "minSubtotal",
  "maxRedemptions",
  "isActive",
  "startsAt",
  "endsAt",
] as const

/** Whitelists the admin-editable discount fields and normalizes the code. */
export function pickDiscountInput(body: unknown): Prisma.DiscountUncheckedCreateInput {
  const source = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
  const data: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in source) data[field] = source[field]
  }
  if (typeof data.code === "string") data.code = normalizeCode(data.code)
  return data as Prisma.DiscountUncheckedCreateInput
}
