"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Select({
  ...props
}: { children: React.ReactNode }) {
  return <div data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: { children: React.ReactNode }) {
  return <div data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: { children: React.ReactNode }) {
  return <div data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: { className?: string; size?: "sm" | "default"; children: React.ReactNode }) {
  return (
    <button
      data-slot="select-trigger"
      data-size={size}
      className={cn("border-input flex items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm", className)}
      {...props}
    >
      {children}
    </button>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="select-content" className={cn("bg-white shadow-md rounded-md", className)} {...props}>
      {children}
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectValue,
  SelectTrigger,
}
