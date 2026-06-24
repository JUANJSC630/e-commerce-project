export type Resource =
  | "dashboard"
  | "products"
  | "categories"
  | "discounts"
  | "orders"
  | "users"
  | "roles"
  | "settings"
export type Action = "read" | "create" | "update" | "delete"
export type Permissions = Partial<Record<Resource, Action[]>>

/** Slug of the storefront customer role — has no admin permissions. */
export const CUSTOMER_ROLE_SLUG = "customer"

/** A customer shops the store; everyone else is staff with admin access. */
export function isCustomer(roleSlug: string | undefined): boolean {
  return roleSlug === CUSTOMER_ROLE_SLUG
}

export function isStaff(roleSlug: string | undefined): boolean {
  return !!roleSlug && !isCustomer(roleSlug)
}

export const ALL_RESOURCES: Resource[] = [
  "dashboard",
  "products",
  "categories",
  "discounts",
  "orders",
  "users",
  "roles",
  "settings",
]
export const ALL_ACTIONS: Action[] = ["read", "create", "update", "delete"]

export function hasPermission(
  permissions: Permissions | null | undefined,
  resource: Resource,
  action: Action,
): boolean {
  if (!permissions) return false
  return permissions[resource]?.includes(action) ?? false
}

/** Resources whose editors upload images — any grants shared media access. */
const IMAGE_RESOURCES: Resource[] = ["products", "categories", "settings"]

/** True when these permissions may browse and manage the shared media library. */
export function canManageMedia(permissions: Permissions | null | undefined): boolean {
  return IMAGE_RESOURCES.some(
    (r) => hasPermission(permissions, r, "create") || hasPermission(permissions, r, "update"),
  )
}

export function getResourceLabel(resource: Resource): string {
  const labels: Record<Resource, string> = {
    dashboard: "Dashboard",
    products: "Productos",
    categories: "Categorías",
    discounts: "Descuentos",
    orders: "Pedidos",
    users: "Usuarios",
    roles: "Roles",
    settings: "Configuración",
  }
  return labels[resource]
}

export function getActionLabel(action: Action): string {
  const labels: Record<Action, string> = {
    read: "Ver",
    create: "Crear",
    update: "Editar",
    delete: "Eliminar",
  }
  return labels[action]
}
