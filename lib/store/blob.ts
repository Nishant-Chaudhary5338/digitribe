/**
 * Artifact file storage (zips / bundles) on Vercel Blob. Canonical: contracts §8.
 * Small JSON artifacts stay in KV; large file bundles go here.
 */
import { put } from '@vercel/blob'
import { storeEnv } from './env'

/** Store a file/zip and return its public URL. */
export async function storeArtifactFile(opts: {
  pathname: string // e.g. `artifacts/<runId>/bundle.zip`
  data: Buffer | string
  contentType: string
}): Promise<string> {
  const blob = await put(opts.pathname, opts.data, {
    access: 'public',
    contentType: opts.contentType,
    token: storeEnv().BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  })
  return blob.url
}
