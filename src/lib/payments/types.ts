export interface CreateCheckoutInput {
  orderId: string
  orderNumber: string
  /** Amount to charge, in the store's currency minor-unit-agnostic Float. */
  amount: number
  customerEmail: string | null
}

export interface PaymentCheckout {
  /** Where to send the customer to complete payment. */
  redirectUrl: string
  /** Provider-side reference (preference/session id) for reconciliation. */
  reference: string
}

/**
 * Payment gateway abstraction. The checkout depends on this interface, never on
 * a concrete provider, so MercadoPago can replace the mock by swapping the
 * implementation returned by `getPaymentProvider()` — no checkout changes.
 */
export interface PaymentProvider {
  readonly name: string
  createCheckout(input: CreateCheckoutInput): Promise<PaymentCheckout>
}
