/**
 * E2E del Bloque 10 — pagos con MercadoPago (Checkout API).
 *
 * Levanta un servidor que imita el API de MercadoPago (el provider apunta a él
 * vía MERCADOPAGO_BASE_URL) y un `next dev` con PAYMENT_PROVIDER=mercadopago.
 * Verifica el ciclo completo contra la base de datos real de desarrollo:
 *
 *   1. Tarjeta aprobada  → pedido PAID (y el monto cobrado sale de la DB,
 *      ignorando el monto manipulado que envía el cliente)
 *   2. Tarjeta rechazada → pedido sigue PENDING (puede reintentar)
 *   3. PSE               → redirectUrl del banco + pedido PROCESSING
 *   4. Webhook con firma inválida → 401
 *   5. Webhook firmado   → settle a PAID (verificando contra el API, no el body)
 *   6. Webhook duplicado → idempotente (sigue PAID, responde 200)
 *
 * Uso: node scripts/verify-payments.mjs
 */
import { spawn } from "node:child_process"
import { createServer } from "node:http"
import { createHmac, randomUUID } from "node:crypto"

const APP_PORT = 3120
const MP_PORT = 3121
const BASE = `http://localhost:${APP_PORT}`
const WEBHOOK_SECRET = "e2e-webhook-secret"

const results = []
const check = (name, ok, extra = "") => {
  results.push({ name, ok: !!ok })
  console.log(`${ok ? "✅" : "❌"} ${name}${extra ? ` — ${extra}` : ""}`)
}

// ─── Mock del API de MercadoPago ──────────────────────────────────────────────
const payments = new Map()
let nextId = 90000
const mockState = { lastAmount: null, lastIdempotencyKey: null }

const mpServer = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${MP_PORT}`)
  let body = ""
  req.on("data", (chunk) => (body += chunk))
  req.on("end", () => {
    const json = (status, data) => {
      res.writeHead(status, { "Content-Type": "application/json" })
      res.end(JSON.stringify(data))
    }

    if (req.method === "POST" && url.pathname === "/v1/payments") {
      const data = JSON.parse(body)
      mockState.lastAmount = data.transaction_amount
      mockState.lastIdempotencyKey = req.headers["x-idempotency-key"] ?? null
      const id = nextId++

      let payment
      if (data.payment_method_id === "pse") {
        payment = {
          id,
          status: "pending",
          status_detail: "pending_waiting_transfer",
          external_reference: data.external_reference,
          transaction_details: { external_resource_url: `http://localhost:${MP_PORT}/banco` },
        }
      } else if (data.token === "tok_fund") {
        payment = {
          id,
          status: "rejected",
          status_detail: "cc_rejected_insufficient_amount",
          external_reference: data.external_reference,
        }
      } else {
        payment = {
          id,
          status: "approved",
          status_detail: "accredited",
          external_reference: data.external_reference,
        }
      }
      payments.set(String(id), payment)
      return json(201, payment)
    }

    const paymentMatch = url.pathname.match(/^\/v1\/payments\/(\d+)$/)
    if (req.method === "GET" && paymentMatch) {
      const payment = payments.get(paymentMatch[1])
      return payment ? json(200, payment) : json(404, { error: "not found" })
    }

    if (req.method === "GET" && url.pathname === "/v1/payment_methods") {
      return json(200, [
        {
          id: "pse",
          financial_institutions: [
            { id: "1009", description: "Banco de Bogotá" },
            { id: "1007", description: "Bancolombia" },
          ],
        },
      ])
    }

    // Endpoint de control del test: fuerza el estado de un pago.
    if (req.method === "POST" && url.pathname === "/__set-status") {
      const { id, status, status_detail } = JSON.parse(body)
      const payment = payments.get(String(id))
      if (payment) Object.assign(payment, { status, status_detail })
      return json(200, { ok: true })
    }

    json(404, { error: "unknown route" })
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function waitFor(fn, { timeout = 30000, interval = 500, label = "condition" } = {}) {
  const deadline = Date.now() + timeout
  let lastErr
  while (Date.now() < deadline) {
    try {
      const value = await fn()
      if (value) return value
    } catch (err) {
      lastErr = err
    }
    await new Promise((r) => setTimeout(r, interval))
  }
  throw new Error(`Timeout esperando ${label}${lastErr ? `: ${lastErr}` : ""}`)
}

const getOrder = async (id) => {
  const res = await fetch(`${BASE}/api/orders/${id}`)
  if (!res.ok) throw new Error(`GET order ${res.status}`)
  return res.json()
}

const customer = {
  firstName: "Juan",
  lastName: "Pruebas",
  email: "e2e-pagos@e2etest.com",
  phone: "3001234567",
  address: "Cra 5 #6-7",
  city: "Bogotá",
  state: "Bogotá D.C.",
  zipCode: "110111",
  country: "Colombia",
}

async function createOrder(productId, method) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ productId, quantity: 1 }],
      customer,
      paymentMethod: method,
    }),
  })
  if (!res.ok) throw new Error(`POST /api/orders → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function initiate(payload) {
  const res = await fetch(`${BASE}/api/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

function signedWebhookHeaders(paymentId) {
  const ts = String(Math.floor(Date.now() / 1000))
  const requestId = randomUUID()
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
  const v1 = createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex")
  return { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId }
}

async function sendWebhook(paymentId, headers) {
  return fetch(`${BASE}/api/payments/webhook/mercadopago?data.id=${paymentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ type: "payment", data: { id: paymentId } }),
  })
}

// ─── Arranque ────────────────────────────────────────────────────────────────
mpServer.listen(MP_PORT)
console.log(`Mock MercadoPago en :${MP_PORT}`)

const dev = spawn("yarn", ["dev"], {
  env: {
    ...process.env,
    PORT: String(APP_PORT),
    PAYMENT_PROVIDER: "mercadopago",
    MERCADOPAGO_ACCESS_TOKEN: "TEST-e2e-token",
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: "TEST-e2e-public",
    MERCADOPAGO_WEBHOOK_SECRET: WEBHOOK_SECRET,
    MERCADOPAGO_BASE_URL: `http://localhost:${MP_PORT}`,
    NEXT_PUBLIC_APP_URL: BASE,
  },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
})
dev.stdout.on("data", () => {})
dev.stderr.on("data", () => {})

