"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}

/**
 * Merges its props onto its single child element (Radix-style `asChild`).
 * Components render `<Slot>` instead of their default tag when `asChild` is set,
 * so the child becomes the rendered element while still receiving the
 * component's classes, handlers and ref. `className` is composed (slot + child);
 * other child props win on conflict.
 */
const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, className, ...props }, ref) => {
  if (!React.isValidElement(children)) return null

  const child = children as React.ReactElement<{ className?: string }>

  return React.cloneElement(child, {
    ...props,
    ...child.props,
    className: cn(className, child.props.className),
    ref,
  } as React.Attributes)
})

Slot.displayName = "Slot"

export { Slot }
