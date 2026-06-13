"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/account/auth-shell"

export function LoginForm() {
  const router = useRouter()
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/cuenta"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      // Thrown errors (e.g. rate limit) carry a message; a plain bad credential
      // surfaces as the generic "CredentialsSignin" code.
      setError(
        result.error === "CredentialsSignin" ? "Email o contraseña incorrectos" : result.error,
      )
      setLoading(false)
      return
    }
    window.dispatchEvent(new Event("auth-changed")) // sync favorites to the account
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Accede a tu cuenta y tus pedidos"
      footer={{ prompt: "¿No tienes cuenta?", linkLabel: "Regístrate", href: "/cuenta/registro" }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando…" : "Iniciar sesión"}
        </Button>
      </form>
    </AuthShell>
  )
}
