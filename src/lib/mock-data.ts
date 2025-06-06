// lib/mock-data.ts
// Este archivo centralizará los datos de maqueta para los productos.
// Comentario: Definición del tipo de producto para consistencia.
import type { Product } from "./types"

// Comentario: Lista completa de productos de maqueta.
// Los nombres y descripciones de productos ahora están en español.
export const allMockProducts: Product[] = [
  // Bebés
  {
    id: "baby-001",
    name: "Body Algodón Orgánico - Nubes", // Español
    price: 18000,
    image: "/placeholder.svg",
    category: "Babies", // Categoría en inglés para lógica interna
    sizes: ["NB", "0-3M", "3-6M", "6-9M"],
    colors: ["#F2F2F2", "#C3BDBF"],
    rating: 4.9,
    reviewCount: 112,
    description: "Suave body de algodón orgánico con un lindo estampado de nubes. Perfecto para el uso diario.", // Español
  },
  {
    id: "baby-002",
    name: "Ranita Tejida Bebé - Beige", // Español
    price: 25000,
    originalPrice: 30000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["0-3M", "3-6M"],
    colors: ["#D7D0C2"],
    isOnSale: true,
    rating: 4.7,
    reviewCount: 88,
    description: "Adorable ranita tejida, ideal para ocasiones especiales o un día acogedor.", // Español
  },
  {
    id: "baby-003",
    name: "Set Gorrito y Botitas Oso Bebé", // Español
    price: 15000,
    image: "/placeholder.svg",
    category: "Babies",
    sizes: ["One Size"], // Talla única
    colors: ["#A6A19F"],
    rating: 4.8,
    reviewCount: 95,
    description: "Mantén a tu pequeño abrigado con este lindo set de gorro y botitas de oso.", // Español
  },

  // Niñas
  {
    id: "girls-001",
    name: "Vestido Verano Estampado Floral", // Español
    price: 32000,
    image: "/placeholder.svg",
    category: "Girls", // Categoría en inglés
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#F2CF1D", "#FBF2ED", "#CDD5C6"],
    rating: 4.6,
    reviewCount: 75,
    description: "Vestido de verano ligero y fresco con un hermoso estampado floral.", // Español
  },
  {
    id: "girls-002",
    name: "Falda Tul Brillante - Rosa", // Español
    price: 28000,
    image: "/placeholder.svg",
    category: "Girls",
    sizes: ["XS", "S", "M"],
    colors: ["#F67280"],
    rating: 4.9,
    reviewCount: 102,
    description: "Una falda de tul divertida y brillante, perfecta para fiestas o jugar a disfrazarse.", // Español
  },
  {
    id: "girls-003",
    name: "Chaqueta Jean Niña con Parches", // Español
    price: 45000,
    originalPrice: 55000,
    image: "/placeholder.svg",
    category: "Girls",
    sizes: ["4T", "5T", "6Y", "7Y"],
    colors: ["#355C7D"],
    isOnSale: true,
    rating: 4.5,
    reviewCount: 60,
    description: "Moderna chaqueta de jean con lindos parches bordados.", // Español
  },

  // Niños
  {
    id: "boys-001",
    name: "Camiseta Gráfica Dinosaurio", // Español
    price: 20000,
    image: "/placeholder.svg",
    category: "Boys", // Categoría en inglés
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#CDD5C6", "#A6A19F"],
    rating: 4.7,
    reviewCount: 90,
    description: "Genial camiseta con un divertido gráfico de dinosaurio, hecha de suave algodón.", // Español
  },
  {
    id: "boys-002",
    name: "Shorts Cargo - Caqui", // Español
    price: 26000,
    image: "/placeholder.svg",
    category: "Boys",
    sizes: ["XS", "S", "M", "L"],
    colors: ["#D7D0C2"],
    rating: 4.5,
    reviewCount: 80,
    description: "Shorts cargo cómodos y duraderos, perfectos para aventuras.", // Español
  },
  {
    id: "boys-003",
    name: "Sudadera Rayas Niño con Capucha", // Español
    price: 38000,
    image: "/placeholder.svg",
    category: "Boys",
    sizes: ["4T", "5T", "6Y"],
    colors: ["#3E3A3B", "#F2F2F2"],
    rating: 4.6,
    reviewCount: 70,
    description: "Acogedora sudadera de rayas con capucha para los días más frescos.", // Español
  },

  // Esenciales
  {
    id: "essentials-001",
    name: "Pack 3 Camisetas Manga Larga Básicas Unisex", // Español
    price: 35000,
    image: "/placeholder.svg",
    category: "Essentials", // Categoría en inglés
    sizes: ["12M", "18M", "2T", "3T", "4T"],
    colors: ["#F2F2F2", "#C3BDBF", "#A6A19F"],
    rating: 4.9,
    reviewCount: 150,
    description: "Pack de tres camisetas esenciales de manga larga en colores neutros. Suaves y versátiles.", // Español
  },
  {
    id: "essentials-002",
    name: "Leggings Algodón Suave - Carbón", // Español
    price: 15000,
    image: "/placeholder.svg?height=400&width=300",
    category: "Essentials",
    sizes: ["6M", "12M", "18M", "2T", "3T"],
    colors: ["#3E3A3B"],
    rating: 4.7,
    reviewCount: 95,
    description: "Leggings de algodón cómodos y elásticos, un básico de armario.", // Español
  },
  {
    id: "essentials-003",
    name: "Pijama Enterizo Bebé - Blanco", // Español
    price: 22000,
    image: "/placeholder.svg?height=400&width=300",
    category: "Essentials",
    sizes: ["NB", "0-3M", "3-6M"],
    colors: ["#FFFFFF"],
    isNew: true,
    rating: 4.8,
    reviewCount: 120,
    description: "Pijamas enterizos esenciales para recién nacidos y bebés. Cierres a presión fáciles.", // Español
  },
]

// Comentario: Función para obtener productos por categoría.
export const getProductsByCategory = (categoryName: string): Product[] => {
  return allMockProducts.filter((product) => product.category === categoryName)
}

// Comentario: Función para obtener productos en oferta.
export const getSaleProducts = (): Product[] => {
  return allMockProducts.filter((product) => product.isOnSale)
}

// Comentario: Función para obtener productos esenciales.
export const getEssentialProducts = (): Product[] => {
  return allMockProducts.filter(
    (product) => product.category === "Essentials" || product.name.toLowerCase().includes("básic"), // Ajustado para buscar "básic" en español
  )
}
