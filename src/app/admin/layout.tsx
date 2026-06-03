import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminSessionProvider } from "@/components/admin/session-provider"

export const metadata: Metadata = {
  title: "Admin — Dulce Infancia",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 min-w-0 md:pl-0 pt-14 md:pt-0">{children}</main>
      </div>
    </AdminSessionProvider>
  )
}
