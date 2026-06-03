import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { UsersTable } from "@/components/admin/users/users-table"

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "users", "read")) redirect("/admin")

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { role: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ])

  const canEdit = hasPermission(perms, "users", "update")
  const canCreate = hasPermission(perms, "users", "create")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} usuarios</p>
        </div>
        {canCreate && (
          <a
            href="/admin/usuarios/nuevo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Nuevo usuario
          </a>
        )}
      </div>
      <UsersTable users={users} roles={roles} canEdit={canEdit} currentUserId={session.user.id} />
    </div>
  )
}
