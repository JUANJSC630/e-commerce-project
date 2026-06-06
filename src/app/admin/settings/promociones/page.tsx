import { loadAllSettings } from "@/lib/settings"
import { PromoBannerEditor } from "@/components/admin/settings/promo-banner-editor"

export default async function PromoSettingsPage() {
  const { promoBanner } = await loadAllSettings()
  return <PromoBannerEditor data={promoBanner} />
}
