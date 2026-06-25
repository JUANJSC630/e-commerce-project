import "server-only"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { CUSTOMER_ROLE_SLUG } from "@/lib/permissions"

/** Domain error with an HTTP status for the account API routes to map. */
export class AccountError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = "AccountError"
  }
}

export const PASSWORD_MIN_LENGTH = 8
/** bcrypt silently truncates input past 72 bytes - reject longer to avoid surprises. */
export const PASSWORD_MAX_BYTES = 72
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates a password length (chars min + bcrypt byte cap); throws AccountError. */
export function assertValidPassword(password: string): void {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AccountError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    throw new AccountError(`La contraseña no puede superar ${PASSWORD_MAX_BYTES} bytes`)
  }
}

let customerRoleId: string | undefined

/** Finds or creates the customer role (no admin permissions); caches its id. */
export async function ensureCustomerRole(): Promise<string> {
  if (customerRoleId) return customerRoleId
  const role = await prisma.role.upsert({
    where: { slug: CUSTOMER_ROLE_SLUG },
    update: {},
    create: {
      name: "Cliente",
      slug: CUSTOMER_ROLE_SLUG,
      description: "Cliente de la tienda. Sin acceso al panel.",
      isSystem: true,
      permissions: {},
    },
    select: { id: true },
  })
  customerRoleId = role.id
  return role.id
}

/**
 * Links guest orders placed with this email to a now-known account. Idempotent:
 * the `userId: null` guard means already-claimed orders are never reassigned, so
 * it's safe to run on every login. Returns how many orders were claimed.
 */
export async function claimGuestOrders(email: string, userId: string): Promise<number> {
  const { count } = await prisma.order.updateMany({
    where: { userId: null, customerEmail: email.trim().toLowerCase() },
    data: { userId },
  })
  return count
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export async function registerCustomer(input: RegisterInput): Promise<{ id: string }> {
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  const password = input.password ?? ""

  if (!name) throw new AccountError("El nombre es requerido")
  if (!email || !EMAIL_RE.test(email)) throw new AccountError("Email inválido")
  assertValidPassword(password)

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) throw new AccountError("Ya existe una cuenta con este email", 409)

  const roleId = await ensureCustomerRole()
  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12), roleId, status: "ACTIVE" },
    select: { id: true },
  })

  // Claim any guest orders placed with this email so they show in the account.
  await claimGuestOrders(email, user.id)

  return user
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  assertValidPassword(newPassword)

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
  if (!user) throw new AccountError("Usuario no encontrado", 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new AccountError("La contraseña actual es incorrecta")

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(newPassword, 12) },
  })
}
