/**
 * prisma/categories-data.ts
 * Initial categories, migrated out of the hardcoded store.config. The admin can
 * edit/add/remove these afterward. `legacyKey` maps the old Product.category
 * string to the new Category so existing products can be linked (backfill).
 * "Ofertas" is intentionally absent — it's the isOnSale flag, not a category.
 */

export interface CategorySeed {
  name: string
  slug: string
  /** The previous Product.category string this category replaces. */
  legacyKey: string
  description: string
  order: number
  metaTitle: string
  metaDescription: string
}

export const categoriesSeed: CategorySeed[] = [
  {
    name: "Bebés",
    slug: "babies",
    legacyKey: "Babies",
    order: 1,
    description: "Ropa adorable y cómoda para tus pequeños (0-24 meses).",
    metaTitle: "Ropa para Bebés (0-24m) — Dulce Infancia",
    metaDescription:
      "Descubre ropa adorable y cómoda para bebés de 0 a 24 meses en Dulce Infancia. Bodys, ranitas, conjuntos y más.",
  },
  {
    name: "Niñas",
    slug: "girls",
    legacyKey: "Girls",
    order: 2,
    description: "Atuendos elegantes y divertidos para cada pequeña princesa.",
    metaTitle: "Ropa para Niñas — Dulce Infancia",
    metaDescription:
      "Vestidos, faldas, chaquetas y más para niñas en Dulce Infancia. Moda infantil con estilo y calidad.",
  },
  {
    name: "Niños",
    slug: "boys",
    legacyKey: "Boys",
    order: 3,
    description: "Looks frescos y cómodos para los más activos.",
    metaTitle: "Ropa para Niños — Dulce Infancia",
    metaDescription:
      "Camisetas, pantalones, sudaderas y más para niños en Dulce Infancia. Ropa cómoda y duradera para los más activos.",
  },
  {
    name: "Esenciales",
    slug: "essentials",
    legacyKey: "Essentials",
    order: 4,
    description: "Básicos cómodos, duraderos y versátiles para el armario de tu hijo/a.",
    metaTitle: "Esenciales — Dulce Infancia",
    metaDescription:
      "Básicos cómodos, duraderos y versátiles para el armario de tu hijo/a. Selección de esenciales en Dulce Infancia.",
  },
]
