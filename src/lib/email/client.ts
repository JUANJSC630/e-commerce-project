import "server-only"

import { Resend } from "resend"
import { createTransport, type Transporter } from "nodemailer"

/**
 * Transactional email transport.
 *
 * Two backends, elegidos por entorno:
 *
 *   - **SMTP** (`SMTP_HOST`): captura local en desarrollo. Herd trae Mailpit en
 *     127.0.0.1:1025 (bandeja en http://localhost:8025), que acepta cualquier
 *     remitente y destinatario y no entrega nada al mundo real - ideal para ver los
 *     emails sin dominio verificado ni riesgo de escribirle a un cliente.
 *   - **Resend** (`RESEND_API_KEY`): el transporte de producción.
 *
 * SMTP gana cuando está configurado, para que un `.env.local` de desarrollo nunca
 * dispare correos reales por accidente aunque tenga la API key de Resend.
 *
 * Email is always best-effort: a delivery failure must never break the flow that
 * triggered it (placing an order, confirming a payment). When no hay transporte
 * configurado - local dev sin credenciales - sending is a logged no-op so the rest
 * of the app works unchanged.
 */

let resend: Resend | null = null
let smtp: Transporter | null = null

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!resend) resend = new Resend(key)
  return resend
}

function getSmtp(): Transporter | null {
  const host = process.env.SMTP_HOST
  if (!host) return null
  if (!smtp) {
    const port = Number(process.env.SMTP_PORT ?? 1025)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    smtp = createTransport({
      host,
      port,
      // Mailpit y demás capturadores locales hablan SMTP plano sin auth.
      secure: port === 465,
      ignoreTLS: !user,
      auth: user && pass ? { user, pass } : undefined,
    })
  }
  return smtp
}

const FROM = process.env.EMAIL_FROM ?? "noreply@dulceinfancia.co"

export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

/** Sends one email. Never throws; returns whether it was actually dispatched. */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const transport = getSmtp()
  if (transport) {
    try {
      await transport.sendMail({ from: FROM, to, subject, html })
      return true
    } catch (err) {
      console.error("[email] Fallo al enviar por SMTP", { subject, err })
      return false
    }
  }

  const api = getResend()
  if (!api) {
    console.warn(`[email] Sin transporte (ni SMTP_HOST ni RESEND_API_KEY) - "${subject}" omitido`)
    return false
  }
  try {
    const { error } = await api.emails.send({ from: FROM, to, subject, html })
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
