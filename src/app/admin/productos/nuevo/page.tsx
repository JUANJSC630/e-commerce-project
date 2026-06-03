import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { ProductForm } from "@/components/admin/products/product-form"

export default async function NuevoProductoPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "create")) redirect("/admin/productos")

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/productos" className="text-sm text-slate-500 hover:text-indigo-600">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  )
}
