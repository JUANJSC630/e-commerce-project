"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, viewportClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative", className)}
        {...props}
      >
        <div
          data-slot="scroll-area-viewport"
          className={cn(
            "h-full w-full overflow-auto rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            viewportClassName
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)

ScrollArea.displayName = "ScrollArea"

// Una versión simplificada del ScrollBar que es visualmente similar
const ScrollBar = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <div
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </div>
  )
})

ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
