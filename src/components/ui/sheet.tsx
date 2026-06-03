"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

// Tipo común para props básicas
interface BaseProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

// Use ComponentProps<"div"> to ensure only valid HTML attributes are passed to the div
function Sheet({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet" className={className} {...props}>
      {children}
    </div>
  )
}

function SheetTrigger({ className, asChild = false, ...props }: BaseProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="sheet-trigger" className={className} {...props} />
}

function SheetClose({ className, asChild = false, ...props }: BaseProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="sheet-close" className={className} {...props} />
}

function SheetContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-content"
      className={cn("bg-white shadow-md rounded-md", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={className} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="sheet-title" className={className} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="sheet-description" className={className} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={className} {...props} />
}

export interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
}
