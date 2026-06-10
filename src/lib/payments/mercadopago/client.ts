import "server-only"

/**
 * Thin HTTP client for MercadoPago's REST API. A plain `fetch` wrapper instead
 * of the official SDK: full control over the X-Idempotency-Key header, no extra
 * dependency, and a test-only base-URL override so the E2E suite can stand in
 * for the gateway.
 */

const DEFAULT_BASE_URL = "https://api.mercadopago.com"

export function mpBaseUrl(): string {
  return process.env.MERCADOPAGO_BASE_URL ?? DEFAULT_BASE_URL
}

export function mpAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado")
  // Never let production credentials charge real cards from a dev machine.
  if (process.env.NODE_ENV !== "production" && token.startsWith("APP_USR-")) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN es de PRODUCCIÓN — usa credenciales TEST- en desarrollo",
    )
  }
  return token
}

export class MercadoPagoApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`MercadoPago API ${status}`)
    this.name = "MercadoPagoApiError"
  }
}

interface MpFetchOptions {
  method?: "GET" | "POST"
  body?: unknown
  idempotencyKey?: string
}

export async function mpFetch<T>(path: string, options: MpFetchOptions = {}): Promise<T> {
  const { method = "GET", body, idempotencyKey } = options

  const res = await fetch(`${mpBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${mpAccessToken()}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  })

  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) throw new MercadoPagoApiError(res.status, data)
  return data as T
}
