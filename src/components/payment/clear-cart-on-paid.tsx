"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/use-cart"

/**
 * Empties the cart once an order is confirmed paid. Rendered only on the paid
 * success view, so a failed/abandoned payment keeps the cart intact for retry.
 */
export function ClearCartOnPaid() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
