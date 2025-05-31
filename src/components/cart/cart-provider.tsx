"use client"

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { CartItem, Product, CartContextType } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"

export const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const storedCart = localStorage.getItem("dulceInfanciaCart")
    if (storedCart) {
      setItems(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("dulceInfanciaCart", JSON.stringify(items))
  }, [items])

  const getItemKey = (productId: string, selectedSize?: string, selectedColor?: string) => {
    return `${productId}-${selectedSize || "any"}-${selectedColor || "any"}`
  }

  const openCart = useCallback(() => setIsCartOpen(true), [])
  
  const addItem = useCallback((product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    setItems((prevItems) => {
      const itemKey = getItemKey(product.id, selectedSize, selectedColor)
      const existingItemIndex = prevItems.findIndex(
        (item) => getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey,
      )

      let newItems
      if (existingItemIndex > -1) {
        newItems = [...prevItems]
        newItems[existingItemIndex].quantity += quantity
      } else {
        newItems = [...prevItems, { ...product, quantity, selectedSize, selectedColor }]
      }

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
      return newItems
    })
    openCart()
  }, [openCart])

  const removeItem = useCallback((productId: string, selectedSize?: string, selectedColor?: string) => {
    setItems((prevItems) => {
      const itemKey = getItemKey(productId, selectedSize, selectedColor)
      const itemToRemove = prevItems.find(
        (item) => getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey,
      )
      const newItems = prevItems.filter(
        (item) => getItemKey(item.id, item.selectedSize, item.selectedColor) !== itemKey,
      )

      if (itemToRemove) {
        toast.info(`${itemToRemove.name} eliminado del carrito.`)
      }
      return newItems
    })
  }, [])

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
      setItems((prevItems) => {
        const itemKey = getItemKey(productId, selectedSize, selectedColor)
        const newItems = prevItems
          .map((item) =>
            getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey
              ? { ...item, quantity: Math.max(0, quantity) }
              : item,
          )
          .filter((item) => item.quantity > 0) // Remove if quantity is 0

        const updatedItem =
          newItems.find((item) => getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey) ||
          prevItems.find((item) => getItemKey(item.id, item.selectedSize, item.selectedColor) === itemKey)
        if (updatedItem) {
          toast.info(`Cantidad de ${updatedItem.name} actualizada a ${quantity}.`)
        }
        return newItems
      })
    },
    [],
  )

  const clearCart = useCallback(() => {
    setItems([])
    toast.info("Carrito vaciado.")
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
