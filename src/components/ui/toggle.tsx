"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const toggleVariants = {
  default: "bg-transparent",
  outline:
    "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
}

function Toggle({
  className,
  variant = "default",
  ...props
}: {
  className?: string
  variant?: keyof typeof toggleVariants
}) {
  return (
    <button
      data-slot="toggle"
      className={cn(toggleVariants[variant], className)}
      {...props}
    />
  )
}

export { Toggle }
