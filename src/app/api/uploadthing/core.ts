import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

const f = createUploadthing()

/**
 * Server-side upload rules. The `.middleware` runs on every upload request and
 * is the security boundary: only authenticated admins with permission to manage
 * products may obtain a presigned URL. Anything thrown here aborts the upload
 * before a single byte reaches storage.
 */
export const uploadRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      if (!session) throw new UploadThingError("No autorizado")

      const perms = session.user.role.permissions as Permissions
      const canManage =
        hasPermission(perms, "products", "create") || hasPermission(perms, "products", "update")
      if (!canManage) throw new UploadThingError("Sin permiso para gestionar productos")

      // Whatever is returned here is available as `metadata` in onUploadComplete.
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      // Returned payload is forwarded to the client's onClientUploadComplete.
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
