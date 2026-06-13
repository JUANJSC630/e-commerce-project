import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { claimGuestOrders } from "@/lib/account"
import { isRateLimited, recordRateLimitHit } from "@/lib/rate-limit"
import type { Permissions } from "@/lib/permissions"

const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 10 * 60 * 1000

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
