/**
 * verify-cron.mts - E2E del cron de recordatorio de pago abandonado (Bloque 11).
 *
 * Golpea el endpoint real (`GET /api/cron/abandoned-orders`) contra el `next dev`
 * que ya esté corriendo, tal como lo hará cron-job.org (o Vercel Cron) en producción:
 * mismo método, misma cabecera `Authorization: Bearer <CRON_SECRET>`.
 *
 * Verifica:
 *   1. Sin cabecera            → 401 (no cualquiera puede dispararlo)
 *   2. Con secreto incorrecto  → 401
 *   3. Con el secreto correcto → 200 y el pedido abandonado recibe su email
 *   4. Segunda corrida         → 0 recordatorios (idempotente: `reminderSentAt`
 *      se reclama con un update guardado, así que nadie recibe el email dos veces)
 *
 * Crea su propio pedido de prueba (PENDING, con 2 días de antigüedad, dentro de la
 * ventana de 24h-7d) y lo borra al final: NO toca pedidos reales de la DB.
 *
 * Requiere el server arriba (`yarn dev`) y, para ver el email, Mailpit en :1025.
 * Uso:  yarn verify:cron
 */
import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
config({ path: resolve(root, ".env") })
config({ path: resolve(root, ".env.local"), override: true })

const secret = process.env.CRON_SECRET
if (!secret) {
  console.error("❌ Falta CRON_SECRET en .env.local")
  process.exit(1)
}

const BASE = process.env.CRON_BASE_URL ?? "http://localhost:3000"
const URL_CRON = `${BASE}/api/cron/abandoned-orders`
const MAILPIT = "http://localhost:8025"

const { prisma } = await import("../src/lib/prisma")

const results: boolean[] = []
const check = (name: string, ok: boolean, extra = "") => {
  results.push(ok)
  console.log(`${ok ? "✅" : "❌"} ${name}${extra ? ` - ${extra}` : ""}`)
}

const hit = (headers: Record<string, string> = {}) => fetch(URL_CRON, { headers })

// ─── Pedido abandonado de prueba (se borra al final) ─────────────────────────
const product = await prisma.product.findFirst({ select: { id: true, price: true } })
if (!product) {
  console.error("❌ No hay productos en la DB para armar el pedido de prueba")
  process.exit(1)
}

const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
const order = await prisma.order.create({
  data: {
    orderNumber: `TEST-CRON-${Date.now()}`,
    customerEmail: "abandonado@dulceinfancia.co",
    customerName: "Cliente Abandonado",
    status: "PENDING",
    paymentStatus: "PENDING",
    subtotal: product.price,
    total: product.price,
    createdAt: twoDaysAgo,
    items: {
      create: [{ productId: product.id, quantity: 1, price: product.price }],
    },
  },
  select: { id: true, orderNumber: true },
})
console.log(`\n🧪 Pedido de prueba ${order.orderNumber} (PENDING, hace 2 días)\n`)

try {
  const before = await fetch(`${MAILPIT}/api/v1/messages?limit=1`)
    .then((r) => r.json() as Promise<{ messages_count: number }>)
    .then((d) => d.messages_count)
    .catch(() => -1)

  // 1 y 2 - el endpoint falla cerrado
  check("Sin Authorization → 401", (await hit()).status === 401)
  check(
    "Con secreto incorrecto → 401",
    (await hit({ authorization: "Bearer secreto-malo" })).status === 401,
  )

  // 3 - corrida real
  const res = await hit({ authorization: `Bearer ${secret}` })
  const body = (await res.json()) as { reminded?: number }
  check("Con el secreto correcto → 200", res.status === 200, `respuesta: ${JSON.stringify(body)}`)
  check("Recordó al menos nuestro pedido", (body.reminded ?? 0) >= 1)

  const after = await prisma.order.findUnique({
    where: { id: order.id },
    select: { reminderSentAt: true },
  })
  check("reminderSentAt quedó marcado en la DB", after?.reminderSentAt != null)

  if (before >= 0) {
    const now = await fetch(`${MAILPIT}/api/v1/messages?limit=1`)
      .then((r) => r.json() as Promise<{ messages_count: number }>)
      .then((d) => d.messages_count)
    check("Llegó el email a Mailpit", now > before, `bandeja: ${before} → ${now}`)
  } else {
    console.log("⚠️  Mailpit no responde en :8025 - no se comprueba la entrega")
  }

  // 4 - idempotencia
  const second = await hit({ authorization: `Bearer ${secret}` })
  const secondBody = (await second.json()) as { reminded?: number }
  check(
    "Segunda corrida no reenvía (idempotente)",
    secondBody.reminded === 0,
    `respuesta: ${JSON.stringify(secondBody)}`,
  )
} finally {
  await prisma.order.delete({ where: { id: order.id } })
  console.log(`\n🧹 Pedido de prueba ${order.orderNumber} eliminado`)
  await prisma.$disconnect()
}

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} comprobaciones OK\n`)
process.exit(passed === results.length ? 0 : 1)
