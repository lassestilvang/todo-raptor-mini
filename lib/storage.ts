import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export type UploadResult = { id: string; filename: string; size: number; mime: string; storageKey: string }

export class LocalStorageAdapter {
  root: string
  constructor(root = path.join(process.cwd(), 'storage', 'attachments')) {
    this.root = root
    if (!fs.existsSync(this.root)) fs.mkdirSync(this.root, { recursive: true })
  }

  async upload(file: File): Promise<UploadResult> {
    const id = uuidv4()
    const name = (file as any).name || `file-${Date.now()}`
    const filename = `${id}-${name}`
    const out = path.join(this.root, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(out, buffer)
    return { id, filename: name, size: buffer.length, mime: (file as any).type, storageKey: filename }
  }
}

// S3 adapter stub (config via env vars). Implemented as stub to keep build small; install @aws-sdk/client-s3 to enable.
export class S3Adapter {
  constructor(opts: any) {
    // placeholder
  }

  async upload(file: any) {
    throw new Error('S3Adapter not implemented. Install @aws-sdk/client-s3 and implement upload.')
  }
}

export function getStorageAdapter() {
  const provider = process.env.STORAGE_PROVIDER || 'local'
  if (provider === 's3') return new S3Adapter({})
  return new LocalStorageAdapter()
}
