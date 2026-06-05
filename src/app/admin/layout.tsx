import type { Metadata } from "next"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminSessionProvider } from "@/components/admin/session-provider"
import { uploadRouter } from "@/app/api/uploadthing/core"
import "@uploadthing/react/styles.css"

export const metadata: Metadata = {
  title: "Admin — Dulce Infancia",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      {/* Hydrates the upload router config on the server so the uploader is
          ready on first paint (no client round-trip for config). */}
      <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 min-w-0 md:pl-0 pt-14 md:pt-0">{children}</main>
      </div>
    </AdminSessionProvider>
  )
}
