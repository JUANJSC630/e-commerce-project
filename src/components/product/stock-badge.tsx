import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { isLowStock, isOutOfStock } from "@/lib/inventory"

interface StockBadgeProps {
  stock?: number
  className?: string
}

/**
 * Renders an availability badge for tracked inventory:
 * - `Agotado` when out of stock
 * - `Últimas X unidades` when at or below the low-stock threshold
 * Renders nothing when stock is healthy or untracked.
 */
export function StockBadge({ stock, className }: StockBadgeProps) {
  if (isOutOfStock(stock)) {
    return (
      <Badge variant="destructive" className={className}>
        Agotado
      </Badge>
    )
  }

  if (isLowStock(stock)) {
    return (
      <Badge className={cn("border-transparent bg-amber-500 text-white", className)}>
        Últimas {stock} unidades
      </Badge>
    )
  }

  return null
}
