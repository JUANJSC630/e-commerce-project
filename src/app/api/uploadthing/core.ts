import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions, Resource } from "@/lib/permissions"

const f = createUploadthing()

/**
 * Builds a single-image endpoint gated by a permission resource. The
 * `.middleware` is the security boundary: only an authenticated admin who can
 * manage that resource obtains a presigned URL — anything thrown aborts the
 * upload before a byte reaches storage.
 */
function imageEndpoint(resource: Resource) {
  return f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      if (!session) throw new UploadThingError("No autorizado")

      const perms = session.user.role.permissions as Permissions
      const canManage =
        hasPermission(perms, resource, "create") || hasPermission(perms, resource, "update")
      if (!canManage) throw new UploadThingError("Sin permiso")

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl }))
}

export const uploadRouter = {
  productImage: imageEndpoint("products"),
  categoryImage: imageEndpoint("categories"),
  settingsImage: imageEndpoint("settings"),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
