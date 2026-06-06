import { loadAllSettings } from "@/lib/settings"
import { LocaleEditor } from "@/components/admin/settings/locale-editor"

export default async function LocaleSettingsPage() {
  const { locale } = await loadAllSettings()
  return <LocaleEditor data={locale} />
}
