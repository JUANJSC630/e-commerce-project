"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

// Tipo común para props básicas
interface BaseProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function Sheet({ ...props }: BaseProps) {
  return <div data-slot="sheet" {...props} />
}

function SheetTrigger({
  className,
  asChild = false,
  ...props
}: BaseProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="sheet-trigger" className={className} {...props} />
}

function SheetClose({
  className,
  asChild = false,
  ...props
}: BaseProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="sheet-close" className={className} {...props} />
}

function SheetContent({
  className,
  children,
  ...props
}: BaseProps) {
  return (
    <div data-slot="sheet-content" className={cn("bg-white shadow-md rounded-md", className)} {...props}>
      {children}
    </div>
  )
}

function SheetHeader({
  className,
  ...props
}: BaseProps) {
  return <div data-slot="sheet-header" className={className} {...props} />
}

function SheetTitle({
  className,
  ...props
}: BaseProps) {
  return <h2 data-slot="sheet-title" className={className} {...props} />
}

function SheetDescription({
  className,
  ...props
}: BaseProps) {
  return <p data-slot="sheet-description" className={className} {...props} />
}

function SheetFooter({
  className,
  ...props
}: BaseProps) {
  return <div data-slot="sheet-footer" className={className} {...props} />
}

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
