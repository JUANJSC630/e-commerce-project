"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/account/auth-shell"

const PASSWORD_MIN = 8

export function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password.length < PASSWORD_MIN) {
      setError(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`)
      return
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    const res = await fetch("/api/cuenta/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "No se pudo crear la cuenta")
      setLoading(false)
      return
    }

    // Account created — sign the customer in and send them to their panel.
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push("/cuenta")
    router.refresh()
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Guarda tus datos y sigue tus pedidos"
      footer={{ prompt: "¿Ya tienes cuenta?", linkLabel: "Inicia sesión", href: "/cuenta/login" }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" autoComplete="name" required value={form.name} onChange={set("name")} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={set("password")}
          />
        </div>
        <div>
          <Label htmlFor="confirm">Confirmar contraseña</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={set("confirm")}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthShell>
  )
}
