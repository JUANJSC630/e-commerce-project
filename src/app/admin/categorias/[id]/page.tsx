import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { getCategoryById } from "@/lib/categories"
import { CategoryForm } from "@/components/admin/categories/category-form"

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "update")) redirect("/admin/categorias")

  const { id } = await params
  const category = await getCategoryById(id)
  if (!category) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/categorias" className="text-sm text-slate-500 hover:text-indigo-600">
          ← Volver a categorías
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Editar categoría</h1>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}
