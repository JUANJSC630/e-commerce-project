import "server-only"

import type { PaymentProvider } from "./types"
import { mockProvider } from "./mock-provider"

export type { CreateCheckoutInput, PaymentCheckout, PaymentProvider } from "./types"

/**
 * Selects the active payment provider from `PAYMENT_PROVIDER` (defaults to the
 * mock simulator). Add the MercadoPago case here in Bloque 10 — nothing else in
 * the checkout flow needs to change.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    // case "mercadopago":
    //   return mercadoPagoProvider
    case "mock":
    default:
      return mockProvider
  }
}

/** True when payments are simulated (used to gate the mock-only endpoints). */
export function isMockPaymentsEnabled(): boolean {
  return getPaymentProvider().name === "mock"
}
