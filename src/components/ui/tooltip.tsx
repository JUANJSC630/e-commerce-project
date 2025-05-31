"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function TooltipProvider({
  ...props
}: { delayDuration?: number; children: React.ReactNode }) {
  return (
    <div data-slot="tooltip-provider" {...props} />
  )
}

function Tooltip({
  ...props
}: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: { children: React.ReactNode }) {
  return <button data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  children,
  side,
  align,
  hidden,
  ...props
}: { 
  className?: string; 
  sideOffset?: number; 
  children: React.ReactNode;
  side?: string;
  align?: string;
  hidden?: boolean;
}) {
  return (
    <div 
      data-slot="tooltip-content" 
      className={cn("bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs", className)} 
      data-side={side}
      data-align={align}
      style={{ display: hidden ? 'none' : undefined }}
      {...props}
    >
      {children}
      <div className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
