import { loadAllSettings } from "@/lib/settings"
import { getPaymentsHealth } from "@/lib/payments/health"
import { PaymentMethodsEditor } from "@/components/admin/settings/payment-methods-editor"
import { PaymentsHealthPanel } from "@/components/admin/settings/payments-health"

// Live provider check → render on demand (never statically cached).
export const dynamic = "force-dynamic"

export default async function PaymentSettingsPage() {
  const [{ paymentMethods }, health] = await Promise.all([loadAllSettings(), getPaymentsHealth()])
  return (
    <div className="space-y-6">
      <PaymentsHealthPanel health={health} />
      <PaymentMethodsEditor data={paymentMethods} />
    </div>
  )
}
