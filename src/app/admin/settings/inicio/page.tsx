import { loadAllSettings } from "@/lib/settings"
import { HomeContentEditor } from "@/components/admin/settings/home-content-editor"

export default async function HomeContentSettingsPage() {
  const { homeContent } = await loadAllSettings()
  return <HomeContentEditor data={homeContent} />
}
