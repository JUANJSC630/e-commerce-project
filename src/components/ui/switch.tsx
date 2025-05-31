"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: { className?: string }) {
  return (
    <div
      data-slot="switch"
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <div data-slot="switch-thumb" className="bg-gray-300 w-8 h-4 rounded-full" />
    </div>
  )
}

export { Switch }
