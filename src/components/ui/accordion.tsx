"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Create a context for the accordion to manage and share state
interface AccordionContextValue {
  openItems: string[]
  toggleItem: (itemId: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)
interface AccordionProps {
  className?: string
  children: React.ReactNode
  defaultOpenItems?: string[]
  type?: "single" | "multiple"
  collapsible?: boolean
}

function Accordion({
  className,
  children,
  defaultOpenItems = [],
  type = "single",
  collapsible = false,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultOpenItems)

  const toggleItem = React.useCallback(
    (itemId: string) => {
      setOpenItems((prev) => {
        // If the item is already open
        if (prev.includes(itemId)) {
          // For single type, only close if collapsible is true
          if (type === "single" && !collapsible) {
            return prev
          }
          // Otherwise remove the item
          return prev.filter((id) => id !== itemId)
        } else {
          // For single type, replace all items with this one
          if (type === "single") {
            return [itemId]
          }
          // For multiple type, add this item
          return [...prev, itemId]
        }
      })
    },
    [type, collapsible],
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div data-slot="accordion" className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  id,
  ariaControls,
  ariaExpanded = false,
  ...props
}: React.ComponentProps<"button"> & {
  id?: string
  ariaControls?: string
  ariaExpanded?: boolean
}) {
  return (
    <button
      id={id}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      data-slot="accordion-trigger"
      data-state={ariaExpanded ? "open" : "closed"}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200",
          ariaExpanded && "rotate-180",
        )}
      />
    </button>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
