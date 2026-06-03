"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Popover({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-trigger" {...props} />
}

function PopoverContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
        className,
      )}
      {...props}
    />
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
