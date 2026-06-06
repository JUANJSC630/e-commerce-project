import type React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { hasPermission, type Permissions } from "@/lib/permissions"
import { SettingsNav } from "@/components/admin/settings/settings-nav"

/**
 * Gates the whole settings area on the `settings:read` permission and frames
 * every sub-section with the shared header + section nav. Each child route
 * (marca, tema, envíos…) owns a single section.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "settings", "read")) redirect("/admin")

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Los cambios se guardan en base de datos y se reflejan en la tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] gap-6">
        <aside className="md:sticky md:top-6 self-start">
          <SettingsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
