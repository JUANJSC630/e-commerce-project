import type { GatewayStatus, PaymentResult } from "../types"

/** Shape of MercadoPago's /v1/payments response (the fields we consume). */
export interface MpPayment {
  id: number | string
  status: string
  status_detail?: string
  external_reference?: string
  transaction_details?: { external_resource_url?: string }
}

/**
 * MP statuses → our three-state outcome. `authorized`/`in_process`/`pending`
 * all mean "not settled yet"; anything terminal-negative maps to rejected.
 */
export function toGatewayStatus(mpStatus: string): GatewayStatus {
  switch (mpStatus) {
    case "approved":
      return "approved"
    case "pending":
    case "in_process":
    case "authorized":
      return "pending"
    default:
      return "rejected"
  }
}

/**
 * Curated customer-facing messages per MP decline code. The raw status_detail
 * never reaches the browser (it can expose anti-fraud reasoning); only these
 * fixed Spanish strings do.
 */
const DECLINE_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: "La tarjeta no tiene fondos suficientes.",
  cc_rejected_bad_filled_security_code: "El código de seguridad es incorrecto.",
  cc_rejected_bad_filled_date: "La fecha de vencimiento es incorrecta.",
  cc_rejected_bad_filled_card_number: "Revisa el número de la tarjeta.",
  cc_rejected_bad_filled_other: "Revisa los datos de la tarjeta.",
  cc_rejected_call_for_authorize: "Tu banco requiere que autorices este pago.",
  cc_rejected_card_disabled: "La tarjeta está inactiva. Comunícate con tu banco.",
  cc_rejected_card_error: "No pudimos procesar la tarjeta. Intenta de nuevo.",
  cc_rejected_duplicated_payment: "Ya registramos un pago por este valor.",
  cc_rejected_max_attempts: "Alcanzaste el límite de intentos con esta tarjeta.",
}

const GENERIC_DECLINE = "El pago fue rechazado. Intenta con otra tarjeta u otro medio de pago."

export function declineMessageFor(statusDetail: string | undefined): string {
  return (statusDetail && DECLINE_MESSAGES[statusDetail]) || GENERIC_DECLINE
}

/** Normalizes an MP payment object into the provider-agnostic result. */
export function toPaymentResult(payment: MpPayment): PaymentResult {
  const status = toGatewayStatus(payment.status)
  return {
    providerId: String(payment.id),
    ...(payment.external_reference ? { orderReference: payment.external_reference } : {}),
    status,
    statusDetail: payment.status_detail ?? payment.status,
    ...(status === "rejected" ? { declineMessage: declineMessageFor(payment.status_detail) } : {}),
    ...(payment.transaction_details?.external_resource_url
      ? { redirectUrl: payment.transaction_details.external_resource_url }
      : {}),
    raw: payment,
  }
}
