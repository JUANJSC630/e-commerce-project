"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  min?: number
  max?: number // Para futura validación de stock
}

export function QuantitySelector({ quantity, onDecrease, onIncrease, min = 1 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-brand-charcoal hover:bg-brand-taupe/20"
        onClick={onDecrease}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center text-sm font-medium text-brand-charcoal">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-brand-charcoal hover:bg-brand-taupe/20"
        onClick={onIncrease}
        // disabled={max !== undefined && quantity >= max} // Habilitar con validación de stock
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
