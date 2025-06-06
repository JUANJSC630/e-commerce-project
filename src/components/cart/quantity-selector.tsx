"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

/**
 * Props for the QuantitySelector component
 */
interface QuantitySelectorProps {
  /** Current quantity value */
  quantity: number
  /** Callback when quantity should decrease */
  onDecrease: () => void
  /** Callback when quantity should increase */
  onIncrease: () => void
  /** Minimum allowed quantity */
  min?: number
  /** Maximum allowed quantity (for stock validation) */
  max?: number
}

export function QuantitySelector({ quantity, onDecrease, onIncrease, min = 1, max }: QuantitySelectorProps) {
  // Validate that quantity is a non-negative integer and at least the minimum value
  const validatedQuantity = React.useMemo(() => {
    // Check if quantity is a valid number
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      console.warn('QuantitySelector: quantity must be a valid number');
      return min;
    }
    
    // Check if quantity is a non-negative integer
    if (quantity < 0 || !Number.isInteger(quantity)) {
      console.warn('QuantitySelector: quantity must be a non-negative integer');
      return min;
    }
    
    // Check if quantity is at least the minimum value
    if (quantity < min) {
      console.warn(`QuantitySelector: quantity (${quantity}) is less than minimum (${min})`);
      return min;
    }
    
    // Check if quantity exceeds the maximum value (if provided)
    if (max !== undefined && quantity > max) {
      console.warn(`QuantitySelector: quantity (${quantity}) exceeds maximum (${max})`);
      return max;
    }
    
    return quantity;
  }, [quantity, min, max]);
  
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-brand-charcoal hover:bg-brand-taupe/20"
        onClick={onDecrease}
        disabled={validatedQuantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center text-sm font-medium text-brand-charcoal">{validatedQuantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-brand-charcoal hover:bg-brand-taupe/20"
        onClick={onIncrease}
        disabled={max !== undefined && validatedQuantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
