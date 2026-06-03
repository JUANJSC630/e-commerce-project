"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Role } from "@prisma/client"

type UserWithRole = {
  id: string
  email: string
  name: string | null
  status: string
  createdAt: Date
  role: { id: string; name: string; slug: string }
}

interface UsersTableProps {
  users: UserWithRole[]
  roles: Role[]
  canEdit: boolean
  currentUserId: string
}

export function UsersTable({ users, roles, canEdit, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    startTransition(() => router.refresh())
  }

  async function changeRole(id: string, roleId: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${isPending ? "opacity-70" : ""}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Rol</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">
                  No hay usuarios
                </td>
              </tr>
            ) : (
              users.map((user, i) => {
                const isSelf = user.id === currentUserId
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50 transition-colors ${i !== users.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold shrink-0">
                          {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.name ?? "Sin nombre"}
                            {isSelf && (
                              <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {canEdit && !isSelf ? (
                        <RoleSelect
                          currentRoleId={user.role.id}
                          roles={roles}
                          onChange={(roleId) => changeRole(user.id, roleId)}
                        />
                      ) : (
                        <span className="text-slate-700">{user.role.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canEdit && !isSelf ? (
                        <button
                          onClick={() => toggleStatus(user.id, user.status)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </button>
                      ) : (
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RoleSelect({
  currentRoleId,
  roles,
  onChange,
}: {
  currentRoleId: string
  roles: Role[]
  onChange: (roleId: string) => void
}) {
  const [value, setValue] = useState(currentRoleId)

  return (
    <select
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        onChange(e.target.value)
      }}
      className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
    >
      {roles.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  )
}
