"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

/**
 * Wraps authenticated admin pages with the nav sidebar. /admin/login is
 * excluded - there's no session yet, so the sidebar would render as an empty,
 * pointless column next to the login card instead of the business nav.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/admin/login") return <>{children}</>

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 md:pl-0 pt-14 md:pt-0">{children}</main>
    </div>
  )
}
