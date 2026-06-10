import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Appends one row to the PaymentLog audit trail. Best-effort by design: an
 * audit failure must never break the payment it documents.
 */
export async function logPaymentEvent(entry: {
  orderId: string
  provider: string
  event: string
  providerId?: string
  status: string
  rawPayload: unknown
}): Promise<void> {
  try {
    await prisma.paymentLog.create({
      data: {
        orderId: entry.orderId,
        provider: entry.provider,
        event: entry.event,
        providerId: entry.providerId ?? null,
        status: entry.status,
        rawPayload: (entry.rawPayload ?? {}) as Prisma.InputJsonValue,
      },
    })
  } catch (err) {
    console.error("PaymentLog write failed:", err)
  }
}
