/**
 * prisma/products-data.ts
 * Catalog seed data. Mirrors the former src/lib/mock-data.ts but adds the
 * persistence-only fields (stock, isFeatured). Ids are explicit and stable so
 * existing favorites (stored in the browser) and shared links keep working.
 */

export interface ProductSeed {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  sizes: string[]
  colors: string[]
  description?: string
  isOnSale?: boolean
  isNew?: boolean
  isFeatured?: boolean
  stock: number
  rating?: number
  reviewCount?: number
}

export const productsSeed: ProductSeed[] = [
  // ─── Bebés ──────────────────────────────────────────────────────────────────
  {
    id: "baby-001",
    name: "Body Algodón Orgánico - Nubes",
    price: 18000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["NB", "0-3M", "3-6M", "6-9M"],
    colors: ["#F2F2F2", "#C3BDBF"],
    rating: 4.9,
    reviewCount: 112,
    isFeatured: true,
    stock: 40,
    description:
      "Suave body de algodón orgánico con un lindo estampado de nubes. Perfecto para el uso diario.",
  },
  {
    id: "baby-002",
    name: "Ranita Tejida Bebé - Beige",
    price: 25000,
    originalPrice: 30000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["0-3M", "3-6M"],
    colors: ["#D7D0C2"],
    isOnSale: true,
    rating: 4.7,
    reviewCount: 88,
    isFeatured: true,
    stock: 4,
    description: "Adorable ranita tejida, ideal para ocasiones especiales o un día acogedor.",
  },
  {
    id: "baby-003",
    name: "Set Gorrito y Botitas Oso Bebé",
    price: 15000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["One Size"],
    colors: ["#A6A19F"],
    rating: 4.8,
    reviewCount: 95,
    isFeatured: true,
    stock: 25,
    description: "Mantén a tu pequeño abrigado con este lindo set de gorro y botitas de oso.",
  },
  {
    id: "baby-004",
    name: "Vestido Floral Bebé Niña",
    price: 35000,
    originalPrice: 45000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["3M", "6M", "9M", "12M"],
    colors: ["#F67280", "#F8B195", "#FFFFFF"],
    isOnSale: true,
    rating: 4.5,
    reviewCount: 23,
    isFeatured: true,
    stock: 12,
  },
  {
    id: "baby-005",
    name: "Body Básico Bebé Unisex",
    price: 18000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["NB", "3M", "6M"],
    colors: ["#FFFFFF", "#E0E0E0", "#F8B195"],
    rating: 4.9,
    reviewCount: 102,
    isFeatured: true,
    stock: 60,
  },

  // ─── Niñas ──────────────────────────────────────────────────────────────────
  {
    id: "girls-001",
    name: "Vestido Verano Estampado Floral",
    price: 32000,
    image: "/placeholder.svg",
    category: "Girls",
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#F2CF1D", "#FBF2ED", "#CDD5C6"],
    rating: 4.6,
    reviewCount: 75,
    isFeatured: true,
    stock: 18,
    description: "Vestido de verano ligero y fresco con un hermoso estampado floral.",
  },
  {
    id: "girls-002",
    name: "Falda Tul Brillante - Rosa",
    price: 28000,
    image: "/placeholder.svg",
    category: "Girls",
    sizes: ["XS", "S", "M"],
    colors: ["#F67280"],
    rating: 4.9,
    reviewCount: 102,
    isFeatured: true,
    stock: 3,
    description:
      "Una falda de tul divertida y brillante, perfecta para fiestas o jugar a disfrazarse.",
  },
  {
    id: "girls-003",
    name: "Chaqueta Jean Niña con Parches",
    price: 45000,
    originalPrice: 55000,
    image: "/placeholder.svg",
    category: "Girls",
    sizes: ["4T", "5T", "6Y", "7Y"],
    colors: ["#355C7D"],
    isOnSale: true,
    rating: 4.5,
    reviewCount: 60,
    isFeatured: true,
    stock: 22,
    description: "Moderna chaqueta de jean con lindos parches bordados.",
  },
  {
    id: "girls-004",
    name: "Pijama Unicornio Niña",
    price: 28000,
    originalPrice: 35000,
    image: "/placeholder.svg",
    category: "Girls",
    sizes: ["2T", "3T", "4T", "5T", "6T"],
    colors: ["#F67280", "#6C5B7B", "#F8B195"],
    isOnSale: true,
    rating: 4.7,
    reviewCount: 67,
    stock: 15,
  },

  // ─── Niños ──────────────────────────────────────────────────────────────────
  {
    id: "boys-001",
    name: "Camiseta Gráfica Dinosaurio",
    price: 20000,
    image: "/placeholder.svg",
    category: "Boys",
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#CDD5C6", "#A6A19F"],
    rating: 4.7,
    reviewCount: 90,
    stock: 30,
    description: "Genial camiseta con un divertido gráfico de dinosaurio, hecha de suave algodón.",
  },
  {
    id: "boys-002",
    name: "Shorts Cargo - Caqui",
    price: 26000,
    image: "/placeholder.svg",
    category: "Boys",
    sizes: ["XS", "S", "M", "L"],
    colors: ["#D7D0C2"],
    rating: 4.5,
    reviewCount: 80,
    stock: 0,
    description: "Shorts cargo cómodos y duraderos, perfectos para aventuras.",
  },
  {
    id: "boys-003",
    name: "Sudadera Rayas Niño con Capucha",
    price: 38000,
    image: "/placeholder.svg",
    category: "Boys",
    sizes: ["4T", "5T", "6Y"],
    colors: ["#3E3A3B", "#F2F2F2"],
    rating: 4.6,
    reviewCount: 70,
    stock: 16,
    description: "Acogedora sudadera de rayas con capucha para los días más frescos.",
  },
  {
    id: "boys-004",
    name: "Conjunto Deportivo Niño",
    price: 42000,
    image: "/placeholder.svg",
    category: "Boys",
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#355C7D", "#6C5B7B", "#000000"],
    isNew: true,
    rating: 4.8,
    reviewCount: 45,
    stock: 9,
  },

  // ─── Esenciales ───────────────────────────────────────────────────────────────
  {
    id: "essentials-001",
    name: "Pack 3 Camisetas Manga Larga Básicas Unisex",
    price: 35000,
    image: "/placeholder.svg",
    category: "Essentials",
    sizes: ["12M", "18M", "2T", "3T", "4T"],
    colors: ["#F2F2F2", "#C3BDBF", "#A6A19F"],
    rating: 4.9,
    reviewCount: 150,
    stock: 50,
    description:
      "Pack de tres camisetas esenciales de manga larga en colores neutros. Suaves y versátiles.",
  },
  {
    id: "essentials-002",
    name: "Leggings Algodón Suave - Carbón",
    price: 15000,
    image: "/placeholder.svg",
    category: "Essentials",
    sizes: ["6M", "12M", "18M", "2T", "3T"],
    colors: ["#3E3A3B"],
    rating: 4.7,
    reviewCount: 95,
    stock: 5,
    description: "Leggings de algodón cómodos y elásticos, un básico de armario.",
  },
  {
    id: "essentials-003",
    name: "Pijama Enterizo Bebé - Blanco",
    price: 22000,
    image: "/placeholder.svg",
    category: "Essentials",
    sizes: ["NB", "0-3M", "3-6M"],
    colors: ["#FFFFFF"],
    isNew: true,
    rating: 4.8,
    reviewCount: 120,
    stock: 28,
    description:
      "Pijamas enterizos esenciales para recién nacidos y bebés. Cierres a presión fáciles.",
  },
]
