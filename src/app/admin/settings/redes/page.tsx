import { loadAllSettings } from "@/lib/settings"
import { SocialEditor } from "@/components/admin/settings/social-editor"

export default async function SocialSettingsPage() {
  const { social } = await loadAllSettings()
  return <SocialEditor data={social} />
}
