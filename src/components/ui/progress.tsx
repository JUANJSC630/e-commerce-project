"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
        className="bg-primary h-full w-full flex-1 transition-all"
      />
    </div>
  )
}

export { Progress }
