import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3100"
const results = []
const check = (name, ok) => {
  results.push({ name, ok: !!ok })
  console.log(`${ok ? "✅" : "❌"} ${name}`)
}

const TEST_NAME = "QA Juguetes"
const TEST_SLUG = "qa-juguetes"

const browser = await chromium.launch()
const page = await browser
  .newContext({ viewport: { width: 1280, height: 1000 } })
  .then((c) => c.newPage())
page.on("dialog", (d) => d.accept()) // auto-confirm the delete dialog

try {
  // Login as the seeded super-admin
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.locator("#email").fill("admin@dulceinfancia.com")
  await page.locator("#password").fill("Admin123!")
  await page.getByRole("button", { name: /Iniciar sesión|Ingresar/i }).click()
  await page.waitForURL(/\/admin(\/)?$/, { timeout: 15000 })

  // Category list shows the seeded ones
  await page.goto(`${BASE}/admin/categorias`, { waitUntil: "networkidle" })
  const seeded = await page.getByText("Bebés", { exact: true }).count()
  check("Admin lista muestra categorías sembradas (Bebés)", seeded > 0)

  // Create a new category
  await page.getByRole("link", { name: /Nueva categoría/i }).click()
  await page.waitForURL(/\/admin\/categorias\/nueva/)
  const nameInput = page.locator('form input[type="text"]').first()
  await nameInput.waitFor()
  await nameInput.fill(TEST_NAME)
  // slug auto-derives from name; override to a stable test slug
  await page.getByPlaceholder("bebes").fill(TEST_SLUG)
  await page.getByRole("button", { name: /Crear categoría/i }).click()
  await page.waitForURL(/\/admin\/categorias(\/)?$/, { timeout: 15000 })
  const created = await page.getByText(TEST_NAME, { exact: true }).count()
  check("Categoría creada aparece en el admin", created > 0)

  // It shows up in the storefront nav (revalidateTag busted the cache)
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  const inNav = await page.locator(`a[href="/category/${TEST_SLUG}"]`).count()
  check("Categoría nueva aparece en la nav del storefront", inNav > 0)

  // Its category page renders (empty, no products yet)
  const pageStatus = await page.goto(`${BASE}/category/${TEST_SLUG}`).then((r) => r?.status())
  check(`/category/${TEST_SLUG} responde (${pageStatus})`, pageStatus === 200)

  // Delete it
  await page.goto(`${BASE}/admin/categorias`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: `Eliminar ${TEST_NAME}` }).click()
  await page.waitForTimeout(1500)
  const afterDelete = await page.getByText(TEST_NAME, { exact: true }).count()
  check("Categoría eliminada del admin", afterDelete === 0)

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  const navAfter = await page.locator(`a[href="/category/${TEST_SLUG}"]`).count()
  check("Categoría eliminada desaparece de la nav", navAfter === 0)
} catch (err) {
  console.log("❌ EXCEPTION:", err.message)
  results.push({ name: "no-exception", ok: false })
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
