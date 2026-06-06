import { loadAllSettings } from "@/lib/settings"
import { PaymentMethodsEditor } from "@/components/admin/settings/payment-methods-editor"

export default async function PaymentSettingsPage() {
  const { paymentMethods } = await loadAllSettings()
  return <PaymentMethodsEditor data={paymentMethods} />
}
