import { loadAllSettings } from "@/lib/settings"
import { ThemeEditor } from "@/components/admin/settings/theme-editor"

export default async function ThemeSettingsPage() {
  const { theme } = await loadAllSettings()
  return <ThemeEditor data={theme} />
}
