import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * MercadoPago webhook signature check (HMAC-SHA256).
 *
 * MP sends `x-signature: ts=<unix>,v1=<hex>` and `x-request-id`, and signs the
 * manifest `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` with the app's
 * webhook secret. We rebuild the manifest and compare in constant time.
 */
export function verifyMpSignature(input: {
  dataId: string
  xSignature: string | null
  xRequestId: string | null
  secret: string
}): boolean {
  const { dataId, xSignature, xRequestId, secret } = input
  if (!xSignature || !xRequestId || !dataId) return false

  const parts = new Map(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.split("=")
      return [key.trim(), rest.join("=").trim()] as const
    }),
  )
  const ts = parts.get("ts")
  const v1 = parts.get("v1")
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac("sha256", secret).update(manifest).digest("hex")

  const a = Buffer.from(expected, "hex")
  const b = Buffer.from(v1, "hex")
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Payload MP POSTs to the webhook (only what we read). */
export interface MpWebhookBody {
  type?: string
  action?: string
  data?: { id?: string | number }
}

/**
 * The payment id MP is notifying about. MP puts it both in the JSON body and
 * the `data.id` query param (the param is what's signed, so prefer it).
 */
export function extractDataId(url: URL, body: MpWebhookBody | null): string {
  return url.searchParams.get("data.id") ?? String(body?.data?.id ?? "")
}
