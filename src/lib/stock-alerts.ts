import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email/client"
import { loadAllSettings } from "@/lib/settings"
import { formatPrice } from "@/lib/utils"

/**
 * Notify all pending subscribers for a product that it's back in stock.
 * Call this whenever a product's stock increases from 0 to > 0.
 */
export async function notifyBackInStock(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, price: true, image: true, stock: true },
  })
  if (!product || product.stock <= 0) return 0

  const alerts = await prisma.stockAlert.findMany({
    where: { productId, notified: false },
    select: { id: true, email: true },
  })
  if (alerts.length === 0) return 0

  const { brand, locale } = await loadAllSettings()
  const price = formatPrice(product.price, locale)
  const productUrl = `${process.env.NEXTAUTH_URL ?? "https://dulceinfancia.co"}/products/${productId}`

  const subject = `¡${product.name} volvió! — ${brand.name}`
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
      <h1 style="font-size:20px;color:#1e293b">¡Buenas noticias! 🎉</h1>
      <p style="color:#475569">
        <strong>${product.name}</strong> ya está disponible de nuevo en nuestra tienda.
      </p>
      <p style="color:#475569">Precio: <strong>${price}</strong></p>
      <a href="${productUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
        Ver producto
      </a>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">
        Recibiste este email porque solicitaste ser notificado cuando este producto volviera a estar disponible.
      </p>
    </div>
  `

  // Send emails in parallel (batched to avoid overwhelming the email provider)
  const BATCH_SIZE = 10
  for (let i = 0; i < alerts.length; i += BATCH_SIZE) {
    const batch = alerts.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(batch.map((alert) => sendEmail({ to: alert.email, subject, html })))
  }

  // Mark all as notified
  await prisma.stockAlert.updateMany({
    where: { id: { in: alerts.map((a) => a.id) } },
    data: { notified: true },
  })

  return alerts.length
}
