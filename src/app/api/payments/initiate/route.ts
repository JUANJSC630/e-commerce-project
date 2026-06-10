import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import {
  MAX_PAYMENT_ATTEMPTS,
  claimPaymentAttempt,
  getOrderPaymentInfo,
  markOrderPaid,
  recordPaymentInitiated,
} from "@/lib/orders"
import { getPaymentProvider, isOnsiteProvider } from "@/lib/payments"
import { logPaymentEvent, paymentErrorPayload } from "@/lib/payments/audit"
import type { PaymentResult } from "@/lib/payments"

/**
 * Charges an order with the on-site provider (card token or PSE).
 *
 * Security invariants:
 * - The amount is read from the database, never from the request body.
 * - A fresh idempotency key is persisted on the order BEFORE the gateway call.
 * - Attempts are capped (MAX_PAYMENT_ATTEMPTS) against card testing.
 * - PAID is only ever written by webhook/verified-status paths, with guarded
 *   updates, so a forged request can't settle an order.
 */

interface CardPayload {
  token: string
  paymentMethodId: string
  issuerId?: string
  installments: number
  identificationType: string
  identificationNumber: string
}

interface PsePayload {
  bankId: string
  entityType: "individual" | "association"
  identificationType: string
  identificationNumber: string
}

interface InitiateBody {
  orderId: string
  method: "card" | "pse"
  card?: CardPayload
  pse?: PsePayload
}

function parseBody(raw: unknown): InitiateBody | null {
  if (typeof raw !== "object" || raw === null) return null
  const body = raw as Record<string, unknown>
  if (typeof body.orderId !== "string" || (body.method !== "card" && body.method !== "pse")) {
    return null
  }

  if (body.method === "card") {
    const card = body.card as Record<string, unknown> | undefined
    if (
      !card ||
      typeof card.token !== "string" ||
      typeof card.paymentMethodId !== "string" ||
      !Number.isInteger(card.installments) ||
      (card.installments as number) < 1 ||
      typeof card.identificationType !== "string" ||
      typeof card.identificationNumber !== "string"
    ) {
      return null
    }
    return {
      orderId: body.orderId,
      method: "card",
      card: {
        token: card.token,
        paymentMethodId: card.paymentMethodId,
        ...(typeof card.issuerId === "string" && card.issuerId ? { issuerId: card.issuerId } : {}),
        installments: card.installments as number,
        identificationType: card.identificationType,
        identificationNumber: card.identificationNumber,
      },
    }
  }

  const pse = body.pse as Record<string, unknown> | undefined
  if (
    !pse ||
    typeof pse.bankId !== "string" ||
    (pse.entityType !== "individual" && pse.entityType !== "association") ||
    typeof pse.identificationType !== "string" ||
    typeof pse.identificationNumber !== "string"
  ) {
    return null
  }
  return {
    orderId: body.orderId,
    method: "pse",
    pse: {
      bankId: pse.bankId,
      entityType: pse.entityType,
      identificationType: pse.identificationType,
      identificationNumber: pse.identificationNumber,
    },
  }
}

/** Splits a Colombian phone into MP's area_code + number shape. */
function splitPhone(phone: string | undefined): { areaCode: string; number: string } {
  const digits = (phone ?? "").replace(/\D/g, "")
  if (digits.length <= 7) return { areaCode: "601", number: digits || "0000000" }
  return { areaCode: digits.slice(0, 3), number: digits.slice(3, 10) }
}

