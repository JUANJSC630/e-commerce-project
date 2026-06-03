"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Role } from "@prisma/client"
import { ALL_RESOURCES, ALL_ACTIONS, getResourceLabel, getActionLabel } from "@/lib/permissions"
import type { Permissions, Resource, Action } from "@/lib/permissions"
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react"

interface RolesEditorProps {
  roles: Role[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function RolesEditor({ roles, canCreate, canEdit, canDelete }: RolesEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(roles[0]?.id ?? null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newRole, setNewRole] = useState({ name: "", slug: "", description: "" })
  const [error, setError] = useState<string | null>(null)

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  async function handlePermissionToggle(
    roleId: string,
    resource: Resource,
    action: Action,
    currentPerms: Permissions,
  ) {
    const currentActions = currentPerms[resource] ?? []
    const newActions = currentActions.includes(action)
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action]

    const newPermissions: Permissions = { ...currentPerms, [resource]: newActions }

    await fetch(`/api/admin/roles/${roleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: newPermissions }),
    })
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el rol "${name}"? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? "Error al eliminar")
      return
    }
    startTransition(() => router.refresh())
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newRole.name.trim(),
        slug: newRole.slug.trim() || newRole.name.trim().toLowerCase().replace(/\s+/g, "_"),
        description: newRole.description.trim() || null,
        permissions: {},
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Error al crear el rol")
      return
    }
    setShowNewForm(false)
    setNewRole({ name: "", slug: "", description: "" })
    startTransition(() => router.refresh())
  }

  return (
    <div className={`space-y-3 ${isPending ? "opacity-70 pointer-events-none" : ""}`}>
      {/* New role form */}
      {canCreate && (
        <div>
          {!showNewForm ? (
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Nuevo rol
            </button>
          ) : (
            <form
              onSubmit={handleCreate}
              className="bg-white rounded-xl border border-indigo-200 p-5 space-y-4"
            >
              <h3 className="font-semibold text-slate-900">Nuevo rol</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole((r) => ({ ...r, name: e.target.value }))}
                    className={inputClass}
                    placeholder="Ej: Editor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={newRole.slug}
                    onChange={(e) => setNewRole((r) => ({ ...r, slug: e.target.value }))}
                    className={inputClass}
                    placeholder="Auto-generado del nombre"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole((r) => ({ ...r, description: e.target.value }))}
                  className={inputClass}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Roles list */}
      {roles.map((role) => {
        const perms = role.permissions as Permissions
        const isExpanded = expandedId === role.id

        return (
          <div
            key={role.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleExpand(role.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggleExpand(role.id)
                }
              }}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{role.name}</span>
                    {role.isSystem && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        Sistema
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{role.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canDelete && !role.isSystem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(role.id, role.name)
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Permission grid */}
            {isExpanded && (
              <div className="border-t border-slate-100 p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2 font-medium text-slate-500 w-32">Recurso</th>
                        {ALL_ACTIONS.map((action) => (
                          <th
                            key={action}
                            className="text-center py-2 font-medium text-slate-500 w-20"
                          >
                            {getActionLabel(action)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_RESOURCES.map((resource) => {
                        const currentActions = perms[resource] ?? []
                        return (
                          <tr key={resource} className="border-t border-slate-50">
                            <td className="py-2.5 pr-4 font-medium text-slate-700">
                              {getResourceLabel(resource)}
                            </td>
                            {ALL_ACTIONS.map((action) => {
                              const checked = currentActions.includes(action)
                              return (
                                <td key={action} className="py-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!canEdit}
                                    onChange={() =>
                                      handlePermissionToggle(role.id, resource, action, perms)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
