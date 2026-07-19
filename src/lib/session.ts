import "server-only"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

/**
 * The id of the logged-in user, or null when there is no usable identity.
 *
 * Returns null in two cases: no session at all, or a session whose id is the
 * empty-string sentinel the jwt callback writes when the user the token
 * referenced no longer exists (see src/lib/auth-options.ts). Any route that
 * writes rows keyed by userId MUST resolve the id through this helper instead
 * of reading `session.user.id` directly - a stale/orphaned token otherwise
 * reaches the insert and fails with a Prisma foreign-key violation (P2003)
 * returned to the client as a 500, rather than a clean 401.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  const id = session?.user.id
  return id ? id : null
}
