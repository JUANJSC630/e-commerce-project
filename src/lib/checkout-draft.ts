/**
 * Client-side persistence for an in-progress checkout. Saves the shipping fields,
 * the chosen payment method and the current step to localStorage so a closed tab,
 * a refresh or an accidental navigation doesn't lose what the customer typed. The
 * draft lives only while the purchase is unfinished: it's dropped when the cart is
 * cleared (payment succeeded or the customer emptied it - see the cart provider).
 *
 * Never stores payment card data - card fields are entered later on the PCI-scoped
 * gateway page, never in this flow, so there is nothing sensitive here.
 */

const KEY = "checkout-draft-v1"

export interface CheckoutDraftShipping {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CheckoutDraft {
  currentStep: number
  shipping: CheckoutDraftShipping
  method: "card" | "pse"
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CheckoutDraft
    // Guard against shape drift / hand-edited storage.
    if (!parsed || typeof parsed !== "object" || typeof parsed.shipping !== "object") return null
    return parsed
  } catch {
    return null
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    // Storage full or unavailable (e.g. Safari private mode) - persistence is
    // best-effort and must never break the checkout.
  }
}

export function clearCheckoutDraft(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
