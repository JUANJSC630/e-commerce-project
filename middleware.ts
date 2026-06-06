import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isCustomer } from "@/lib/permissions"

const PUBLIC_ACCOUNT_PATHS = ["/cuenta/login", "/cuenta/registro"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const role = token?.role as { slug?: string } | undefined

  // ── Admin (staff only) ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // Logged-in staff skip the login page; a customer goes to their account.
      if (token) {
        const to = isCustomer(role?.slug) ? "/cuenta" : "/admin"
        return NextResponse.redirect(new URL(to, request.url))
      }
      return NextResponse.next()
    }
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    // A customer has no business in the admin.
    if (isCustomer(role?.slug)) return NextResponse.redirect(new URL("/cuenta", request.url))
    return NextResponse.next()
  }

  // ── Customer account ──────────────────────────────────────────────────────
  if (pathname.startsWith("/cuenta")) {
    if (PUBLIC_ACCOUNT_PATHS.includes(pathname)) {
      if (token) return NextResponse.redirect(new URL("/cuenta", request.url))
      return NextResponse.next()
    }
    if (!token) {
      const loginUrl = new URL("/cuenta/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Include the bare paths — "/admin/:path*" alone doesn't match "/admin".
  matcher: ["/admin", "/admin/:path*", "/cuenta", "/cuenta/:path*"],
}
