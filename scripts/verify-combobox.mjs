import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3100"
const SHOTS = "/tmp/combobox-shots"
const results = []
const check = (name, cond) => {
  results.push({ name, ok: !!cond })
  console.log(`${cond ? "✅" : "❌"} ${name}`)
}

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
const context = await browser.newContext({ viewport: { width: 1100, height: 1000 } })
await context.addInitScript((c) => {
  localStorage.setItem("dulceInfanciaCart", JSON.stringify(c))
}, cart)
const page = await context.newPage()

try {
  // Step 1 (cart) → Shipping
  await page.goto(`${BASE}/checkout-flow`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /Continuar al envío/i }).click()
  await page.getByText("Información de envío").waitFor()
  await page.getByLabel("País *").waitFor()
  await page.screenshot({ path: `${SHOTS}/1-shipping.png` })

  // Country auto-detect → defaults to Colombia (geo null locally)
  const countryText = (await page.locator("#country").innerText()).trim()
  check(`País autocompletado = "Colombia" (got "${countryText}")`, countryText === "Colombia")

  // Pick department Valle del Cauca
  await page.locator("#state").click()
  await page.getByPlaceholder("Buscar departamento…").fill("Valle")
  await page.getByRole("option", { name: "Valle del Cauca", exact: true }).click()
  const stateText = (await page.locator("#state").innerText()).trim()
  check(
    `Departamento seleccionado = "Valle del Cauca" (got "${stateText}")`,
    stateText === "Valle del Cauca",
  )

  // City list of Valle includes Cali AND late-alphabet Tuluá (full list, not capped at 20)
  await page.locator("#city").click()
  await page.getByRole("option", { name: "Cali", exact: true }).waitFor()
  const optionCount = await page.getByRole("option").count()
  check(`Ciudad: lista poblada (${optionCount} opciones)`, optionCount > 20)
  // Zarzal is alphabetically last - must be present WITHOUT searching (no 20 cap).
  const zarzalUnsearched = await page.getByRole("option", { name: "Zarzal", exact: true }).count()
  check("Ciudad: Zarzal visible sin buscar (lista completa)", zarzalUnsearched === 1)
  await page.getByPlaceholder("Buscar ciudad…").fill("tul")
  const hasTulua = await page.getByRole("option", { name: "Tuluá", exact: true }).count()
  check("Ciudad: búsqueda 'tul' encuentra Tuluá (lista completa)", hasTulua === 1)
  await page.screenshot({ path: `${SHOTS}/2-valle-cities.png` })
  // clear search and pick Cali
  await page.getByPlaceholder("Buscar ciudad…").fill("")
  await page.getByRole("option", { name: "Cali", exact: true }).click()
  const cityText = (await page.locator("#city").innerText()).trim()
  check(`Ciudad seleccionada = "Cali" (got "${cityText}")`, cityText === "Cali")

  // Change department → city must RESET and load the new department's cities
  await page.locator("#state").click()
  await page.getByPlaceholder("Buscar departamento…").fill("Amaz")
  await page.getByRole("option", { name: "Amazonas", exact: true }).click()
  const cityAfter = (await page.locator("#city").innerText()).trim()
  check(`Cambiar departamento limpia la ciudad (got "${cityAfter}")`, /Selecciona/i.test(cityAfter))

  // Open city: should show Amazonas cities, NOT filtered by the stale "tul" query
  await page.locator("#city").click()
  await page.waitForTimeout(500)
  const amazonasCount = await page.getByRole("option").count()
  check(
    `Ciudad recargada para Amazonas sin query viejo (${amazonasCount} opciones)`,
    amazonasCount > 0,
  )
  await page.screenshot({ path: `${SHOTS}/3-amazonas-reset.png` })
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
