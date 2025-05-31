"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { CartItem } from "./cart-item"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet" // Añadir SheetDescription

export function MiniCart() {
  const { items, getSubtotal, getItemCount, isCartOpen } = useCart()
  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  // Only render the Sheet if cart is open
  if (!isCartOpen) return null;

  return (
    <Sheet>
      <SheetContent className="w-[350px] sm:w-[400px] bg-background text-foreground flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-brand-charcoal text-lg font-semibold">
            Tu Carrito ({itemCount} {itemCount === 1 ? "item" : "items"})
          </SheetTitle>
          {/* Añadir SheetDescription para accesibilidad */}
          <SheetDescription className="text-sm text-brand-taupe">
            Resumen de los productos en tu carrito de compras. Puedes modificar las cantidades o proceder al pago.
          </SheetDescription>
        </SheetHeader>
        <Separator className="bg-brand-taupe/50" />
        {itemCount > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6 py-2">
              <div className="divide-y divide-brand-taupe/30">
                {items.map((item) => (
                  <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} isMiniCart />
                ))}
              </div>
            </ScrollArea>
            <Separator className="bg-brand-taupe/50" />
            <SheetFooter className="px-6 py-4 space-y-4">
              <div className="flex justify-between text-base font-medium text-brand-charcoal">
                <p>Subtotal</p>
                <p>${subtotal.toLocaleString()}</p>
              </div>
              <p className="text-xs text-brand-taupe">Envío y descuentos calculados en el checkout.</p>
              <div className="space-y-2">
                <SheetClose asChild>
                  <Button asChild variant="default" className="w-full">
                    <Link href="/checkout-flow">Finalizar Compra</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/carrito">Ver Carrito</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingCart className="w-16 h-16 text-brand-silver mb-4" />
            <p className="text-lg font-semibold text-brand-charcoal mb-2">Tu carrito está vacío</p>
            <p className="text-sm text-brand-taupe mb-4">¡Añade algunos productos adorables para empezar!</p>
            <SheetClose asChild>
              <Button variant="default">
                <Link href="/">Seguir Comprando</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
