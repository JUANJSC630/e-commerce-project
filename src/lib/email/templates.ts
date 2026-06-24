import "server-only"

import type { OrderConfirmationDTO } from "@/lib/orders"
import { formatPrice, type PriceLocale } from "@/lib/utils"

/**
 * Branded, email-safe HTML templates (inline styles, table layout). Pure
 * functions: they receive the data and locale and return `{ subject, html }`,
 * so they're trivial to preview and never touch the database.
 */

const COLORS = {
  bg: "#f6f3ee",
  surface: "#ffffff",
  ink: "#2f2a25",
  muted: "#6b6259",
  accent: "#6f8f6a",
  border: "#e7e1d8",
}

interface OrderEmailContext {
  order: OrderConfirmationDTO
  brandName: string
  locale: PriceLocale
  appUrl: string
}

function layout(brandName: string, heading: string, body: string, appUrl: string): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${COLORS.border};">
                <a href="${appUrl}" style="font-size:20px;font-weight:700;color:${COLORS.ink};text-decoration:none;">${brandName}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${COLORS.ink};">${heading}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${COLORS.border};color:${COLORS.muted};font-size:12px;">
                Este es un correo automático de ${brandName}. Si tienes dudas, responde a este mensaje.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function itemsTable(order: OrderConfirmationDTO, locale: PriceLocale): string {
  const rows = order.items
    .map((item) => {
      const variant = [item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
        .filter(Boolean)
        .join(" · ")
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};">
          <span style="color:${COLORS.ink};">${item.name}</span>
          ${variant ? `<br/><span style="color:${COLORS.muted};font-size:12px;">${variant}</span>` : ""}
          <br/><span style="color:${COLORS.muted};font-size:12px;">x${item.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};text-align:right;color:${COLORS.ink};white-space:nowrap;">
          ${formatPrice(item.price * item.quantity, locale)}
        </td>
      </tr>`
    })
    .join("")

  const totalsRow = (label: string, value: string, bold = false) =>
    `<tr>
      <td style="padding:6px 0;color:${bold ? COLORS.ink : COLORS.muted};${bold ? "font-weight:700;" : ""}">${label}</td>
      <td style="padding:6px 0;text-align:right;color:${COLORS.ink};${bold ? "font-weight:700;" : ""}white-space:nowrap;">${value}</td>
    </tr>`

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    ${rows}
    ${totalsRow("Subtotal", formatPrice(order.subtotal, locale))}
    ${totalsRow("Envío", order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost, locale))}
    ${totalsRow("Total", formatPrice(order.total, locale), true)}
  </table>`
}

function addressBlock(order: OrderConfirmationDTO): string {
  const a = order.shippingAddress
  if (!a) return ""
  const line = [a.address, a.city, a.state, a.country].filter(Boolean).join(", ")
  return `<p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;">
    <strong style="color:${COLORS.ink};">Envío a:</strong><br/>
    ${order.customerName ?? ""}<br/>${line}
  </p>`
}

const p = (text: string) =>
  `<p style="margin:0 0 12px;color:${COLORS.muted};font-size:15px;line-height:1.5;">${text}</p>`

export function orderPlacedEmail({ order, brandName, locale, appUrl }: OrderEmailContext) {
  const body =
    p(
      `Recibimos tu pedido <strong style="color:${COLORS.ink};">${order.orderNumber}</strong> y lo estamos procesando. Aquí tienes el resumen:`,
    ) +
    itemsTable(order, locale) +
    addressBlock(order)
  return {
    subject: `Recibimos tu pedido ${order.orderNumber} — ${brandName}`,
    html: layout(brandName, "¡Gracias por tu compra!", body, appUrl),
  }
}

export function orderPaidEmail({ order, brandName, locale, appUrl }: OrderEmailContext) {
  const body =
    p(
      `El pago de tu pedido <strong style="color:${COLORS.ink};">${order.orderNumber}</strong> fue confirmado. Ya lo estamos preparando para el envío.`,
    ) + itemsTable(order, locale)
  return {
    subject: `Pago confirmado — pedido ${order.orderNumber}`,
    html: layout(brandName, "Tu pago fue confirmado", body, appUrl),
  }
}

export function orderShippedEmail({ order, brandName, appUrl }: OrderEmailContext) {
  const tracking = order.trackingNumber
    ? p(
        `Guía de seguimiento${order.carrier ? ` (${order.carrier})` : ""}: <strong style="color:${COLORS.ink};">${order.trackingNumber}</strong>`,
      )
    : ""
  const body =
    p(
      `Tu pedido <strong style="color:${COLORS.ink};">${order.orderNumber}</strong> va en camino. Te avisaremos cuando sea entregado.`,
    ) +
    tracking +
    addressBlock(order) +
    `<p style="margin:24px 0 0;"><a href="${appUrl}/cuenta/pedidos" style="display:inline-block;background:${COLORS.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;">Ver mis pedidos</a></p>`
  return {
    subject: `Tu pedido ${order.orderNumber} fue enviado`,
    html: layout(brandName, "Tu pedido va en camino", body, appUrl),
  }
}

export function abandonedOrderEmail({ order, brandName, locale, appUrl }: OrderEmailContext) {
  const body =
    p(
      `Tu pedido <strong style="color:${COLORS.ink};">${order.orderNumber}</strong> está reservado pero el pago aún no se completó. Termínalo cuando quieras — tus productos te esperan.`,
    ) +
    itemsTable(order, locale) +
    `<p style="margin:24px 0 0;"><a href="${appUrl}/pago/${order.id}" style="display:inline-block;background:${COLORS.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;">Completar mi pago</a></p>`
  return {
    subject: `¿Olvidaste algo? Completa tu pedido ${order.orderNumber}`,
    html: layout(brandName, "Tu pedido te espera", body, appUrl),
  }
}

export function welcomeEmail({
  name,
  brandName,
  appUrl,
}: {
  name: string | null
  brandName: string
  appUrl: string
}) {
  const greeting = name ? `Hola ${name}, ` : "Hola, "
  const body =
    p(
      `${greeting}tu cuenta en ${brandName} fue creada. Desde tu panel puedes ver el estado de tus pedidos y guardar tus datos de envío.`,
    ) +
    `<p style="margin:24px 0 0;"><a href="${appUrl}/cuenta" style="display:inline-block;background:${COLORS.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;">Ir a mi cuenta</a></p>`
  return {
    subject: `Bienvenido a ${brandName}`,
    html: layout(brandName, `Bienvenido a ${brandName}`, body, appUrl),
  }
}
