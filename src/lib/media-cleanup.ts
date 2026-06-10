import "server-only"

import { UTApi } from "uploadthing/server"

/**
 * Orphan-media cleanup for UploadThing.
 *
 * When an admin replaces or deletes an entity image, the old file would
 * otherwise linger in the CDN forever. These helpers delete the underlying
 * UploadThing object — best-effort: a cleanup failure must never break the
 * primary mutation (the DB write already succeeded), so errors are logged and
 * swallowed.
 *
 * Only UploadThing-hosted URLs are touched. Local assets (`/placeholder.svg`,
 * `/logo.png`, demo images in /public) and any third-party URL are ignored.
 */

const utapi = new UTApi()

/** Hosts UploadThing serves files from (`ufsUrl` = `*.ufs.sh`, legacy = utfs.io). */
const UPLOADTHING_HOST = /(^|\.)(ufs\.sh|utfs\.io)$/

/**
 * Extracts the UploadThing file key from a CDN URL, or `null` if the URL is not
 * an UploadThing object. Key is the path segment after `/f/`.
 */
export function uploadThingKeyFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (!UPLOADTHING_HOST.test(parsed.hostname)) return null
  const match = parsed.pathname.match(/\/f\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Recursively walks any JSON-like value and collects every string that is an
 * UploadThing URL. Used to diff a settings blob (with images nested in arrays,
 * e.g. hero banners / featured categories / brand logo) before and after a save.
 */
export function collectUploadThingUrls(value: unknown): string[] {
  const found: string[] = []
  const visit = (node: unknown) => {
    if (typeof node === "string") {
      if (uploadThingKeyFromUrl(node)) found.push(node)
    } else if (Array.isArray(node)) {
      node.forEach(visit)
    } else if (node && typeof node === "object") {
      Object.values(node).forEach(visit)
    }
  }
  visit(value)
  return found
}

/**
 * Deletes the given image URLs from UploadThing. Non-UploadThing URLs are
 * skipped. Best-effort: never throws.
 */
export async function deleteUploadedImages(urls: Array<string | null | undefined>): Promise<void> {
  const keys = Array.from(
    new Set(urls.map(uploadThingKeyFromUrl).filter((k): k is string => Boolean(k))),
  )
  if (keys.length === 0) return
  try {
    await utapi.deleteFiles(keys)
  } catch (err) {
    console.error("[media-cleanup] Failed to delete UploadThing files", keys, err)
  }
}

/**
 * Deletes `oldUrl` only when it changed and was an UploadThing object — the
 * common "image replaced" path. No-op when the image is unchanged.
 */
export async function deleteReplacedImage(
  oldUrl: string | null | undefined,
  newUrl: string | null | undefined,
): Promise<void> {
  if (!oldUrl || oldUrl === newUrl) return
  await deleteUploadedImages([oldUrl])
}
