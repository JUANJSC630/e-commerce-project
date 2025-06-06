"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
}

function Progress({
  className,
  value = 0,
  ...props
}: ProgressProps) {
  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="bg-primary h-full flex-1 transition-all"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export { Progress }
