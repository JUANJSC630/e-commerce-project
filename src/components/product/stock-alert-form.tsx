"use client"

import { useState } from "react"
import { Bell } from "lucide-react"

interface StockAlertFormProps {
  productId: string
}

export function StockAlertForm({ productId }: StockAlertFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")

    const res = await fetch("/api/stock-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, productId }),
    })

    if (res.ok) {
      setStatus("success")
      setMessage("¡Listo! Te avisaremos cuando vuelva a estar disponible.")
    } else {
      const data = await res.json().catch(() => ({}))
      setStatus("error")
      setMessage(data.error ?? "Ocurrió un error, intenta de nuevo.")
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        <Bell className="h-4 w-4 shrink-0" />
        {message}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm text-brand-muted flex items-center gap-1.5">
        <Bell className="h-4 w-4" />
        Producto agotado - recibe un aviso cuando vuelva
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="flex-1 px-3 py-2 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-brand-base"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 rounded-lg bg-brand-base text-brand-on-base text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {status === "loading" ? "…" : "Avisarme"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-500">{message}</p>}
    </form>
  )
}
