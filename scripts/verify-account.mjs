import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3100"
const SHOTS = "/tmp/account-shots"
const results = []
const check = (name, ok) => {
  results.push({ name, ok: !!ok })
  console.log(`${ok ? "✅" : "❌"} ${name}`)
}

const email = `e2e-${Date.now()}@e2etest.com`
const password = "Password123"
const name = "E2E Cliente"
console.log("test email:", email)

const cart = [
  {
    id: "baby-001",
    name: "Body Algodón Orgánico - Nubes",
    price: 18000,
    image: "/placeholder.svg",
    quantity: 1,
    selectedSize: "NB",
    selectedColor: "#F2F2F2",
  },
]

const browser = await chromium.launch()
const page = await browser
  .newContext({ viewport: { width: 1100, height: 1000 } })
  .then((c) => c.newPage())

try {
  // ── Register ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/cuenta/registro`, { waitUntil: "networkidle" })
  await page.locator("#name").fill(name)
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("#confirm").fill(password)
  await page.getByRole("button", { name: "Crear cuenta" }).click()
  await page.waitForURL(`${BASE}/cuenta`, { timeout: 15000 })
  const greeting = await page.getByRole("heading", { level: 1 }).innerText()
  check(`Registro → panel saluda al cliente (got "${greeting}")`, /E2E Cliente/.test(greeting))
  await page.screenshot({ path: `${SHOTS}/1-account.png` })

  // ── Orders empty ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/cuenta/pedidos`, { waitUntil: "networkidle" })
  const emptyVisible = await page.getByText(/Aún no has hecho ningún pedido/i).isVisible()
  check("Pedidos vacíos al inicio", emptyVisible)

  // ── Place an order while logged in ──────────────────────────────────────────
  await page.evaluate((c) => localStorage.setItem("dulceInfanciaCart", JSON.stringify(c)), cart)
  await page.goto(`${BASE}/checkout-flow`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /Continuar al envío/i }).click()

  await page.locator("#firstName").fill("Juan")
  await page.locator("#lastName").fill("Pruebas")
  await page.locator("#email").fill(email)
  await page.locator("#phone").fill("3001234567")
  await page.locator("#address").fill("Cra 5 #6-7")
  // chained selectors (country auto = Colombia)
  await page.locator("#state").click()
  await page.getByPlaceholder("Buscar departamento…").fill("Valle")
  await page.getByRole("option", { name: "Valle del Cauca", exact: true }).click()
  await page.locator("#city").click()
  await page.getByRole("option", { name: "Cali", exact: true }).click()
  await page.getByRole("button", { name: /Continuar al pago/i }).click()

  // payment: pick bank transfer to skip card validation
  await page.getByRole("radio", { name: /Transferencia/i }).click()
  await page.getByRole("button", { name: "Revisar pedido" }).click()
  await page.getByRole("button", { name: "Confirmar pedido" }).click()

  // simulated gateway → approve
  await page.waitForURL(/\/pago\//, { timeout: 15000 })
  await page.getByRole("button", { name: /Simular pago aprobado/i }).click()
  await page.waitForURL(/\/order-success\//, { timeout: 15000 })
  const thanks = await page
    .getByText(/Gracias por tu compra/i)
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  check("Pedido (logueado) completado y pagado", thanks)

  // ── Order shows up in the account ───────────────────────────────────────────
  await page.goto(`${BASE}/cuenta/pedidos`, { waitUntil: "networkidle" })
  const orderLinks = page.locator('a[href*="/cuenta/pedidos/"]')
  const orderCount = await orderLinks.count()
  check(`Pedido aparece en la cuenta (${orderCount})`, orderCount === 1)
  const numberText = await orderLinks.first().innerText()
  check(
    `Muestra número de orden (got "${numberText.split("\n")[0]}")`,
    /DI-\d{4}-\d+/.test(numberText),
  )
  await page.screenshot({ path: `${SHOTS}/2-orders.png` })

  // order detail
  await orderLinks.first().click()
  await page.waitForURL(/\/cuenta\/pedidos\//)
  const detailHasItem = await page.getByText("Body Algodón Orgánico - Nubes").isVisible()
  check("Detalle del pedido muestra los items", detailHasItem)
  await page.screenshot({ path: `${SHOTS}/3-order-detail.png` })

  // ── Logout ──────────────────────────────────────────────────────────────────
  // (signOut's post-redirect uses NEXTAUTH_URL, which may point at another port;
  // we only care that the session cookie is cleared, so we don't await its URL.)
  await page.goto(`${BASE}/cuenta`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /Cerrar sesión/i }).click()
  await page.waitForTimeout(2000)
  await page.goto(`${BASE}/cuenta/pedidos`, { waitUntil: "networkidle" })
  check("Tras logout, /cuenta/pedidos redirige a login", /\/cuenta\/login/.test(page.url()))
} catch (err) {
  console.log("❌ EXCEPTION:", err.message)
  await page.screenshot({ path: `${SHOTS}/error.png` }).catch(() => {})
  results.push({ name: "no-exception", ok: false })
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
