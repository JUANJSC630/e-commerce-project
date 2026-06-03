import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { loadAllSettings } from "@/lib/settings"
import { SettingsEditor } from "@/components/admin/settings/settings-editor"

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "settings", "read")) redirect("/admin")

  const settings = await loadAllSettings()

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Todos los ajustes de la tienda. Los cambios se guardan en base de datos y sobreescriben
          los valores por defecto.
        </p>
      </div>

      <SettingsEditor settings={settings} />
    </div>
  )
}
