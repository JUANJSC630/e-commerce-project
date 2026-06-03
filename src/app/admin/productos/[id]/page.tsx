import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { ProductForm } from "@/components/admin/products/product-form"

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "update")) redirect("/admin/productos")

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/productos" className="text-sm text-slate-500 hover:text-indigo-600">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Editar producto</h1>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
