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
 * implementation returned by `getPaymentProvider()` - no checkout changes.
 */
export interface PaymentProvider {
  readonly name: string
  createCheckout(input: CreateCheckoutInput): Promise<PaymentCheckout>
}

// ─── On-site charging (Checkout API style) ──────────────────────────────────

/** Normalized settlement outcome across providers. */
export type GatewayStatus = "approved" | "pending" | "rejected"

export interface CardPayer {
  email: string
  identificationType: string
  identificationNumber: string
}

export interface CreateCardPaymentInput {
  orderId: string
  orderNumber: string
  /** Amount in the store currency (same unit as Order.total). */
  amount: number
  /** Single-use card token produced by the provider's browser SDK. */
  token: string
  installments: number
  paymentMethodId: string
  issuerId?: string
  payer: CardPayer
  /** Stored on the order before charging; sent as the gateway idempotency key. */
  idempotencyKey: string
}

export interface PsePayer {
  email: string
  firstName: string
  lastName: string
  identificationType: string
  identificationNumber: string
  phone: { areaCode: string; number: string }
  address: { street: string; city: string; state: string; zipCode: string }
}

export interface CreatePsePaymentInput {
  orderId: string
  orderNumber: string
  amount: number
  /** Where the bank sends the customer back after the transfer. */
  callbackUrl: string
  /** Bank id from `getBanks()`. */
  financialInstitution: string
  entityType: "individual" | "association"
  payer: PsePayer
  idempotencyKey: string
}

export interface PaymentResult {
  /** Payment id in the provider's system. */
  providerId: string
  /** Our order id, echoed back by the provider (external_reference). */
  orderReference?: string
  status: GatewayStatus
  /** Provider-internal detail - log it, never show it to the customer. */
  statusDetail: string
  /** Curated customer-facing message for rejections (safe to display). */
  declineMessage?: string
  /** PSE: bank URL the customer must be redirected to. */
  redirectUrl?: string
  /** Verbatim provider response, persisted to PaymentLog for audit. */
  raw: unknown
}

export interface PaymentBank {
  id: string
  name: string
}

/**
 * Providers that charge on-site (card tokens, PSE) instead of redirecting to a
 * hosted checkout. The payment page renders their UI; these methods do the
 * server side. Webhook parsing/verification lives with each provider's route.
 */
export interface OnsitePaymentProvider extends PaymentProvider {
  createCardPayment(input: CreateCardPaymentInput): Promise<PaymentResult>
  createPsePayment(input: CreatePsePaymentInput): Promise<PaymentResult>
  getPaymentStatus(providerId: string): Promise<PaymentResult>
  getBanks(): Promise<PaymentBank[]>
}

/** Narrowing helper: does the active provider charge on-site? */
export function isOnsiteProvider(p: PaymentProvider): p is OnsitePaymentProvider {
  return "createCardPayment" in p
}
