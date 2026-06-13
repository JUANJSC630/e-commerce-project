import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import Link from "next/link"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { inventory } from "@/config/store.config"
import { ProductsTable } from "@/components/admin/products/products-table"
import type { Prisma } from "@prisma/client"

type StockFilter = "low" | "out"

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; stock?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "read")) redirect("/admin")

  const { q, page: pageStr, stock } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const take = 20
  const skip = (page - 1) * take

  const stockFilter: StockFilter | undefined =
    stock === "low" || stock === "out" ? stock : undefined

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(stockFilter === "out"
      ? { stock: { lte: 0 } }
      : stockFilter === "low"
        ? { stock: { gt: 0, lte: inventory.lowStockThreshold } }
        : {}),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ])

  const canCreate = hasPermission(perms, "products", "create")
  const canEdit = hasPermission(perms, "products", "update")
  const canDelete = hasPermission(perms, "products", "delete")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} productos en total</p>
        </div>
        {canCreate && (
          <Link
            href="/admin/productos/nuevo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Nuevo producto
          </Link>
        )}
      </div>

      <ProductsTable
        products={products}
        total={total}
        page={page}
        perPage={take}
        canEdit={canEdit}
        canDelete={canDelete}
        searchQuery={q}
        stockFilter={stockFilter}
      />
    </div>
  )
}
