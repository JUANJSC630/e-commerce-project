import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3100"
const ORDER_ID = process.env.ORDER_ID ?? ""
const OUT = "/tmp/admin-ss"

const pages = [
  ["dashboard", "/admin"],
  ["productos-lista", "/admin/productos"],
  ["producto-form", "/admin/productos/nuevo"],
  ["categorias-lista", "/admin/categorias"],
  ["categoria-form", "/admin/categorias/nueva"],
  ["pedidos-lista", "/admin/pedidos"],
  ["pedido-detalle", `/admin/pedidos/${ORDER_ID}`],
  ["usuarios", "/admin/usuarios"],
  ["roles", "/admin/roles"],
  ["settings", "/admin/settings"],
]

const browser = await chromium.launch()
const page = await browser
  .newContext({ viewport: { width: 1440, height: 900 } })
  .then((c) => c.newPage())

await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
await page.locator("#email").fill("admin@dulceinfancia.com")
await page.locator("#password").fill("Admin123!")
await page.getByRole("button", { name: /Iniciar sesión|Ingresar/i }).click()
await page.waitForURL(/\/admin(\/)?$/, { timeout: 15000 })

for (const [name, path] of pages) {
  if (path.endsWith("/")) continue
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log("shot", name)
}

await browser.close()
