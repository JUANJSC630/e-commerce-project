import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3100"
const SHOTS = "/tmp/fav-shots"
const results = []
const check = (name, ok) => {
  results.push({ name, ok: !!ok })
  console.log(`${ok ? "✅" : "❌"} ${name}`)
}

const email = `e2e-${Date.now()}@e2etest.com`
const password = "Password123"
console.log("test email:", email)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1100, height: 1000 } })
// Guest already favorited a product (in localStorage) before signing up.
await context.addInitScript(() => {
  localStorage.setItem("dulceInfanciaFavorites", JSON.stringify(["girls-001"]))
})
const page = await context.newPage()

try {
  // Register (auth-changed → provider merges the guest favorite into the account)
  await page.goto(`${BASE}/cuenta/registro`, { waitUntil: "networkidle" })
  await page.locator("#name").fill("Fav Tester")
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("#confirm").fill(password)
  await page.getByRole("button", { name: "Crear cuenta" }).click()
  await page.waitForURL(`${BASE}/cuenta`, { timeout: 15000 })
  await page.waitForTimeout(1500) // let the merge round-trip

  // Guest favorite survived the signup
  await page.goto(`${BASE}/favoritos`, { waitUntil: "networkidle" })
  const merged = await page
    .getByText("Vestido Verano Estampado Floral")
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  check("Favorito de invitado se conserva al registrarse (merge a DB)", merged)
  await page.screenshot({ path: `${SHOTS}/1-favorites.png` })

  // Favorite a second product while logged in → persists to DB
  await page.goto(`${BASE}/products/boys-001`, { waitUntil: "networkidle" })
  await page
    .getByRole("button", { name: /Agregar a favoritos/i })
    .first()
    .click()
  await page.waitForTimeout(1000)

  await page.goto(`${BASE}/favoritos`, { waitUntil: "networkidle" })
  const both = await page.locator('a[aria-label^="Ver detalles"]').count()
  check(`Favorito agregado logueado aparece (${both} en /favoritos)`, both === 2)
  await page.screenshot({ path: `${SHOTS}/2-favorites-2.png` })
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
