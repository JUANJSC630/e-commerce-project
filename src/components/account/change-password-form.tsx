"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PASSWORD_MIN = 8

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < PASSWORD_MIN) {
      toast.error(`La nueva contraseña debe tener al menos ${PASSWORD_MIN} caracteres`)
      return
    }
    if (next !== confirm) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    const res = await fetch("/api/cuenta/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo cambiar la contraseña")
      return
    }

    toast.success("Contraseña actualizada")
    setCurrent("")
    setNext("")
    setConfirm("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <Label htmlFor="current">Contraseña actual</Label>
        <Input
          id="current"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="new">Nueva contraseña</Label>
        <Input
          id="new"
          type="password"
          autoComplete="new-password"
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  )
}
