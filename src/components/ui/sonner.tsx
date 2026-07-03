"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

type ToasterCustomProps = ToasterProps & {
  /** Custom toast colors; each falls back to the site theme when omitted. */
  normalBg?: string
  normalText?: string
  normalBorder?: string
  /** Extra CSS vars merged onto the toaster (per-type sonner colors). */
  vars?: Record<string, string>
}

const Toaster = ({ normalBg, normalText, normalBorder, vars, ...props }: ToasterCustomProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": normalBg ?? "var(--popover)",
          "--normal-text": normalText ?? "var(--popover-foreground)",
          "--normal-border": normalBorder ?? "var(--border)",
          ...vars,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
