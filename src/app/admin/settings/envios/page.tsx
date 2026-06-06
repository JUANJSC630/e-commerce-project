import { loadAllSettings } from "@/lib/settings"
import { ShippingEditor } from "@/components/admin/settings/shipping-editor"

export default async function ShippingSettingsPage() {
  const { shipping } = await loadAllSettings()
  return <ShippingEditor data={shipping} />
}
