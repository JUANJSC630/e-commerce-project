import "server-only"

import { unstable_cache } from "next/cache"
import { UTApi } from "uploadthing/server"
import { prisma } from "@/lib/prisma"
import { uploadThingKeyFromUrl, collectUploadThingUrls } from "@/lib/media-cleanup"
import { uploadThingUrlFromKey } from "@/lib/media-library"

/**
 * Media manager (scan side) for UploadThing.
 *
 * Cross-references every file in the CDN against the image fields that reference
 * it across the database (products, categories, users and the recursive settings
 * blob). A file no entity points at is an orphan — safe to delete to reclaim CDN
 * space. The scan is cached briefly so opening the page is cheap; a forced
 * refresh revalidates the `media-scan` tag.
 */

export const MEDIA_SCAN_TAG = "media-scan"

export interface FileReference {
  entity: string
  entityId: string
  entityName: string
  field: string
}

export interface ScannedFile {
  key: string
  url: string
  name: string
  size: number
  uploadedAt: number
  usedBy: FileReference[]
  isOrphan: boolean
}

export interface ScanResult {
  files: ScannedFile[]
  totalFiles: number
  totalSize: number
  orphanCount: number
  orphanSize: number
  scannedAt: number
}

const utapi = new UTApi()
const PAGE_SIZE = 500

type UtFile = Awaited<ReturnType<typeof utapi.listFiles>>["files"][number]

/** Lists every uploaded file, paging through UploadThing until exhausted. */
async function listAllFiles(): Promise<UtFile[]> {
  const all: UtFile[] = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { files, hasMore } = await utapi.listFiles({ limit: PAGE_SIZE, offset })
    all.push(...files)
    if (!hasMore || files.length === 0) break
  }
  return all
}

/** Builds a key → references map from every DB image field. */
async function collectReferences(): Promise<Map<string, FileReference[]>> {
  const [products, categories, users, settings] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, image: true } }),
    prisma.category.findMany({ select: { id: true, name: true, image: true } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, image: true } }),
    prisma.setting.findMany({ select: { key: true, value: true } }),
  ])

  const refs = new Map<string, FileReference[]>()
  const add = (url: string | null | undefined, ref: FileReference) => {
    const key = uploadThingKeyFromUrl(url)
    if (!key) return
    const list = refs.get(key)
    if (list) list.push(ref)
    else refs.set(key, [ref])
  }

  for (const p of products) {
    add(p.image, { entity: "Producto", entityId: p.id, entityName: p.name, field: "image" })
  }
  for (const c of categories) {
    add(c.image, { entity: "Categoría", entityId: c.id, entityName: c.name, field: "image" })
  }
  for (const u of users) {
    add(u.image, {
      entity: "Usuario",
      entityId: u.id,
      entityName: u.name ?? u.email,
      field: "image",
    })
  }
  for (const s of settings) {
    for (const url of collectUploadThingUrls(s.value)) {
      add(url, { entity: "Configuración", entityId: s.key, entityName: s.key, field: "value" })
    }
  }
  return refs
}

async function runScan(): Promise<ScanResult> {
  const [files, refs] = await Promise.all([listAllFiles(), collectReferences()])

  const scanned: ScannedFile[] = files
    .filter((f) => f.status === "Uploaded")
    .map((f) => {
      const url = uploadThingUrlFromKey(f.key)
      if (!url) return null
      const usedBy = refs.get(f.key) ?? []
      return {
        key: f.key,
        url,
        name: f.name,
        size: f.size,
        uploadedAt: f.uploadedAt,
        usedBy,
        isOrphan: usedBy.length === 0,
      }
    })
    .filter((f): f is ScannedFile => f !== null)
    .sort((a, b) => b.uploadedAt - a.uploadedAt)

  const orphans = scanned.filter((f) => f.isOrphan)
  return {
    files: scanned,
    totalFiles: scanned.length,
    totalSize: scanned.reduce((sum, f) => sum + f.size, 0),
    orphanCount: orphans.length,
    orphanSize: orphans.reduce((sum, f) => sum + f.size, 0),
    scannedAt: Date.now(),
  }
}

/** Cached scan (5 min) — fast page loads; revalidate `MEDIA_SCAN_TAG` to refresh. */
export const scanMediaUsage = unstable_cache(runScan, ["media-scan"], {
  tags: [MEDIA_SCAN_TAG],
  revalidate: 300,
})

/** Keys that are still referenced in the DB right now (last-moment delete guard). */
export async function keysInUse(keys: string[]): Promise<Set<string>> {
  const refs = await collectReferences()
  return new Set(keys.filter((k) => refs.has(k)))
}

/** Deletes UploadThing files in batches (the API caps a request at 25 keys). */
export async function deleteMediaFiles(keys: string[]): Promise<void> {
  for (let i = 0; i < keys.length; i += 25) {
    await utapi.deleteFiles(keys.slice(i, i + 25))
  }
}
