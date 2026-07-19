import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSessionProvider } from "@/components/admin/session-provider"
import { uploadRouter } from "@/app/api/uploadthing/core"
import { authOptions } from "@/lib/auth-options"
import { isCustomer } from "@/lib/permissions"

export const metadata: Metadata = {
  title: "Admin - Dulce Infancia",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Keep customers out of the whole admin, regardless of which page they hit.
  // (Unauthenticated access is handled per-page + by the middleware; we don't
  // redirect on `!session` here because this layout also wraps /admin/login.)
  const session = await getServerSession(authOptions)
  if (session && isCustomer(session.user.role.slug)) redirect("/cuenta")

  return (
    <AdminSessionProvider>
      {/* Hydrates the upload router config on the server so the uploader is
          ready on first paint (no client round-trip for config). */}
      <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  )
}
