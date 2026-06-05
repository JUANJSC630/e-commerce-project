import { inventory } from "@/config/store.config"

/**
 * Inventory predicates shared by the product card and detail views.
 * `stock === undefined` means the product doesn't track inventory, so it's
 * always considered available.
 */

export function isStockTracked(stock?: number): stock is number {
  return typeof stock === "number"
}

export function isOutOfStock(stock?: number): boolean {
  return isStockTracked(stock) && stock <= 0
}

export function isLowStock(stock?: number): boolean {
  return isStockTracked(stock) && stock > 0 && stock <= inventory.lowStockThreshold
}
