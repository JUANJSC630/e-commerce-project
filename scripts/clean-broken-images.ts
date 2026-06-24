/**
 * clean-broken-images.ts
 * -----------------------------------------------------------------------------
 * Normaliza las rutas de imagen guardadas en la base de datos: cualquier ruta
 * que apunte a un archivo inexistente dentro de `public/` se reemplaza por el
 * placeholder de fallback. Las URLs externas (http/https) y las imágenes que sí
 * existen no se tocan.
 *
 * Cubre:
 *   - Campos `image` de los modelos Product, Category y User.
 *   - Rutas de imagen anidadas dentro de los JSON de Setting (hero, banners,
 *     tiles de categoría del home, etc.).
 *
 * Uso:
 *   yarn db:clean-images          # dry-run: muestra qué cambiaría, sin escribir
 *   yarn db:clean-images --apply  # aplica los cambios en la base de datos
 *
 * IMPORTANTE — caché de Next:
 *   Los Setting del storefront se leen a través de `unstable_cache`
 *   (ver src/lib/settings.ts -> loadAllSettings), que solo se invalida vía
 *   `revalidateTag(SETTINGS_TAG)` cuando se guarda desde la app (saveSetting).
 *   Este script escribe DIRECTO en la base de datos, así que NO refresca esa
 *   caché. Tras correr con --apply, la home seguirá sirviendo las imágenes
 *   viejas hasta que la caché se invalide:
 *     - En dev: reinicia el server (rm -rf .next/cache y vuelve a `yarn dev`).
 *     - En prod: redeploy, o dispara una revalidación del tag de settings.
 * -----------------------------------------------------------------------------
 */
import { existsSync } from "node:fs"
import { join } from "node:path"
import "dotenv/config"
import { prisma } from "../src/lib/prisma"

const FALLBACK = "/placeholder.svg"
const PUBLIC_DIR = join(process.cwd(), "public")
const APPLY = process.argv.includes("--apply")

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i
const EXTERNAL_URL = /^https?:\/\//i

/** Resultado de una corrección individual, para el reporte final. */
interface Fix {
  scope: string
  label: string
  from: string
}

/** ¿La ruta resuelve a un archivo real en `public/` (o es una URL externa o el fallback)? */
function isResolvable(value: unknown): boolean {
  if (typeof value !== "string" || value.trim() === "") return true // nada que arreglar
  if (EXTERNAL_URL.test(value)) return true // URL externa: se respeta
  if (value === FALLBACK) return true
  const relative = value.startsWith("/") ? value.slice(1) : value
  return existsSync(join(PUBLIC_DIR, relative))
}

/** ¿El string parece una ruta de imagen (por extensión o convención de carpeta)? */
function looksLikeImagePath(value: string): boolean {
  return IMAGE_EXT.test(value) || value.startsWith("/placeholder/")
}

/**
 * Recorre un valor JSON arbitrario y reemplaza recursivamente las rutas de
 * imagen rotas por el fallback. Devuelve el nodo (posiblemente nuevo) y la lista
 * de rutas corregidas.
 */
function repairJson(node: unknown): { node: unknown; broken: string[] } {
  const broken: string[] = []

  const walk = (value: unknown): unknown => {
    if (typeof value === "string") {
      if (looksLikeImagePath(value) && !isResolvable(value)) {
        broken.push(value)
        return FALLBACK
      }
      return value
    }
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]))
    }
    return value
  }

  return { node: walk(node), broken }
}

/** Procesa un modelo con un único campo `image` de tipo string. */
async function cleanStringColumn<T extends { id: string }>(opts: {
  scope: string
  rows: (T & { image: string | null })[]
  label: (row: T) => string
  persist: (id: string) => Promise<unknown>
}): Promise<Fix[]> {
  const fixes: Fix[] = []
  for (const row of opts.rows) {
    if (isResolvable(row.image)) continue
    fixes.push({ scope: opts.scope, label: opts.label(row), from: row.image ?? "" })
    if (APPLY) await opts.persist(row.id)
  }
  return fixes
}

async function main() {
  console.log(`\n=== Limpieza de imágenes rotas — modo ${APPLY ? "APPLY" : "DRY-RUN"} ===\n`)
  const fixes: Fix[] = []

  // --- Columnas string `image` --------------------------------------------
  const [products, categories, users] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, image: true } }),
    prisma.category.findMany({ select: { id: true, name: true, image: true } }),
    prisma.user.findMany({ select: { id: true, email: true, image: true } }),
  ])

  fixes.push(
    ...(await cleanStringColumn({
      scope: "product",
      rows: products,
      label: (p) => p.name,
      persist: (id) => prisma.product.update({ where: { id }, data: { image: FALLBACK } }),
    })),
    ...(await cleanStringColumn({
      scope: "category",
      rows: categories,
      label: (c) => c.name,
      persist: (id) => prisma.category.update({ where: { id }, data: { image: FALLBACK } }),
    })),
    ...(await cleanStringColumn({
      scope: "user",
      rows: users,
      label: (u) => u.email,
      persist: (id) => prisma.user.update({ where: { id }, data: { image: FALLBACK } }),
    })),
  )

  // --- Rutas de imagen dentro de los JSON de Setting ----------------------
  const settings = await prisma.setting.findMany()
  for (const setting of settings) {
    const { node, broken } = repairJson(setting.value)
    if (broken.length === 0) continue
    for (const from of broken)
      fixes.push({ scope: `setting:${setting.key}`, label: setting.key, from })
    if (APPLY)
      await prisma.setting.update({ where: { key: setting.key }, data: { value: node as object } })
  }

  // --- Reporte ------------------------------------------------------------
  for (const fix of fixes) {
    console.log(`[${fix.scope}] "${fix.label}"  ${fix.from}  ->  ${FALLBACK}`)
  }

  if (fixes.length === 0) {
    console.log("Sin imágenes rotas. Nada que hacer.\n")
  } else {
    console.log(`\n${APPLY ? "Aplicadas" : "Detectadas"} ${fixes.length} corrección(es).`)
    if (!APPLY) {
      console.log("Ejecuta `yarn db:clean-images --apply` para guardar los cambios.\n")
    } else {
      console.log(
        "\n⚠ Caché de Next: la home lee los Setting vía unstable_cache y este script\n" +
          "  escribe directo a la BD. Para que se reflejen los cambios, invalida la caché:\n" +
          "    dev  -> rm -rf .next/cache && yarn dev\n" +
          "    prod -> redeploy o revalida el tag de settings.\n",
      )
    }
  }
}

main()
  .catch((error) => {
    console.error("\nError durante la limpieza:\n", error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
