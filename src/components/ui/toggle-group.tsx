"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext({
  size: "default" as string,
  variant: "default" as string,
})

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: {
  className?: string
  variant?: string
  size?: string
  children: React.ReactNode
}) {
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

function ToggleGroupItem({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      data-slot="toggle-group-item"
      className={cn("px-4 py-2", className)}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
