/**
 * Analytics dispatch (client). Thin wrapper over GA4 (`gtag`) and Meta Pixel
 * (`fbq`) so call sites fire one semantic event and we map it to each provider.
 * No-ops when a provider isn't configured, so it's always safe to call.
 *
 * IDs come from env vars (deploy-level config):
 *   NEXT_PUBLIC_GA_ID         — GA4 measurement id (G-XXXXXXX)
 *   NEXT_PUBLIC_META_PIXEL_ID — Meta Pixel id
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""
export const analyticsEnabled = Boolean(GA_ID || META_PIXEL_ID)

type Gtag = (...args: unknown[]) => void
type Fbq = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: Gtag
    fbq?: Fbq
  }
}

function gtag(...args: unknown[]): void {
  if (typeof window !== "undefined" && window.gtag) window.gtag(...args)
}

function fbq(event: string, name: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && window.fbq) window.fbq(event, name, params)
}

/** SPA page view — GA4 `page_view` + Meta `PageView`. */
export function trackPageView(url: string): void {
  if (GA_ID) gtag("event", "page_view", { page_path: url })
  if (META_PIXEL_ID) fbq("track", "PageView")
}

export interface EcommerceItem {
  id: string
  name: string
  price: number
  quantity?: number
  category?: string
}

function gaItems(items: EcommerceItem[]) {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity ?? 1,
    item_category: i.category,
  }))
}

function pixelContents(items: EcommerceItem[]) {
  return items.map((i) => ({ id: i.id, quantity: i.quantity ?? 1, item_price: i.price }))
}

function value(items: EcommerceItem[]): number {
  return items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
}

const CURRENCY = "COP"

/** Product detail viewed — GA4 `view_item` + Meta `ViewContent`. */
export function trackViewItem(item: EcommerceItem): void {
  if (GA_ID)
    gtag("event", "view_item", { currency: CURRENCY, value: value([item]), items: gaItems([item]) })
  if (META_PIXEL_ID)
    fbq("track", "ViewContent", {
      currency: CURRENCY,
      value: value([item]),
      contents: pixelContents([item]),
    })
}

/** Added to cart — GA4 `add_to_cart` + Meta `AddToCart`. */
export function trackAddToCart(item: EcommerceItem): void {
  if (GA_ID)
    gtag("event", "add_to_cart", {
      currency: CURRENCY,
      value: value([item]),
      items: gaItems([item]),
    })
  if (META_PIXEL_ID)
    fbq("track", "AddToCart", {
      currency: CURRENCY,
      value: value([item]),
      contents: pixelContents([item]),
    })
}

/** Checkout started — GA4 `begin_checkout` + Meta `InitiateCheckout`. */
export function trackBeginCheckout(items: EcommerceItem[]): void {
  if (GA_ID)
    gtag("event", "begin_checkout", {
      currency: CURRENCY,
      value: value(items),
      items: gaItems(items),
    })
  if (META_PIXEL_ID)
    fbq("track", "InitiateCheckout", {
      currency: CURRENCY,
      value: value(items),
      contents: pixelContents(items),
    })
}

/** Purchase completed — GA4 `purchase` + Meta `Purchase`. */
export function trackPurchase(orderId: string, total: number, items: EcommerceItem[]): void {
  if (GA_ID)
    gtag("event", "purchase", {
      transaction_id: orderId,
      currency: CURRENCY,
      value: total,
      items: gaItems(items),
    })
  if (META_PIXEL_ID)
    fbq("track", "Purchase", { currency: CURRENCY, value: total, contents: pixelContents(items) })
}
