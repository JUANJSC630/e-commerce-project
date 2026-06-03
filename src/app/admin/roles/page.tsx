import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { RolesEditor } from "@/components/admin/roles/roles-editor"

export default async function AdminRolesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "roles", "read")) redirect("/admin")

  const roles = await prisma.role.findMany({ orderBy: { createdAt: "asc" } })

  const canCreate = hasPermission(perms, "roles", "create")
  const canEdit = hasPermission(perms, "roles", "update")
  const canDelete = hasPermission(perms, "roles", "delete")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles y permisos</h1>
        <p className="text-slate-500 text-sm mt-0.5">Los roles de sistema no se pueden eliminar</p>
      </div>
      <RolesEditor roles={roles} canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />
    </div>
  )
}
