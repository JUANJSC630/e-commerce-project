import "server-only"

import { getPaymentProvider } from "./index"
import { mpBaseUrl } from "./mercadopago/client"

/**
 * Read-only health snapshot of the active payment provider for the admin. Never
 * throws and never exposes secrets — it reports presence/mode and does a live
 * auth check against MercadoPago so the admin can see at a glance whether
 * payments are actually connected and in which mode (test vs production).
 */

export interface MercadoPagoHealth {
  mode: "test" | "production" | "unknown"
  tokenPresent: boolean
  publicKeyPresent: boolean
  webhookSecretPresent: boolean
  /** True when the access token authenticated against MercadoPago. */
  connected: boolean
  account?: { nickname?: string; siteId?: string }
  error?: string
}

export interface PaymentsHealth {
  /** Active provider name ("mock" simula, "mercadopago" cobra). */
  provider: string
  mercadopago?: MercadoPagoHealth
}

export async function getPaymentsHealth(): Promise<PaymentsHealth> {
  const provider = getPaymentProvider().name
  if (provider !== "mercadopago") return { provider }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN ?? ""
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? ""
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ""
  const mode = token.startsWith("APP_USR-")
    ? "production"
    : token.startsWith("TEST-")
      ? "test"
      : "unknown"

  const mp: MercadoPagoHealth = {
    mode,
    tokenPresent: Boolean(token),
    publicKeyPresent: Boolean(publicKey),
    webhookSecretPresent: Boolean(webhookSecret),
    connected: false,
  }

  if (!token) {
    mp.error = "Falta MERCADOPAGO_ACCESS_TOKEN"
    return { provider, mercadopago: mp }
  }

  try {
    const res = await fetch(`${mpBaseUrl()}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) {
      const data = (await res.json()) as { nickname?: string; site_id?: string }
      mp.connected = true
      mp.account = { nickname: data.nickname, siteId: data.site_id }
    } else {
      mp.error = `MercadoPago respondió HTTP ${res.status} (token inválido o sin permisos)`
    }
  } catch (err) {
    mp.error = `No se pudo contactar a MercadoPago: ${(err as Error).message}`
  }

  return { provider, mercadopago: mp }
}
