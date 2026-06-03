import type { Product } from "./types"

export const allMockProducts: Product[] = [
  // Bebés
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
    description: "Mantén a tu pequeño abrigado con este lindo set de gorro y botitas de oso.",
  },
  {
    id: "baby-004",
    name: "Vestido Floral Bebé Niña",
    price: 35000,
    originalPrice: 45000,
    image: "/vestido-nina/tabata-morado-estampado-39698-726217_039698-2.webp",
    category: "Babies",
    sizes: ["3M", "6M", "9M", "12M"],
    colors: ["#F67280", "#F8B195", "#FFFFFF"],
    isOnSale: true,
    rating: 4.5,
    reviewCount: 23,
  },
  {
    id: "baby-005",
    name: "Body Básico Bebé Unisex",
    price: 18000,
    image: "/17211952012fd6203a0f7b39bb2242db32fbae2c39_thumbnail_900x.webp",
    category: "Babies",
    sizes: ["NB", "3M", "6M"],
    colors: ["#FFFFFF", "#E0E0E0", "#F8B195"],
    rating: 4.9,
    reviewCount: 102,
  },

  // Niñas
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
    description: "Moderna chaqueta de jean con lindos parches bordados.",
  },
  {
    id: "girls-004",
    name: "Pijama Unicornio Niña",
    price: 28000,
    originalPrice: 35000,
    image: "/17343976750a17c6239ef2ac046bd8274802812ee4.webp",
    category: "Girls",
    sizes: ["2T", "3T", "4T", "5T", "6T"],
    colors: ["#F67280", "#6C5B7B", "#F8B195"],
    isOnSale: true,
    rating: 4.7,
    reviewCount: 67,
  },

  // Niños
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
    description: "Acogedora sudadera de rayas con capucha para los días más frescos.",
  },
  {
    id: "boys-004",
    name: "Conjunto Deportivo Niño",
    price: 42000,
    image: "/fujed-verde-16925-747727_016925-1.webp",
    category: "Boys",
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#355C7D", "#6C5B7B", "#000000"],
    isNew: true,
    rating: 4.8,
    reviewCount: 45,
  },

  // Esenciales
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
    description:
      "Pijamas enterizos esenciales para recién nacidos y bebés. Cierres a presión fáciles.",
  },
]

export const getProductsByCategory = (categoryName: string): Product[] =>
  allMockProducts.filter((p) => p.category === categoryName)

export const getSaleProducts = (): Product[] => allMockProducts.filter((p) => p.isOnSale)

export const getEssentialProducts = (): Product[] =>
  allMockProducts.filter(
    (p) => p.category === "Essentials" || p.name.toLowerCase().includes("básic"),
  )

export const getProductById = (id: string): Product | undefined =>
  allMockProducts.find((p) => p.id === id)

export const getRelatedProducts = (product: Product, limit = 4): Product[] =>
  allMockProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit)

export const getFeaturedProducts = (limit = 8): Product[] => allMockProducts.slice(0, limit)

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return allMockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q),
  )
}

export const getProductsByIds = (ids: string[]): Product[] =>
  allMockProducts.filter((p) => ids.includes(p.id))
