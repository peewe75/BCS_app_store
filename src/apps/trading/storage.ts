import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'

const BUCKET = 'trading-files'

function getClient() {
  const client = createSupabaseAdminClient()
  if (!client) {
    throw new Error('Supabase admin client non disponibile. Verifica le variabili SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  }
  return client
}

export async function saveBlob(key: string, data: Uint8Array | ArrayBuffer): Promise<void> {
  const client = getClient()
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data
  const { error } = await client.storage
    .from(BUCKET)
    .upload(key, bytes, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) {
    throw new Error(`Errore salvataggio blob ${key}: ${error.message}`)
  }
}

export async function saveTextBlob(
  key: string,
  content: string,
  contentType = 'text/plain; charset=utf-8'
): Promise<void> {
  const client = getClient()
  const { error } = await client.storage
    .from(BUCKET)
    .upload(key, content, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Errore salvataggio text blob ${key}: ${error.message}`)
  }
}

export async function getBlob(key: string): Promise<ArrayBuffer | null> {
  try {
    const client = getClient()
    const { data, error } = await client.storage
      .from(BUCKET)
      .download(key)

    if (error || !data) return null
    return await data.arrayBuffer()
  } catch {
    return null
  }
}

export async function getTextBlob(key: string): Promise<string | null> {
  try {
    const client = getClient()
    const { data, error } = await client.storage
      .from(BUCKET)
      .download(key)

    if (error || !data) return null
    return await data.text()
  } catch {
    return null
  }
}

export async function deleteBlob(key: string): Promise<void> {
  const client = getClient()
  await client.storage
    .from(BUCKET)
    .remove([key])
}

export function buildBlobKey(userId: string, reportId: string): string {
  return `reports/${userId}/${reportId}.pdf`
}

export function buildUploadBlobKey(userId: string, reportId: string): string {
  return `sources/${userId}/${reportId}.html`
}

export function buildTaxFormDraftKey(userId: string, reportId: string): string {
  return `tax-forms/${userId}/${reportId}.json`
}

export function buildTaxFormPdfKey(userId: string, reportId: string): string {
  return `tax-forms/${userId}/${reportId}.pdf`
}

export function buildTaxFormControlPdfKey(userId: string, reportId: string): string {
  return `tax-forms/${userId}/${reportId}.control.pdf`
}

export function buildTaxFormFacsimilePdfKey(userId: string, reportId: string): string {
  return `tax-forms/${userId}/${reportId}.facsimile.pdf`
}
