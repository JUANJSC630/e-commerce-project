import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3100"
const results = []
const check = (name, ok) => {
  results.push({ name, ok: !!ok })
  console.log(`${ok ? "✅" : "❌"} ${name}`)
}

const email = `e2e-${Date.now()}@e2etest.com`
const password = "Password123"

const browser = await chromium.launch()
const page = await browser
  .newContext({ viewport: { width: 1280, height: 1000 } })
  .then((c) => c.newPage())

try {
  // Register a customer
  await page.goto(`${BASE}/cuenta/registro`, { waitUntil: "networkidle" })
  await page.locator("#name").fill("Intruso Cliente")
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("#confirm").fill(password)
  await page.getByRole("button", { name: "Crear cuenta" }).click()
  await page.waitForURL(`${BASE}/cuenta`, { timeout: 15000 })

  // Bare /admin must redirect the customer to /cuenta
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  check(
    `/admin (bare) redirige al cliente (url: ${new URL(page.url()).pathname})`,
    /\/cuenta/.test(page.url()),
  )
  const dashVisible = await page.getByText("Dashboard", { exact: true }).count()
  check("El dashboard NO se muestra al cliente", dashVisible === 0)

  // An admin subpage too
  await page.goto(`${BASE}/admin/productos`, { waitUntil: "networkidle" })
  check(
    `/admin/productos redirige al cliente (url: ${new URL(page.url()).pathname})`,
    /\/cuenta/.test(page.url()),
  )

  // /admin/categorias too
  await page.goto(`${BASE}/admin/categorias`, { waitUntil: "networkidle" })
  check(`/admin/categorias redirige al cliente`, /\/cuenta/.test(page.url()))
} catch (err) {
  console.log("❌ EXCEPTION:", err.message)
  results.push({ name: "no-exception", ok: false })
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
