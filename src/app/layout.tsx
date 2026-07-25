import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"
import { Nunito, Atkinson_Hyperlegible } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { RadixThemeProvider } from "@/components/theme-provider"
import { rootMetadata } from "@/lib/seo"
import { loadAllSettings } from "@/lib/settings"

const displayFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const bodyFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
})

export function generateMetadata(): Promise<Metadata> {
  return rootMetadata()
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { theme } = await loadAllSettings()

  // Per-type toast colors map onto sonner's rich-color CSS vars; they only apply
  // while rich colors are on, so per-type mode turns rich colors on.
  const toastPerTypeVars =
    theme.toastCustomColors && theme.toastPerType
      ? {
          "--success-bg": theme.toastSuccessBg,
          "--success-text": theme.toastSuccessText,
          "--success-border": theme.toastSuccessBorder,
          "--error-bg": theme.toastErrorBg,
          "--error-text": theme.toastErrorText,
          "--error-border": theme.toastErrorBorder,
          "--info-bg": theme.toastInfoBg,
          "--info-text": theme.toastInfoText,
          "--info-border": theme.toastInfoBorder,
        }
      : undefined

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <RadixThemeProvider>
          {children}
          <Toaster
            position={theme.toastPosition}
            // Custom+uniform overrides per-type; custom+per-type needs rich colors on
            // so sonner applies our --success/--error/--info vars.
            richColors={theme.toastCustomColors ? theme.toastPerType : theme.toastRichColors}
            closeButton={theme.toastCloseButton}
            expand={theme.toastExpand}
            duration={theme.toastDuration * 1000}
            toastOptions={{ style: { borderRadius: theme.toastRadius } }}
            {...(theme.toastCustomColors
              ? {
                  normalBg: theme.toastBg,
                  normalText: theme.toastText,
                  normalBorder: theme.toastBorder,
                }
              : {})}
            {...(toastPerTypeVars ? { vars: toastPerTypeVars } : {})}
          />
        </RadixThemeProvider>
      </body>
    </html>
  )
}
