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

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <RadixThemeProvider>
          {children}
          <Toaster position={theme.toastPosition} richColors={theme.toastRichColors} closeButton />
        </RadixThemeProvider>
      </body>
    </html>
  )
}
