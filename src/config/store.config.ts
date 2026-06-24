/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              STORE CONFIGURATION — Edit this file           ║
 * ║   All brand-specific values live here. To clone for a new   ║
 * ║   client, update this file + src/config/theme.config.ts     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
}

export interface HeroBanner {
  title: string
  description: string
  image: string
  /** Alt text for the banner image (a11y/SEO). Falls back to the title when empty. */
  imageAlt?: string
  buttonText: string
  buttonLink: string
}

export interface FeaturedCategory {
  name: string
  image: string
  /** Alt text for the category image (a11y/SEO). Falls back to the name when empty. */
  imageAlt?: string
  href: string
}

export interface FeatureItem {
  icon: string // lucide-react icon name, e.g. "Package", "Gift"
  title: string
  description: string
}

export interface CategoryConfig {
  /** Internal key — must match product.category values in your data */
  key: string
  /** URL slug — must match /app/category/[slug]/page.tsx filename */
  slug: string
  /** Display title shown on the category page header */
  title: string
  /** Subtitle shown below the title */
  description: string
  /** Empty state message when no products exist */
  emptyMessage: string
  /** SEO meta title for this category page */
  metaTitle?: string
  /** SEO meta description for this category page */
  metaDescription?: string
}

export interface PaymentMethod {
  id: "card" | "mercadopago" | "bank" | string
  name: string
  description: string
}

// ─── Brand ────────────────────────────────────────────────────────────────────

export const brand = {
  /** Display name used in header logo, footer, checkout, SEO */
  name: "Dulce Infancia",

  /** Short tagline used in meta description and footer */
  tagline: "Ropa adorable para los más pequeños.",

  /** Longer description for SEO and About pages */
  description:
    "Tienda de ropa infantil con prendas de calidad para bebés, niñas y niños. Envíos a todo el mundo hispanohablante.",

  /** Path to logo image. Set to null to use text logo (brand.name) */
  logoImage: null as string | null,

  /** Footer copyright line */
  copyright: "Dulce Infancia. Todos los derechos reservados.",

  /** Footer secondary line */
  footerSubtext: "Diseñado con cariño para los más pequeños.",
}

// ─── Locale & Currency ────────────────────────────────────────────────────────

