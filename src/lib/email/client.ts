import "server-only"

import { Resend } from "resend"

/**
 * Transactional email transport (Resend).
 *
 * Email is always best-effort: a delivery failure must never break the flow that
 * triggered it (placing an order, confirming a payment). When `RESEND_API_KEY` is
 * absent - local dev without credentials - sending is a logged no-op so the rest
 * of the app works unchanged.
 */

let client: Resend | null = null

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!client) client = new Resend(key)
  return client
}

const FROM = process.env.EMAIL_FROM ?? "noreply@dulceinfancia.co"

export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

/** Sends one email. Never throws; returns whether it was actually dispatched. */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY no configurada - email "${subject}" omitido`)
    return false
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) {
      console.error("[email] Resend devolvió error", { subject, error })
      return false
    }
    return true
  } catch (err) {
    console.error("[email] Fallo al enviar", { subject, err })
    return false
  }
}
