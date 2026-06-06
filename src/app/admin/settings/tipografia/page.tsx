import { loadAllSettings } from "@/lib/settings"
import { TypographyEditor } from "@/components/admin/settings/typography-editor"

export default async function TypographySettingsPage() {
  const { typography } = await loadAllSettings()
  return <TypographyEditor data={typography} />
}