export const locale = {
  /** HTML lang attribute */
  language: "es",

  /** ISO 4217 currency code */
  currency: "COP",

  /** Symbol shown next to prices */
  currencySymbol: "$",

  /** Default country pre-filled in the checkout shipping form */
  defaultCountry: "Colombia",

  /** Used for number/date formatting (Intl.NumberFormat) */
  dateLocale: "es-CO",
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * Centralized route map. Rename pages here without hunting through components.
 * These must match your actual Next.js app/ directory structure.
 */
export const routes = {
  home: "/",
  cart: "/carrito",
  checkout: "/checkout-flow",
  products: "/products",
  essentials: "/essentials",
  search: "/search",
  favorites: "/favoritos",
  account: "/cuenta",
  policies: "/politicas",
  categoryBase: "/category", // e.g. /category/babies
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/**
 * Curated nav entries that are NOT database categories (special storefront
 * views). The main nav = active DB categories (admin-managed) + these. See
 * `getNavItems()` in src/lib/categories.ts.
 */
export const specialNavItems: NavItem[] = [
  { label: "Ofertas", href: `${routes.categoryBase}/sales` },
]

/**
 * Custom header links shown in the top nav, fully editable from the admin
 * (Configuración → Menú). Distinct from product categories, which live in the
 * "Categorías" mega-menu. Defaults point only to pages that exist.
 */
export const headerLinks: NavItem[] = [
  { label: "Novedades", href: routes.products },
  { label: "Ofertas", href: `${routes.categoryBase}/sales` },
  { label: "Esenciales", href: `${routes.categoryBase}/essentials` },
]

// ─── Shipping ─────────────────────────────────────────────────────────────────

export const shipping = {
  /** Order subtotal above which shipping is free */
  freeThreshold: 150_000,

  /** Cost when below freeThreshold and no zone matches the destination */
  standardCost: 10_000,

  /** Displayed delivery estimate */
  estimatedDays: "3-5 días hábiles",

  /**
   * Per-region rate overrides. The customer's `state` (departamento) is matched
   * against each zone's `states`; the first match wins, else `standardCost`.
   */
  zones: [] as { name: string; states: string[]; cost: number }[],

  /** IVA percentage applied to the order (0 = no tax shown). */
  taxRate: 0,

  /**
   * When true, prices already include the IVA (Colombian default) and the tax is
   * shown as the included portion. When false, the tax is added on top of the total.
   */
  taxIncluded: true,
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventory = {
  /** At or below this stock level the storefront shows an "Últimas X unidades" badge */
  lowStockThreshold: 5,
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

/**
 * List of accepted payment methods shown in checkout.
 * Add/remove entries to enable or disable options.
 */
export const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Tarjeta de Crédito/Débito",
    description: "Visa, Mastercard, American Express",
  },
  {
    id: "mercadopago",
    name: "MercadoPago",
    description: "Paga con tu cuenta de MercadoPago",
  },
  {
    id: "bank",
    name: "Transferencia Bancaria",
    description: "Pago por transferencia bancaria",
  },
]

// ─── Home Page ────────────────────────────────────────────────────────────────

export const heroBanners: HeroBanner[] = [
  {
    title: "Estilo Moderno para Pequeños",
    description: "Descubre la nueva colección con un toque dorado.",
    image: "/placeholder.svg",
    buttonText: "Ver Colección",
    buttonLink: routes.products,
  },
  {
    title: "¡Ofertas Brillantes!",
    description: "Aprovecha descuentos especiales en prendas seleccionadas.",
    image: "/placeholder.svg",
    buttonText: "Ver Ofertas",
    buttonLink: `${routes.categoryBase}/sales`,
  },
  {
    title: "Comodidad y Estilo",
    description: "Diseños neutros y modernos para el día a día.",
    image: "/placeholder.svg",
    buttonText: "Comprar Ahora",
    buttonLink: routes.essentials,
  },
]

export const featuredCategories: FeaturedCategory[] = [
  {
    name: "Bebés (0-24m)",
    image: "/placeholder.svg",
    href: `${routes.categoryBase}/babies`,
  },
  {
    name: "Niñas",
    image: "/placeholder.svg",
    href: `${routes.categoryBase}/girls`,
  },
  {
    name: "Niños",
    image: "/placeholder.svg",
    href: `${routes.categoryBase}/boys`,
  },
  {
    name: "Accesorios",
    image: "/placeholder.svg",
    href: `${routes.categoryBase}/sales`,
  },
]

/**
 * Features strip shown below the product grid on the homepage.
 * icon must be a valid lucide-react icon name.
 */
export const homeFeatures: FeatureItem[] = [
  { icon: "Package", title: "Envío Rápido", description: "A todo el país" },
  { icon: "Gift", title: "Empaque Especial", description: "Listo para regalar" },
  { icon: "ShieldCheck", title: "Pago Seguro", description: "Tus datos protegidos" },
  { icon: "Tag", title: "Calidad Garantizada", description: "Prendas que duran" },
]

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * Category page configuration.
 * Each entry maps a URL slug → display content.
 * Add new categories here + create the matching /app/category/[slug]/page.tsx.
 */
export const categories: CategoryConfig[] = [
  {
    key: "Babies",
    slug: "babies",
    title: "Colección Bebés",
    description: "Ropa adorable y cómoda para tus pequeños (0-24 meses).",
    emptyMessage: "Aún no hay productos en esta categoría. ¡Vuelve pronto!",
    metaTitle: `Ropa para Bebés (0-24m) — ${brand.name}`,
    metaDescription: `Descubre ropa adorable y cómoda para bebés de 0 a 24 meses en ${brand.name}. Bodys, ranitas, conjuntos y más.`,
  },
  {
    key: "Girls",
    slug: "girls",
    title: "Moda Niñas",
    description: "Atuendos elegantes y divertidos para cada pequeña princesa.",
    emptyMessage: "Aún no hay productos en esta categoría. ¡Vuelve pronto!",
    metaTitle: `Ropa para Niñas — ${brand.name}`,
    metaDescription: `Vestidos, faldas, chaquetas y más para niñas en ${brand.name}. Moda infantil con estilo y calidad.`,
  },
  {
    key: "Boys",
    slug: "boys",
    title: "Moda Niños",
    description: "Looks frescos y cómodos para los más activos.",
    emptyMessage: "Aún no hay productos en esta categoría. ¡Vuelve pronto!",
    metaTitle: `Ropa para Niños — ${brand.name}`,
    metaDescription: `Camisetas, pantalones, sudaderas y más para niños en ${brand.name}. Ropa cómoda y duradera para los más activos.`,
  },
  {
    key: "Sales",
    slug: "sales",
    title: "Ofertas",
    description: "Las mejores prendas a precios increíbles.",
    emptyMessage: "No hay artículos en oferta en este momento. ¡Vuelve más tarde!",
    metaTitle: `Ofertas de Ropa Infantil — ${brand.name}`,
    metaDescription: `Aprovecha los mejores descuentos en ropa para bebés, niñas y niños en ${brand.name}. Calidad a precios increíbles.`,
  },
]

// ─── SEO / Metadata ───────────────────────────────────────────────────────────

/** Brand shape consumed by the SEO builders below (so they honor live settings). */
export type BrandInfo = typeof brand

export interface SeoCopy {
  title: string
  description: string
}

/** Global site metadata defaults. Pass the active brand to reflect settings. */
export const seo = (b: BrandInfo) => ({
  title: `${b.name} Shop`,
  description: b.tagline,
  generator: "e-commerce-project",
})

/**
 * Per-page SEO copy as functions of the active brand. The page's
 * generateMetadata() resolves the live brand (from settings) and calls these,
 * so titles/descriptions update when the brand changes in /admin.
 */
export const pageSeo = {
  home: (b: BrandInfo): SeoCopy => ({
    title: `${b.name} — Ropa infantil adorable`,
    description: `${b.description} Descubre bebés, niñas, niños y esenciales.`,
  }),
  products: (b: BrandInfo): SeoCopy => ({
    title: `Todos los Productos — ${b.name}`,
    description: `Explora el catálogo completo de prendas adorables para bebés, niñas y niños en ${b.name}.`,
  }),
  essentials: (b: BrandInfo): SeoCopy => ({
    title: `Esenciales — ${b.name}`,
    description: `Básicos cómodos, duraderos y versátiles para el armario de tu hijo/a. Selección de esenciales en ${b.name}.`,
  }),
  search: (b: BrandInfo): SeoCopy => ({
    title: `Buscar — ${b.name}`,
    description: `Encuentra prendas para bebés, niñas y niños en ${b.name}.`,
  }),
  favorites: (b: BrandInfo): SeoCopy => ({
    title: `Mis Favoritos — ${b.name}`,
    description: `Tus prendas guardadas en ${b.name}. Revísalas y añádelas al carrito cuando quieras.`,
  }),
} as const

// ─── Promo Banner ─────────────────────────────────────────────────────────────

/**
 * Dismissible top-bar promotion. Set enabled: false to hide it entirely.
 */
export const promoBanner = {
  enabled: true,
  message: `🚚 Envío gratis en compras mayores a $${(150_000).toLocaleString("es-CO")}`,
  ctaText: "Ver ofertas",
  ctaHref: "/category/sales",
}

// ─── Social Links (optional) ──────────────────────────────────────────────────

export const social = {
  instagram: "",
  facebook: "",
  whatsapp: "",
  tiktok: "",
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contact = {
  email: "",
  phone: "",
  address: "",
}

// ─── Home Page Content ────────────────────────────────────────────────────────

/**
 * All user-visible copy for the homepage.
 * Change text here without touching any TSX file.
 */
export const homePageContent = {
  hero: {
    eyebrow: "Nueva temporada",
    viewAllLabel: "Ver todo",
  },
  categories: {
    eyebrow: "Colecciones",
    heading: "Encuentra lo que buscas",
  },
  promise: {
    quote:
      "Cada prenda que ves aquí fue elegida a mano — como si fuera para nuestra propia familia.",
    subtext: "No tenemos el catálogo más grande. Tenemos el que tiene sentido.",
    ctaLabel: "Conocer la selección",
  },
  products: {
    eyebrow: "Selección de la semana",
    heading: "Lo más querido",
    viewAllLabel: "Ver todo",
    viewAllMobileLabel: "Ver todos los productos",
    limit: 8,
  },
}

// ─── Home Content (aggregate, admin-managed) ────────────────────────────────────

/**
 * Everything the homepage renders, grouped so it can be edited from /admin as a
 * single `home_content` setting. Defaults below feed `loadAllSettings`; DB
 * overrides replace this whole object. The home page reads it via settings, not
 * these exports directly.
 */
export interface HomeContent {
  heroBanners: HeroBanner[]
  featuredCategories: FeaturedCategory[]
  homeFeatures: FeatureItem[]
  copy: typeof homePageContent
}

export const homeContent: HomeContent = {
  heroBanners,
  featuredCategories,
  homeFeatures,
  copy: homePageContent,
}
