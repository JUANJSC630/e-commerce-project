// app/category/boys/page.tsx
"use client"

import { CategoryPage } from "@/components/category/category-page"

// Comentario: Página de categoría para "Niños".
export default function BoysCategoryPage() {
  return (
    <CategoryPage 
      category="Boys" // Internal category name used for data fetching
      title="Colección Niños" 
      description="Ropa genial y cómoda para pequeños aventureros activos."
    />
  )
}
