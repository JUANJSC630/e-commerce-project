import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { claimGuestOrders } from "@/lib/account"
import { isRateLimited, recordRateLimitHit } from "@/lib/rate-limit"
import { CUSTOMER_ROLE_SLUG } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 10 * 60 * 1000

/**
 * How often the JWT re-reads the user's role from the database. Without this a
 * role change (or deactivation) wouldn't take effect until the token expired -
 * a degraded admin could keep their old access. 5 min bounds that window while
 * keeping the per-request DB cost negligible.
 */
const ROLE_SYNC_TTL_MS = 5 * 60 * 1000

/** Role given to a deactivated/deleted user: no permissions, bounced out of admin. */
const REVOKED_ROLE = {
  id: "",
  name: "Inactivo",
  slug: CUSTOMER_ROLE_SLUG,
  permissions: {} as Permissions,
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.trim().toLowerCase()

        const limited = await isRateLimited({
          action: "login",
          identifier: email,
          max: LOGIN_MAX_ATTEMPTS,
          windowMs: LOGIN_WINDOW_MS,
        })
        if (limited) throw new Error("Demasiados intentos. Intenta de nuevo en 10 minutos.")

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        })

        const passwordValid =
          !!user &&
          user.status === "ACTIVE" &&
          (await bcrypt.compare(credentials.password, user.password))
        if (!passwordValid) {
          await recordRateLimitHit("login", email, LOGIN_WINDOW_MS)
          return null
        }

        await claimGuestOrders(user.email, user.id)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: {
            id: user.role.id,
            name: user.role.name,
            slug: user.role.slug,
            permissions: user.role.permissions as Permissions,
          },
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.roleSyncedAt = Date.now()
        return token
      }

      // Re-sync the role from the DB at most once per TTL so role changes and
      // deactivations propagate without waiting for the token to expire.
      const syncedAt = token.roleSyncedAt ?? 0
      if (token.id && Date.now() - syncedAt > ROLE_SYNC_TTL_MS) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            status: true,
            role: { select: { id: true, name: true, slug: true, permissions: true } },
          },
        })
        token.role =
          !fresh || fresh.status !== "ACTIVE"
            ? REVOKED_ROLE
            : {
                id: fresh.role.id,
                name: fresh.role.name,
                slug: fresh.role.slug,
                permissions: fresh.role.permissions as Permissions,
              }
        token.roleSyncedAt = Date.now()
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
}
