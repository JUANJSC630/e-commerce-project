import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { CategoryForm } from "@/components/admin/categories/category-form"

export default async function NuevaCategoriaPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "create")) redirect("/admin/categorias")

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/categorias" className="text-sm text-slate-500 hover:text-indigo-600">
          ← Volver a categorías
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Nueva categoría</h1>
      </div>
      <CategoryForm />
    </div>
  )
}
