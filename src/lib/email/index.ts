import "server-only"

import type { OrderConfirmationDTO } from "@/lib/orders"
import { loadAllSettings } from "@/lib/settings"
import { sendEmail } from "@/lib/email/client"
import {
  abandonedOrderEmail,
  orderPaidEmail,
  orderPlacedEmail,
  orderShippedEmail,
  welcomeEmail,
} from "@/lib/email/templates"

/**
 * High-level transactional email triggers. Each loads the live brand/locale from
 * settings, builds the branded template and dispatches it. All are best-effort
 * (the underlying transport never throws) and skip silently when the order has
 * no customer email.
 */

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://dulceinfancia.co"
}

async function emailContext(order: OrderConfirmationDTO) {
  const { brand, locale } = await loadAllSettings()
  return { order, brandName: brand.name, locale, appUrl: appUrl() }
}

export async function sendOrderPlacedEmail(order: OrderConfirmationDTO): Promise<void> {
  if (!order.customerEmail) return
  const { subject, html } = orderPlacedEmail(await emailContext(order))
  await sendEmail({ to: order.customerEmail, subject, html })
}

export async function sendOrderPaidEmail(order: OrderConfirmationDTO): Promise<void> {
  if (!order.customerEmail) return
  const { subject, html } = orderPaidEmail(await emailContext(order))
  await sendEmail({ to: order.customerEmail, subject, html })
}

export async function sendOrderShippedEmail(order: OrderConfirmationDTO): Promise<void> {
  if (!order.customerEmail) return
  const { subject, html } = orderShippedEmail(await emailContext(order))
  await sendEmail({ to: order.customerEmail, subject, html })
}

export async function sendAbandonedOrderEmail(order: OrderConfirmationDTO): Promise<void> {
  if (!order.customerEmail) return
  const { subject, html } = abandonedOrderEmail(await emailContext(order))
  await sendEmail({ to: order.customerEmail, subject, html })
}

export async function sendWelcomeEmail(email: string, name: string | null): Promise<void> {
  const { brand } = await loadAllSettings()
  const { subject, html } = welcomeEmail({ name, brandName: brand.name, appUrl: appUrl() })
  await sendEmail({ to: email, subject, html })
}
