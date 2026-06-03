import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"
import { Nunito, Atkinson_Hyperlegible } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { RadixThemeProvider } from "@/components/theme-provider"
import { seo } from "@/config/store.config"

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

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  generator: seo.generator,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <RadixThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </RadixThemeProvider>
      </body>
    </html>
  )
}
