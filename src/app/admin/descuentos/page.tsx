import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { DiscountsManager } from "@/components/admin/discounts/discounts-manager"

export default async function DescuentosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "discounts", "read")) redirect("/admin")

  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" }, take: 200 })

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Descuentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Códigos que los clientes aplican en el checkout. Se validan en el servidor.
        </p>
      </div>
      <DiscountsManager
        initial={discounts.map((d) => ({
          ...d,
          startsAt: d.startsAt?.toISOString() ?? null,
          endsAt: d.endsAt?.toISOString() ?? null,
          createdAt: d.createdAt.toISOString(),
        }))}
        canCreate={hasPermission(perms, "discounts", "create")}
        canDelete={hasPermission(perms, "discounts", "delete")}
        canUpdate={hasPermission(perms, "discounts", "update")}
      />
    </div>
  )
}
