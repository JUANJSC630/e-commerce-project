// app/category/girls/page.tsx
"use client"

import { CategoryPage } from "@/components/category/category-page"

// Comentario: Página de categoría para "Niñas".
export default function GirlsCategoryPage() {
  return (
    <CategoryPage 
      category="Girls" // Internal category name used for data fetching
      title="Moda Niñas" 
      description="Atuendos elegantes y divertidos para cada pequeña princesa."
    />
  )
}
