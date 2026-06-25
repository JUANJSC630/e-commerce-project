import { CheckCircle2, XCircle, AlertTriangle, CreditCard } from "lucide-react"
import type { PaymentsHealth } from "@/lib/payments/health"

/** Read-only status panel: which payment provider is active and, for MercadoPago,
 * whether it's connected and in which mode (test vs production). */
export function PaymentsHealthPanel({ health }: { health: PaymentsHealth }) {
  const mp = health.mercadopago

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        <h2 className="font-semibold text-slate-900">Estado de pagos</h2>
      </div>

      {health.provider !== "mercadopago" ? (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Pagos simulados (mock)</p>
            <p className="text-amber-700 mt-0.5">
              El proveedor activo es <code className="font-mono">{health.provider}</code>: los pagos
              no son reales. Define <code className="font-mono">PAYMENT_PROVIDER=mercadopago</code>{" "}
              y sus llaves para cobrar.
            </p>
          </div>
        </div>
      ) : (
        mp && (
          <div className="space-y-4">
            {/* Connection + mode badges */}
            <div className="flex flex-wrap items-center gap-2">
              {mp.connected ? (
                <Badge tone="green" icon={CheckCircle2}>
                  Conectado a MercadoPago
                </Badge>
              ) : (
                <Badge tone="red" icon={XCircle}>
                  No conectado
                </Badge>
              )}
              <Badge tone={mp.mode === "production" ? "green" : "amber"}>
                {mp.mode === "production"
                  ? "Modo producción"
                  : mp.mode === "test"
                    ? "Modo prueba (TEST)"
                    : "Modo desconocido"}
              </Badge>
              {mp.account?.nickname && (
                <span className="text-sm text-slate-500">
                  Cuenta: <span className="font-medium text-slate-700">{mp.account.nickname}</span>
                  {mp.account.siteId ? ` · ${mp.account.siteId}` : ""}
                </span>
              )}
            </div>

            {mp.error && <p className="text-sm text-red-600">{mp.error}</p>}

            {/* Credential checklist */}
            <ul className="grid sm:grid-cols-3 gap-2 text-sm">
              <Check ok={mp.tokenPresent} label="Access token" />
              <Check ok={mp.publicKeyPresent} label="Public key" />
              <Check ok={mp.webhookSecretPresent} label="Webhook secret" />
            </ul>

            {/* Mode hint */}
            {mp.connected && mp.mode === "test" && (
              <p className="text-xs text-slate-500">
                En modo prueba solo se procesan pagos de test (no se cobra dinero real). Para
                producción usa credenciales <code className="font-mono">APP_USR-…</code> y configura
                la URL del webhook en el panel de MercadoPago.
              </p>
            )}
          </div>
        )
      )}
    </div>
  )
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
      )}
      <span className={ok ? "text-slate-700" : "text-red-600"}>{label}</span>
    </li>
  )
}

function Badge({
  tone,
  icon: Icon,
  children,
}: {
  tone: "green" | "red" | "amber"
  icon?: React.ElementType
  children: React.ReactNode
}) {
  const tones = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  )
}
