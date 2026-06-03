export type Resource = "dashboard" | "products" | "orders" | "users" | "roles" | "settings"
export type Action = "read" | "create" | "update" | "delete"
export type Permissions = Partial<Record<Resource, Action[]>>

export const ALL_RESOURCES: Resource[] = [
  "dashboard",
  "products",
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

export function getResourceLabel(resource: Resource): string {
  const labels: Record<Resource, string> = {
    dashboard: "Dashboard",
    products: "Productos",
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
