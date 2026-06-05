import type { CreateCheckoutInput, PaymentCheckout, PaymentProvider } from "./types"

/**
 * Simulated provider standing in for MercadoPago during development. Instead of
 * an external gateway it routes the customer to an internal page
 * (/pago/[orderId]) where the payment outcome can be chosen, mirroring the
 * redirect-to-provider flow of the real thing.
 */
export const mockProvider: PaymentProvider = {
  name: "mock",

  async createCheckout({ orderId }: CreateCheckoutInput): Promise<PaymentCheckout> {
    return {
      redirectUrl: `/pago/${orderId}`,
      reference: `mock_${orderId}`,
    }
  },
}
