/**
 * verify-emails.mts - envío real de los 5 emails transaccionales (Bloque 11).
 *
 * Usa las piezas de producción: los templates reales (`@/lib/email/templates`), el
 * transporte real (`@/lib/email/client` → Resend) y la marca/locale reales leídos de
 * la DB. Lo único simulado es el pedido (un DTO de ejemplo), para no ensuciar la
 * base con pedidos de prueba.
 *
 * Por qué no llama a `send*Email()` de `@/lib/email`: esos wrappers leen los ajustes
 * con `loadAllSettings`, que está envuelto en `unstable_cache` de Next y revienta
 * fuera del runtime del servidor ("Invariant: incrementalCache missing"). Aquí se
 * replica su única lógica -leer brand+locale de `Setting` y mezclarlos sobre los
 * defaults- sin el wrapper de caché. Lo que queda sin ejercitar de los wrappers es
 * el guard `if (!order.customerEmail) return`; todo lo demás (HTML que ve el
 * cliente, credenciales, remitente y entrega) es el camino real.
 *
 * Uso:  yarn verify:emails [destinatario@correo.com]
 *
 * Con `SMTP_HOST` puesto (Mailpit, que trae Herd) los 5 quedan en la bandeja local
 * http://localhost:8025 y nada sale a internet: se pueden revisar sin dominio
 * verificado ni riesgo de escribirle a un cliente real. Al comentar `SMTP_HOST`, el
 * mismo script prueba la entrega real por Resend.
 */
import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
config({ path: resolve(root, ".env") })
config({ path: resolve(root, ".env.local"), override: true })

if (!process.env.SMTP_HOST && !process.env.RESEND_API_KEY) {
  console.error("❌ Sin transporte: define SMTP_HOST (Mailpit) o RESEND_API_KEY en .env.local")
  process.exit(1)
}

// Los módulos leen EMAIL_FROM al importarse, así que se cargan tras poblar el entorno.
const { prisma } = await import("../src/lib/prisma")
const { SETTINGS_KEYS } = await import("../src/lib/settings-keys")
const { brand: defaultBrand, locale: defaultLocale } = await import("../src/config/store.config")
const { sendEmail } = await import("../src/lib/email/client")
const templates = await import("../src/lib/email/templates")
type OrderDTO = Parameters<typeof templates.orderPlacedEmail>[0]["order"]

const to = process.argv[2] ?? process.env.TEST_EMAIL
if (!to) {
  console.error("❌ Indica el destinatario: yarn verify:emails tu@correo.com")
  process.exit(1)
}

// Mismo merge que `loadAllSettings`, sin el `unstable_cache` de Next.
const rows = await prisma.setting.findMany()
const dbMap = new Map(rows.map((r) => [r.key, r.value]))
const asObject = (v: unknown) => (v && typeof v === "object" ? v : {})
const brandName = { ...defaultBrand, ...asObject(dbMap.get(SETTINGS_KEYS.brand)) }.name
const locale = { ...defaultLocale, ...asObject(dbMap.get(SETTINGS_KEYS.locale)) }
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dulceinfancia.co"
const from = process.env.EMAIL_FROM ?? "(default del código)"

const transport = process.env.SMTP_HOST
  ? `SMTP ${process.env.SMTP_HOST}:${process.env.SMTP_PORT ?? 1025} (bandeja: http://localhost:8025)`
  : "Resend (entrega real)"

console.log(`\n📧 Enviando los 5 emails`)
console.log(`   vía:   ${transport}`)
console.log(`   de:    ${from}`)
console.log(`   para:  ${to}`)
console.log(`   marca: ${brandName} (leída de la DB)\n`)

const order = {
  id: "verify-emails-demo",
  orderNumber: "DI-2026-999",
  customerName: "Cliente de Prueba",
  customerEmail: to,
  status: "CONFIRMED",
  paymentStatus: "PAID",
  paymentInFlight: false,
  subtotal: 189000,
  shippingCost: 12000,
  discountCode: "BIENVENIDA10",
  discountAmount: 18900,
  taxAmount: 0,
  total: 182100,
  carrier: "Coordinadora",
  trackingNumber: "CO-987654321",
  createdAt: new Date(),
  shippingAddress: {
    firstName: "Cliente",
    lastName: "De Prueba",
    email: to,
    phone: "3001234567",
    address: "Calle 123 #45-67, Apto 801",
    city: "Medellín",
    state: "Antioquia",
    zipCode: "050021",
    country: "Colombia",
  },
  items: [
    {
      id: "item-1",
      productId: "prod-1",
      name: "Body manga larga algodón orgánico",
      image: "/placeholder.svg",
      price: 69000,
      quantity: 2,
      size: "3-6 meses",
      color: "Marfil",
    },
    {
      id: "item-2",
      productId: "prod-2",
      name: "Manta de arrullo bambú",
      image: "/placeholder.svg",
      price: 51000,
      quantity: 1,
      size: null,
      color: "Verde salvia",
    },
  ],
} as unknown as OrderDTO

const ctx = { order, brandName, locale: locale as never, appUrl }

const cases: Array<[string, { subject: string; html: string }]> = [
  ["Pedido creado (checkout)", templates.orderPlacedEmail(ctx)],
  ["Pago confirmado (webhook)", templates.orderPaidEmail(ctx)],
  ["Pedido enviado (admin)", templates.orderShippedEmail(ctx)],
  ["Pago abandonado (cron)", templates.abandonedOrderEmail(ctx)],
  [
    "Bienvenida (registro)",
    templates.welcomeEmail({ name: "Cliente de Prueba", brandName, appUrl }),
  ],
]

let passed = 0
for (const [name, { subject, html }] of cases) {
  const ok = await sendEmail({ to, subject, html })
  if (ok) passed++
  console.log(`${ok ? "✅" : "❌"} ${name}`)
  console.log(`      asunto: "${subject}" · ${html.length} bytes de HTML`)
  // Resend limita a 2 req/s en el plan gratuito.
  await new Promise((r) => setTimeout(r, 600))
}

console.log(`\n${passed}/${cases.length} entregados a ${to}.\n`)
await prisma.$disconnect()
process.exit(passed === cases.length ? 0 : 1)
