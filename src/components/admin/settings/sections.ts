import {
  Store,
  Globe,
  Palette,
  Type,
  Truck,
  CreditCard,
  Megaphone,
  Share2,
  Mail,
  LayoutTemplate,
  Menu,
  type LucideIcon,
} from "lucide-react"

export interface SettingsSection {
  /** URL slug under /admin/settings */
  slug: string
  label: string
  description: string
  icon: LucideIcon
}

/** Single source of truth for the settings sub-navigation and routes. */
export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  { slug: "marca", label: "Marca", description: "Nombre, logo, textos", icon: Store },
  { slug: "localizacion", label: "Localización", description: "Idioma y moneda", icon: Globe },
  { slug: "tema", label: "Tema visual", description: "Colores y estilo", icon: Palette },
  { slug: "tipografia", label: "Tipografía", description: "Fuentes", icon: Type },
  { slug: "envios", label: "Envíos", description: "Costos y umbral", icon: Truck },
  { slug: "pagos", label: "Pagos", description: "Métodos de pago", icon: CreditCard },
  { slug: "promociones", label: "Promoción", description: "Banner superior", icon: Megaphone },
  { slug: "redes", label: "Redes sociales", description: "Enlaces sociales", icon: Share2 },
  { slug: "contacto", label: "Contacto", description: "Email, teléfono", icon: Mail },
  { slug: "menu", label: "Menú", description: "Enlaces del encabezado", icon: Menu },
  { slug: "inicio", label: "Inicio", description: "Contenido del home", icon: LayoutTemplate },
] as const
