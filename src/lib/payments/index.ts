import "server-only"

import type { PaymentProvider } from "./types"
import { mockProvider } from "./mock-provider"
import { mercadoPagoProvider } from "./mercadopago/provider"

export type {
  CreateCheckoutInput,
  PaymentCheckout,
  PaymentProvider,
  OnsitePaymentProvider,
  PaymentResult,
  PaymentBank,
  GatewayStatus,
} from "./types"
export { isOnsiteProvider } from "./types"

/**
 * Selects the active payment provider from `PAYMENT_PROVIDER`. Defaults to the
 * mock simulator so a fresh clone works without gateway credentials; set
 * PAYMENT_PROVIDER=mercadopago (plus its keys) to charge for real. Future
 * providers (wompi, stripe) plug in as new cases - nothing else changes.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "mercadopago":
      return mercadoPagoProvider
    case "mock":
    default:
      return mockProvider
  }
}

/** True when payments are simulated (used to gate the mock-only endpoints). */
export function isMockPaymentsEnabled(): boolean {
  return getPaymentProvider().name === "mock"
}
