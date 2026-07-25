"use client"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { CartItem } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { SaveCartButton } from "@/components/cart/save-cart-button"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useSonner } from "@/hooks/use-sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export default function CartPage() {
  const { items, getItemCount, clearCart } = useCart()
  const { success, error } = useSonner()
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const itemCount = getItemCount()

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-24 h-24 text-brand-surface-alt mb-6" />
        <h1 className="text-3xl font-display font-bold text-brand-ink mb-4">
          Tu carrito está vacío
        </h1>
        <p className="text-brand-muted mb-8 max-w-md">
          Parece que aún no has añadido ninguna prenda adorable. ¡Explora nuestras colecciones y
          encuentra algo especial!
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
        <h1 className="text-3xl font-display font-bold text-brand-ink">
          Tu Carrito ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
        </h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <section className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-brand-muted/30">
          <div className="space-y-1">
            {" "}
            {/* Divide y vencerás para los bordes */}
            {items.map((item) => (
              <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <SaveCartButton />
            <Button
              variant="outline"
              onClick={() => setIsClearDialogOpen(true)}
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

      {/* Confirm clear cart dialog */}
      {isClearDialogOpen && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Vaciar el carrito?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsClearDialogOpen(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  try {
                    clearCart()
                    setIsClearDialogOpen(false)
                    success("Carrito vaciado con éxito", {
                      description: "Se han eliminado todos los productos del carrito.",
                    })
                  } catch (err) {
                    console.error("Error clearing cart:", err)
                    error("No se pudo vaciar el carrito", {
                      description: "Ha ocurrido un problema. Por favor, intenta de nuevo.",
                    })
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Vaciar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
