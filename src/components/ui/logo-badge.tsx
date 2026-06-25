import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LogoBadgeProps {
  children: ReactNode
  /** Accessible name. When set, the badge is exposed as an image (role + aria-label + title). */
  label?: string
  /**
   * Extra classes merged over the defaults. Because `cn` uses tailwind-merge, a
   * conflicting utility wins — e.g. `bg-[#00C853]` overrides the default white card.
   */
  className?: string
}

/**
 * A small rounded "card" that frames a brand logo or wordmark (payment methods,
 * partners, etc.). Reusable and fully customizable via `className`; defaults to a
 * white card so colored marks read clearly on dark surfaces.
 */
export function LogoBadge({ children, label, className }: LogoBadgeProps) {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label, title: label } : {})}
      className={cn(
        "inline-flex h-7 min-w-[40px] items-center justify-center rounded-md bg-white px-2 shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  )
}
