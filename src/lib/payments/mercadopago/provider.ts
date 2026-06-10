import "server-only"

import type {
  CreateCardPaymentInput,
  CreateCheckoutInput,
  CreatePsePaymentInput,
  OnsitePaymentProvider,
  PaymentBank,
  PaymentCheckout,
  PaymentResult,
} from "../types"
import { mpFetch } from "./client"
import { toPaymentResult, type MpPayment } from "./mapper"

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

function webhookUrl(): string {
  return `${appUrl()}/api/payments/webhook/mercadopago`
}

interface MpPaymentMethod {
  id: string
  financial_institutions?: Array<{ id: string; description: string }>
}

/**
 * MercadoPago via Checkout API: cards are tokenized in the browser (CardForm)
 * and charged here; PSE returns the bank's URL to redirect to. Settlement
 * truth always arrives through the webhook — these calls only initiate.
 *
 * Amounts: the store keeps COP as unit-pesos floats (same unit MP expects in
 * `transaction_amount`), so values pass through without conversion.
 */
export const mercadoPagoProvider: OnsitePaymentProvider = {
  name: "mercadopago",

  /**
   * Redirect-handoff entry point used by the checkout: payment happens on our
   * internal payment page, which renders the CardForm/PSE UI for this order.
   * There is no gateway-side object yet, hence the empty reference.
   */
  async createCheckout({ orderId }: CreateCheckoutInput): Promise<PaymentCheckout> {
    return { redirectUrl: `/pago/${orderId}`, reference: "" }
  },

  async createCardPayment(input: CreateCardPaymentInput): Promise<PaymentResult> {
    const payment = await mpFetch<MpPayment>("/v1/payments", {
      method: "POST",
      idempotencyKey: input.idempotencyKey,
      body: {
        transaction_amount: round2(input.amount),
        token: input.token,
        description: `Pedido ${input.orderNumber}`,
        installments: input.installments,
        payment_method_id: input.paymentMethodId,
        ...(input.issuerId ? { issuer_id: Number(input.issuerId) } : {}),
        payer: {
          email: input.payer.email,
          identification: {
            type: input.payer.identificationType,
            number: input.payer.identificationNumber,
          },
        },
        external_reference: input.orderId,
        notification_url: webhookUrl(),
      },
    })
    return toPaymentResult(payment)
  },

  async createPsePayment(input: CreatePsePaymentInput): Promise<PaymentResult> {
    const payment = await mpFetch<MpPayment>("/v1/payments", {
      method: "POST",
      idempotencyKey: input.idempotencyKey,
      body: {
        transaction_amount: round2(input.amount),
        description: `Pedido ${input.orderNumber}`,
        payment_method_id: "pse",
        payer: {
          entity_type: input.entityType,
          email: input.payer.email,
          first_name: input.payer.firstName,
          last_name: input.payer.lastName,
          identification: {
            type: input.payer.identificationType,
            number: input.payer.identificationNumber,
          },
          phone: { area_code: input.payer.phone.areaCode, number: input.payer.phone.number },
          address: {
            street_name: input.payer.address.street,
            city: input.payer.address.city,
            federal_unit: input.payer.address.state,
            zip_code: input.payer.address.zipCode,
          },
        },
        transaction_details: { financial_institution: input.financialInstitution },
        callback_url: input.callbackUrl,
        external_reference: input.orderId,
        notification_url: webhookUrl(),
      },
    })
    return toPaymentResult(payment)
  },

  async getPaymentStatus(providerId: string): Promise<PaymentResult> {
    const payment = await mpFetch<MpPayment>(`/v1/payments/${encodeURIComponent(providerId)}`)
    return toPaymentResult(payment)
  },

  async getBanks(): Promise<PaymentBank[]> {
    const methods = await mpFetch<MpPaymentMethod[]>("/v1/payment_methods")
    const pse = methods.find((m) => m.id === "pse")
    return (pse?.financial_institutions ?? []).map((bank) => ({
      id: bank.id,
      name: bank.description,
    }))
  },
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
