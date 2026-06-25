import "server-only"

import { UTApi } from "uploadthing/server"

/**
 * Media library (read side) for UploadThing.
 *
 * Lists images already uploaded to the app's CDN so the admin can reuse them
 * without uploading again. `listFiles` returns keys but not URLs; since our
 * uploads are public, the public URL is deterministic - `https://<appId>.ufs.sh/
 * f/<key>` - and `appId` lives in the (base64-JSON) UPLOADTHING_TOKEN.
 */

const utapi = new UTApi()

export interface MediaItem {
  key: string
  url: string
  name: string
  size: number
  uploadedAt: number
}

let cachedAppId: string | null = null

/** Decodes the app id from the UploadThing token (cached for the process). */
function getAppId(): string | null {
  if (cachedAppId) return cachedAppId
  const token = process.env.UPLOADTHING_TOKEN
  if (!token) return null
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8")) as {
      appId?: string
    }
    cachedAppId = decoded.appId ?? null
    return cachedAppId
  } catch {
    return null
  }
}

/** Public CDN URL for an UploadThing key (matches `file.ufsUrl` on upload). */
export function uploadThingUrlFromKey(key: string): string | null {
  const appId = getAppId()
  return appId ? `https://${appId}.ufs.sh/f/${key}` : null
}

/**
 * Lists uploaded images (most recent first). Skips files pending deletion and
 * any whose URL can't be built (missing app id).
 */
export async function listUploadedImages(limit = 100): Promise<MediaItem[]> {
  const { files } = await utapi.listFiles({ limit })
  return files
    .filter((f) => f.status === "Uploaded")
    .map((f) => {
      const url = uploadThingUrlFromKey(f.key)
      return url ? { key: f.key, url, name: f.name, size: f.size, uploadedAt: f.uploadedAt } : null
    })
    .filter((item): item is MediaItem => item !== null)
    .sort((a, b) => b.uploadedAt - a.uploadedAt)
}
