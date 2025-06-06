"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Define types for size and variant
type ToggleSize = "default" | "sm" | "lg" | string
type ToggleVariant = "default" | "outline" | string

// Define interface for context value
interface ToggleGroupContextValue {
  size: ToggleSize
  variant: ToggleVariant
}

// Define interface for ToggleGroup props
interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  variant?: ToggleVariant
  size?: ToggleSize
  children: React.ReactNode
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <div
      data-slot="toggle-group"
      className={cn("flex items-center", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </div>
  )
}

// Define interface for ToggleGroupItem props
interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
  pressed?: boolean
}

function ToggleGroupItem({
  className,
  children,
  pressed = false,
  onClick,
  onKeyDown,
  ...props
}: ToggleGroupItemProps) {
  // Consume context values
  const { variant, size } = React.useContext(ToggleGroupContext)
  
  // Handle toggle functionality
  const [isPressed, setIsPressed] = React.useState<boolean>(pressed)
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(!isPressed)
    onClick?.(event)
  }
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Toggle on Space or Enter key
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      setIsPressed(!isPressed)
    }
    onKeyDown?.(event)
  }
  
  return (
    <button
      data-slot="toggle-group-item"
      className={cn(
        "px-4 py-2",
        // Apply variant and size styles based on context
        variant === "outline" && "border border-input",
        size === "sm" && "px-2 py-1 text-sm",
        size === "lg" && "px-6 py-3 text-lg",
        isPressed && "bg-primary text-primary-foreground",
        className
      )}
      role="button"
      aria-pressed={isPressed}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
