import { loadAllSettings } from "@/lib/settings"
import { BrandEditor } from "@/components/admin/settings/brand-editor"

export default async function BrandSettingsPage() {
  const { brand } = await loadAllSettings()
  return <BrandEditor data={brand} />
}
