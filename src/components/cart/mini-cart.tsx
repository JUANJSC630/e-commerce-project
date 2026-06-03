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
} from "@/components/ui/sheet"
import { routes, locale } from "@/config/store.config"

export function MiniCart() {
  const { items, getSubtotal, getItemCount, isCartOpen, closeCart } = useCart()
  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  // Only render the Sheet if cart is open
  if (!isCartOpen) return null;
  
  return (
    <Sheet className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={closeCart}></div>
      <SheetContent className="w-[350px] sm:w-[400px] bg-background text-foreground flex flex-col absolute right-0 top-0 h-full shadow-xl">
        <div className="flex justify-end pt-4 pr-4">
          <button onClick={closeCart} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        <SheetHeader className="px-6 pt-0 pb-4">
          <SheetTitle className="text-brand-ink text-lg font-semibold">
            Tu Carrito ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
          </SheetTitle>
          <SheetDescription className="text-sm text-brand-muted">
            Resumen de los productos en tu carrito de compras. Puedes modificar las cantidades o proceder al pago.
          </SheetDescription>
        </SheetHeader>
        <Separator className="bg-brand-muted/50" />
        {itemCount > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6 py-2">
              <div className="divide-y divide-brand-muted/30">
                {items.map((item) => (
                  <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} isMiniCart />
                ))}
              </div>
            </ScrollArea>
            <Separator className="bg-brand-muted/50" />
            <SheetFooter className="px-6 py-4 space-y-4">
              <div className="flex justify-between text-base font-medium text-brand-ink">
                <p>Subtotal</p>
                <p>{locale.currencySymbol}{subtotal.toLocaleString(locale.dateLocale)}</p>
              </div>
              <p className="text-xs text-brand-muted">Envío y descuentos calculados en el checkout.</p>
              <div className="space-y-2">
                <SheetClose asChild>
                  <Button asChild variant="default" className="w-full" onClick={closeCart}>
                    <Link href={routes.checkout}>Finalizar Compra</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full" onClick={closeCart}>
                    <Link href={routes.cart}>Ver Carrito</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingCart className="w-16 h-16 text-brand-muted mb-4" />
            <p className="text-lg font-semibold text-brand-ink mb-2">Tu carrito está vacío</p>
            <p className="text-sm text-brand-muted mb-4">¡Añade algunos productos adorables para empezar!</p>
            <SheetClose asChild>
              <Button variant="default" onClick={closeCart}>
                <Link href={routes.home}>Seguir Comprando</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
