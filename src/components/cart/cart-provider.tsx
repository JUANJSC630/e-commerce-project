"use client"

import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { CartItem, Product, CartContextType } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"
import { trackAddToCart } from "@/lib/analytics"
import { clearCheckoutDraft } from "@/lib/checkout-draft"

export const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Mirror of `items` for reading the latest cart inside event handlers without
  // putting side effects in state updaters (which React invokes twice in
  // StrictMode, causing duplicate toasts).
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("dulceInfanciaCart")
        if (storedCart) {
          setItems(JSON.parse(storedCart))
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("dulceInfanciaCart", JSON.stringify(items))
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items])

  const getItemKey = (productId: string, selectedSize?: string, selectedColor?: string) => {
    return `${productId}-${selectedSize || "any"}-${selectedColor || "any"}`
  }

  const openCart = useCallback(() => setIsCartOpen(true), [])

  const addItem = useCallback(
    (
      product: Product,
      quantity: number,
      selectedSize?: string,
      selectedColor?: string,
      variantId?: string,
    ) => {
      const itemKey = getItemKey(product.id, selectedSize, selectedColor)

      // Pure updater: immutably add or bump the matching line.
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey,
        )
        if (existingIndex > -1) {
          return prevItems.map((item, i) =>
            i === existingIndex ? { ...item, quantity: item.quantity + quantity } : item,
          )
        }
        return [...prevItems, { ...product, quantity, selectedSize, selectedColor, variantId }]
      })

      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        category: product.category?.name,
      })

      toast.success(`${product.name} añadido al carrito!`, {
        description: `Cantidad: ${quantity}${selectedSize ? `, Talla: ${selectedSize}` : ""}${selectedColor ? `, Color: ${selectedColor}` : ""}`,
        icon: (
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={24}
            height={24}
            className="rounded-sm"
          />
        ),
      })
      openCart()
    },
    [openCart],
  )

  const removeItem = useCallback(
    (productId: string, selectedSize?: string, selectedColor?: string) => {
      const itemKey = getItemKey(productId, selectedSize, selectedColor)
      const itemToRemove = itemsRef.current.find(
        (item) => getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey,
      )

      setItems((prevItems) =>
        prevItems.filter(
          (item) => getItemKey(item.id, item.selectedSize, item.selectedColor) !== itemKey,
        ),
      )

      if (itemToRemove) {
        toast.info(`${itemToRemove.name} eliminado del carrito.`)
      }
    },
    [],
  )

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
      const itemKey = getItemKey(productId, selectedSize, selectedColor)
      const actualQuantity = Math.max(1, quantity) // Clamp to minimum 1

      setItems((prevItems) =>
        prevItems.map((item) =>
          getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey
            ? { ...item, quantity: actualQuantity }
            : item,
        ),
      )

      const item = itemsRef.current.find(
        (i) => getItemKey(i.id, i.selectedSize, i.selectedColor) === itemKey,
      )
      if (item) {
        toast.info(`Cantidad de ${item.name} actualizada a ${actualQuantity}.`)
      }
    },
    [],
  )

  const clearCart = useCallback(() => {
    // Low-level state mutation only. Any user-facing feedback belongs at the
    // call site (e.g. the cart page shows "Carrito vaciado con éxito"); the
    // payment flow clears the cart silently. Toasting here double-fired it -
    // once from the card form on approval and again from the confirmation
    // page's poller (initialStatus=PAID).
    setItems([])
    // An emptied cart means the checkout is over (payment succeeded or the
    // customer cleared it), so the saved in-progress checkout draft is stale.
    clearCheckoutDraft()
  }, [])

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const getTotal = useCallback(() => {
    // Placeholder for more complex total calculation (shipping, discounts)
    return getSubtotal()
  }, [getSubtotal])

  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getTotal,
        isCartOpen,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