let exitCode = 1
try {
  await waitFor(() => fetch(BASE).then((r) => r.ok), {
    timeout: 120000,
    interval: 1000,
    label: "next dev",
  })
  console.log(`next dev listo en ${BASE}\n`)

  // Producto con stock para los pedidos de prueba.
  const products = await (await fetch(`${BASE}/api/products`)).json()
  const product = products.find((p) => p.stock >= 4)
  if (!product) throw new Error("No hay producto con stock ≥ 4 para el test")
  console.log(`Producto de prueba: ${product.id} (stock ${product.stock})\n`)

  const cardPayload = (token) => ({
    token,
    paymentMethodId: "visa",
    installments: 1,
    identificationType: "CC",
    identificationNumber: "123456789",
  })

  // ── 1. Tarjeta aprobada + monto manipulado ────────────────────────────────
  const order1 = await createOrder(product.id, "card")
  const order1Before = await getOrder(order1.id)
  const r1 = await initiate({
    orderId: order1.id,
    method: "card",
    amount: 1, // manipulación: el server debe ignorarlo
    card: cardPayload("tok_apro"),
  })
  check("Tarjeta aprobada → initiate responde approved", r1.body.status === "approved")
  check(
    "Monto manipulado ignorado — se cobra el total de la DB",
    mockState.lastAmount === order1Before.total,
    `cobrado=${mockState.lastAmount}, DB=${order1Before.total}`,
  )
  check("X-Idempotency-Key enviado al gateway", !!mockState.lastIdempotencyKey)
  const order1After = await getOrder(order1.id)
  check("Pedido queda PAID + CONFIRMED", order1After.paymentStatus === "PAID")

  // ── 2. Tarjeta rechazada ──────────────────────────────────────────────────
  const order2 = await createOrder(product.id, "card")
  const r2 = await initiate({ orderId: order2.id, method: "card", card: cardPayload("tok_fund") })
  check("Tarjeta sin fondos → rejected con mensaje amigable", r2.body.status === "rejected")
  check(
    "Mensaje en español sin status_detail crudo",
    /fondos/i.test(r2.body.error ?? "") && !/cc_rejected/.test(r2.body.error ?? ""),
    r2.body.error,
  )
  const order2After = await getOrder(order2.id)
  check(
    "Pedido rechazado sigue PENDING (puede reintentar)",
    order2After.paymentStatus === "PENDING",
  )

  // ── 3. PSE ────────────────────────────────────────────────────────────────
  const order3 = await createOrder(product.id, "pse")
  const r3 = await initiate({
    orderId: order3.id,
    method: "pse",
    pse: {
      bankId: "1009",
      entityType: "individual",
      identificationType: "CC",
      identificationNumber: "1234567",
    },
  })
  check("PSE → devuelve redirectUrl del banco", !!r3.body.redirectUrl, r3.body.redirectUrl)
  const order3Processing = await getOrder(order3.id)
  check("Pedido PSE queda PROCESSING", order3Processing.paymentStatus === "PROCESSING")

  // El "banco" aprueba la transferencia (en el mock del gateway).
  const psePaymentId = [...payments.values()].find((p) => p.external_reference === order3.id)?.id
  await fetch(`http://localhost:${MP_PORT}/__set-status`, {
    method: "POST",
    body: JSON.stringify({ id: psePaymentId, status: "approved", status_detail: "accredited" }),
  })

  // ── 4. Webhook con firma inválida ─────────────────────────────────────────
  const badRes = await sendWebhook(psePaymentId, {
    "x-signature": "ts=123,v1=deadbeef",
    "x-request-id": randomUUID(),
  })
  check("Webhook con firma inválida → 401", badRes.status === 401)
  const order3StillProcessing = await getOrder(order3.id)
  check("Firma inválida no toca el pedido", order3StillProcessing.paymentStatus === "PROCESSING")

  // ── 5. Webhook firmado → settle ───────────────────────────────────────────
  const goodRes = await sendWebhook(psePaymentId, signedWebhookHeaders(psePaymentId))
  check("Webhook firmado → 200", goodRes.status === 200)
  await waitFor(async () => (await getOrder(order3.id)).paymentStatus === "PAID", {
    timeout: 15000,
    label: "settle del webhook",
  })
  check("Webhook settle → pedido PAID", true)

  // ── 6. Webhook duplicado (idempotencia) ───────────────────────────────────
  const dupRes = await sendWebhook(psePaymentId, signedWebhookHeaders(psePaymentId))
  check("Webhook duplicado → 200 sin error", dupRes.status === 200)
  await new Promise((r) => setTimeout(r, 2000))
  const order3Final = await getOrder(order3.id)
  check(
    "Duplicado es no-op — pedido sigue PAID",
    order3Final.paymentStatus === "PAID" && order3Final.status === "CONFIRMED",
  )

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks OK`)
  exitCode = failed.length === 0 ? 0 : 1
} catch (err) {
  console.error("\n💥 E2E abortado:", err.message ?? err)
} finally {
  try {
    process.kill(-dev.pid, "SIGTERM")
  } catch {
    /* already dead */
  }
  mpServer.close()
}
process.exit(exitCode)
