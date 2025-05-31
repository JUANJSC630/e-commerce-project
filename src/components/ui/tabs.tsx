"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: { className?: string; children: React.ReactNode }) {
  return (
    <div
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: { className?: string; children: React.ReactNode }) {
  return (
    <div
      data-slot="tabs-list"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: { className?: string; children: React.ReactNode }) {
  return (
    <button
      data-slot="tabs-trigger"
      className={cn("px-4 py-2", className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: { className?: string; children: React.ReactNode }) {
  return (
    <div
      data-slot="tabs-content"
      className={cn("p-4", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
