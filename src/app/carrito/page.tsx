"use client"

import { useCart } from "@/hooks/use-cart"
import { CartItem } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { items, getItemCount, clearCart } = useCart()
  const itemCount = getItemCount()

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-24 h-24 text-brand-silver mb-6" />
        <h1 className="text-3xl font-montserrat font-bold text-brand-charcoal mb-4">Tu carrito está vacío</h1>
        <p className="text-brand-taupe mb-8 max-w-md">
          Parece que aún no has añadido ninguna prenda adorable. ¡Explora nuestras colecciones y encuentra algo
          especial!
        </p>
        <Button asChild size="lg">
          <Link href="/">Descubrir Productos</Link>
        </Button>
      </div>
    )
  }

  // Adaptar items para CartSummary si es necesario
  const summaryItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-brand-charcoal">
          Tu Carrito ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
        </h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <section className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-brand-taupe/30">
          <div className="space-y-1">
            {" "}
            {/* Divide y vencerás para los bordes */}
            {items.map((item) => (
              <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={clearCart}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Vaciar Carrito
            </Button>
          </div>
        </section>

        <aside className="lg:col-span-1">
          <CartSummary items={summaryItems} />
        </aside>
      </div>

      {/* Sección "También te puede interesar" (Placeholder) */}
      <section className="mt-16">
        <h2 className="text-2xl font-montserrat font-semibold text-brand-charcoal mb-6">También te podría interesar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {/* Placeholder para productos relacionados */}
          {[1, 2, 3, 4].map((p) => (
            <div key={p} className="bg-card p-4 rounded-lg shadow border border-brand-taupe/30">
              <div className="aspect-square bg-brand-silver/50 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-brand-silver/50 rounded w-3/4 mb-1 animate-pulse"></div>
              <div className="h-4 bg-brand-silver/50 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
