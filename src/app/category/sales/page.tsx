// app/category/sales/page.tsx
"use client"

import { SalesPageComponent } from "@/components/category/sales-page"

// Comentario: Página para mostrar productos en oferta.
export default function SalesPage() {
  return (
    <SalesPageComponent 
      title="¡Ofertas Especiales!" 
      description="No te pierdas estos increíbles descuentos en prendas adorables."
    />
  )
}
