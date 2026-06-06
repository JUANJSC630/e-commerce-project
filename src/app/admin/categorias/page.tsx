import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { getAdminCategories } from "@/lib/categories"
import { CategoriesTable } from "@/components/admin/categories/categories-table"

export default async function AdminCategoriasPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "read")) redirect("/admin")

  const categories = await getAdminCategories()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
        {hasPermission(perms, "categories", "create") && (
          <Link
            href="/admin/categorias/nueva"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva categoría
          </Link>
        )}
      </div>

      <CategoriesTable
        categories={categories}
        canEdit={hasPermission(perms, "categories", "update")}
        canDelete={hasPermission(perms, "categories", "delete")}
      />
    </div>
  )
}
