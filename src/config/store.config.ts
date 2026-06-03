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
  buttonText: string
  buttonLink: string
  bgColorClass: string
  textColorClass: string
}

export interface FeaturedCategory {
  name: string
  image: string
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
  policies: "/politicas",
  categoryBase: "/category", // e.g. /category/babies
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/**
 * Desktop + mobile navigation links.
 * Add, remove or reorder items to change the nav everywhere at once.
 */
export const navigation: NavItem[] = [
  { label: "Bebés", href: `${routes.categoryBase}/babies` },
  { label: "Niñas", href: `${routes.categoryBase}/girls` },
  { label: "Niños", href: `${routes.categoryBase}/boys` },
  { label: "Ofertas", href: `${routes.categoryBase}/sales` },
  { label: "Esenciales", href: routes.essentials },
]

// ─── Shipping ─────────────────────────────────────────────────────────────────

export const shipping = {
  /** Order subtotal above which shipping is free */
  freeThreshold: 150_000,

  /** Cost when below freeThreshold */
  standardCost: 10_000,

  /** Displayed delivery estimate */
  estimatedDays: "3-5 días hábiles",
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
    image: "/pexels-matilda-wormwood-7484842.jpg",
    buttonText: "Ver Colección",
    buttonLink: routes.products,
    bgColorClass: "bg-brand-surface-alt/60",
    textColorClass: "text-brand-ink",
  },
  {
    title: "¡Ofertas Brillantes!",
    description: "Aprovecha descuentos especiales en prendas seleccionadas.",
    image: "/8683985.jpg",
    buttonText: "Ver Ofertas",
    buttonLink: `${routes.categoryBase}/sales`,
    bgColorClass: "bg-brand-accent/20",
    textColorClass: "text-brand-ink",
  },
  {
    title: "Comodidad y Estilo",
    description: "Diseños neutros y modernos para el día a día.",
    image: "/pexels-pixabay-272056.jpg",
    buttonText: "Comprar Ahora",
    buttonLink: routes.essentials,
    bgColorClass: "bg-brand-muted/20",
    textColorClass: "text-brand-ink",
  },
]

export const featuredCategories: FeaturedCategory[] = [
  {
    name: "Bebés (0-24m)",
    image: "/placeholder/bebes-0-24.png",
    href: `${routes.categoryBase}/babies`,
  },
  {
    name: "Niñas",
    image: "/placeholder/ninas-1-6.png",
    href: `${routes.categoryBase}/girls`,
  },
  {
    name: "Niños",
    image: "/placeholder/ninos-1-6.png",
    href: `${routes.categoryBase}/boys`,
  },
  {
    name: "Accesorios",
    image: "/placeholder/accesorios.png",
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
  },
  {
    key: "Girls",
    slug: "girls",
    title: "Moda Niñas",
    description: "Atuendos elegantes y divertidos para cada pequeña princesa.",
    emptyMessage: "Aún no hay productos en esta categoría. ¡Vuelve pronto!",
  },
  {
    key: "Boys",
    slug: "boys",
    title: "Moda Niños",
    description: "Looks frescos y cómodos para los más activos.",
    emptyMessage: "Aún no hay productos en esta categoría. ¡Vuelve pronto!",
  },
  {
    key: "Sales",
    slug: "sales",
    title: "Ofertas",
    description: "Las mejores prendas a precios increíbles.",
    emptyMessage: "No hay artículos en oferta en este momento. ¡Vuelve más tarde!",
  },
]

export const essentialsConfig = {
  title: "Esenciales de Cada Día",
  description: "Básicos cómodos, duraderos y versátiles para el armario de tu hijo/a.",
  emptyMessage:
    "No se encontraron productos esenciales. Por favor, revisa nuestras otras categorías.",
}

// ─── SEO / Metadata ───────────────────────────────────────────────────────────

export const seo = {
  title: `${brand.name} Shop`,
  description: brand.tagline,
  generator: "e-commerce-project",
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
