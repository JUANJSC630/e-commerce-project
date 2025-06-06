// app/category/babies/page.tsx
"use client"

import { CategoryPage } from "@/components/category/category-page"

// Comentario: Esta es la página de categoría para "Bebés".
export default function BabiesCategoryPage() {
  return (
    <CategoryPage 
      category="Babies" // Internal category name used for data fetching
      title="Colección Bebés" 
      description="Ropa adorable y cómoda para tus pequeños (0-24 meses)."
    />
  )
}