export async function POST(request: Request) {
  let body: InitiateBody | null = null
  try {
    body = parseBody(await request.json())
  } catch {
    /* fall through to 400 */
  }
  if (!body) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })

  const provider = getPaymentProvider()
  if (!isOnsiteProvider(provider)) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 })
  }

  const order = await getOrderPaymentInfo(body.orderId)
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  // Orders linked to an account can only be paid by that account; guest orders
  // rely on the unguessable order id as the capability token.
  if (order.userId) {
    const session = await getServerSession(authOptions)
    if (session?.user?.id !== order.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "El pedido ya fue pagado" }, { status: 409 })
  }
  if (order.paymentStatus === "FAILED" || order.paymentStatus === "REFUNDED") {
    return NextResponse.json({ error: "El pedido ya no admite pagos" }, { status: 409 })
  }
  if (order.paymentAttempts >= MAX_PAYMENT_ATTEMPTS) {
    return NextResponse.json(
      { error: "Alcanzaste el límite de intentos de pago para este pedido" },
      { status: 429 },
    )
  }

  const idempotencyKey = randomUUID()
  const claimed = await claimPaymentAttempt(order.id, {
    provider: provider.name,
    method: body.method,
    idempotencyKey,
  })
  if (!claimed) {
    return NextResponse.json({ error: "El pedido no admite más intentos" }, { status: 409 })
  }

  try {
    let result: PaymentResult

    if (body.method === "card") {
      const card = body.card!
      result = await provider.createCardPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        token: card.token,
        installments: card.installments,
        paymentMethodId: card.paymentMethodId,
        ...(card.issuerId ? { issuerId: card.issuerId } : {}),
        payer: {
          email: order.customerEmail ?? "comprador@example.com",
          identificationType: card.identificationType,
          identificationNumber: card.identificationNumber,
        },
        idempotencyKey,
      })
    } else {
      const pse = body.pse!
      const address = order.shippingAddress
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      result = await provider.createPsePayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        callbackUrl: `${appUrl}/api/payments/pse-return?orderId=${order.id}`,
        financialInstitution: pse.bankId,
        entityType: pse.entityType,
        payer: {
          email: order.customerEmail ?? "comprador@example.com",
          firstName: address?.firstName ?? order.customerName ?? "Cliente",
          lastName: address?.lastName ?? "",
          identificationType: pse.identificationType,
          identificationNumber: pse.identificationNumber,
          phone: splitPhone(address?.phone),
          address: {
            street: address?.address ?? "",
            city: address?.city ?? "",
            state: address?.state ?? "",
            zipCode: (address?.zipCode ?? "").replace(/\D/g, "") || "00000",
          },
        },
        idempotencyKey,
      })
    }

    await logPaymentEvent({
      orderId: order.id,
      provider: provider.name,
      event: `initiate.${body.method}`,
      providerId: result.providerId,
      status: result.statusDetail,
      rawPayload: result.raw,
    })

    if (result.status === "approved") {
      await recordPaymentInitiated(order.id, { providerId: result.providerId })
      await markOrderPaid(order.id)
      return NextResponse.json({ status: "approved" })
    }

    if (result.status === "pending") {
      await recordPaymentInitiated(order.id, {
        providerId: result.providerId,
        // PSE leaves the site for the bank; cards in_process stay PENDING.
        ...(body.method === "pse"
          ? {
              processing: true,
              ...(result.redirectUrl ? { pseRedirectUrl: result.redirectUrl } : {}),
            }
          : {}),
      })
      return NextResponse.json({
        status: "pending",
        ...(result.redirectUrl ? { redirectUrl: result.redirectUrl } : {}),
      })
    }

    // Rejected: the order stays PENDING so the customer can retry. The latest
    // providerId is deliberately NOT stored — a late webhook for this dead
    // attempt must never cancel an order the customer is actively retrying.
    return NextResponse.json({
      status: "rejected",
      error: result.declineMessage ?? "El pago fue rechazado. Intenta de nuevo.",
    })
  } catch (err) {
    console.error("Payment initiation failed:", err)
    await logPaymentEvent({
      orderId: order.id,
      provider: provider.name,
      event: `initiate.${body.method}.error`,
      status: "error",
      rawPayload: paymentErrorPayload(err),
    })
    return NextResponse.json(
      { error: "No se pudo procesar el pago. Intenta de nuevo." },
      { status: 502 },
    )
  }
}
