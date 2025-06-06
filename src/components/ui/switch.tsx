"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const switchVariants = cva(
  "group relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-gray-300 data-[state=checked]:bg-primary",
        destructive: "bg-gray-300 data-[state=checked]:bg-destructive",
      },
      size: {
        default: "h-6 w-11",
        sm: "h-5 w-9",
        lg: "h-7 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface SwitchProps extends React.ComponentPropsWithoutRef<"button">, VariantProps<typeof switchVariants> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: "default" | "sm" | "lg"
  variant?: "default" | "destructive"
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, size, variant, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked)

    React.useEffect(() => {
      setIsChecked(checked)
    }, [checked])

    const handleToggle = () => {
      if (disabled) return
      const newState = !isChecked
      setIsChecked(newState)
      onCheckedChange?.(newState)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        handleToggle()
      }
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(switchVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span 
          className={cn(
            "flex items-center justify-center",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span
            className={cn(thumbVariants({ size }))}
            data-state={isChecked ? "checked" : "unchecked"}
          />
        </span>
        <span className="sr-only">Toggle</span>
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
