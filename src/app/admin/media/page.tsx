import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { canManageMedia } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { scanMediaUsage } from "@/lib/media-manager"
import { MediaManagerPage } from "@/components/admin/media/media-manager-page"

export default async function AdminMediaPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!canManageMedia(perms)) redirect("/admin")

  const scan = await scanMediaUsage()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medios</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Archivos del CDN, con detección de huérfanos sin referencias en la tienda.
        </p>
      </div>
      <MediaManagerPage initialScan={scan} />
    </div>
  )
}
