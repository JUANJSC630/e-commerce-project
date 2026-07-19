import type { Permissions } from "@/lib/permissions"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: {
        id: string
        name: string
        slug: string
        permissions: Permissions
      }
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    role: {
      id: string
      name: string
      slug: string
      permissions: Permissions
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /**
     * The user id, or "" once the jwt callback finds the user no longer exists
     * in the DB (orphaned token). Read it through getSessionUserId(), which maps
     * the empty sentinel to null so callers treat it as logged out.
     */
    id: string
    role: {
      id: string
      name: string
      slug: string
      permissions: Permissions
    }
    /** Epoch ms of the last DB role re-sync (see jwt callback). */
    roleSyncedAt?: number
  }
}
