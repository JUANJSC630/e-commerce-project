"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface HoverCardContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  openTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  closeTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  openDelay: number
  closeDelay: number
}

const HoverCardContext = React.createContext<HoverCardContextValue | undefined>(undefined)

const useHoverCardContext = () => {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error("HoverCard components must be used within a HoverCard")
  }
  return context
}

interface HoverCardProps extends React.ComponentProps<"div"> {
  openDelay?: number
  closeDelay?: number
}

function HoverCard({ children, openDelay = 300, closeDelay = 300, ...props }: HoverCardProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const cleanup = () => {
      const openTimer = openTimeoutRef.current
      const closeTimer = closeTimeoutRef.current

      if (openTimer) clearTimeout(openTimer)
      if (closeTimer) clearTimeout(closeTimer)
    }

    return cleanup
  }, [])

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
      openTimeoutRef,
      closeTimeoutRef,
      openDelay,
      closeDelay,
    }),
    [open, setOpen, openDelay, closeDelay],
  )

  return (
    <HoverCardContext.Provider value={contextValue}>
      <div data-state={open ? "open" : "closed"} data-slot="hover-card" {...props}>
        {children}
      </div>
    </HoverCardContext.Provider>
  )
}

function HoverCardTrigger({ className, ...props }: React.ComponentProps<"div">) {
  const { triggerRef, setOpen, openTimeoutRef, closeTimeoutRef, openDelay, closeDelay } =
    useHoverCardContext()

  const handleMouseEnter = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    openTimeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, openDelay)
  }, [setOpen, closeTimeoutRef, openTimeoutRef, openDelay])

  const handleMouseLeave = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, closeDelay)
  }, [setOpen, openTimeoutRef, closeTimeoutRef, closeDelay])

  return (
    <div
      ref={triggerRef}
      className={className}
      data-slot="hover-card-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  )
}

function HoverCardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { open, contentRef, triggerRef, setOpen, closeTimeoutRef, closeDelay } =
    useHoverCardContext()

  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  // Position the content based on the trigger element
  React.useEffect(() => {
    if (triggerRef.current && open) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: triggerRect.bottom + window.scrollY,
        left: triggerRect.left + window.scrollX + triggerRect.width / 2,
      })
    }
  }, [open, triggerRef])

  const handleMouseEnter = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [closeTimeoutRef])

  const handleMouseLeave = React.useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, closeDelay)
  }, [setOpen, closeTimeoutRef, closeDelay])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      data-slot="hover-card-content"
      className={cn(
        "absolute z-50 w-64 rounded-md border bg-popover p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95",
        className,
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
