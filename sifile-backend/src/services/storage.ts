import { v4 as uuidv4 } from 'uuid'
import { adminStorage } from './firebase-admin'

const TEMP_STORAGE_PREFIX = 'temp'
const RESULTS_STORAGE_PREFIX = 'results'
const TTL_HOURS = parseInt(process.env.TEMP_STORAGE_TTL_HOURS || '24')

/**
 * Build a Firebase Storage download URL using a download token.
 * This avoids getSignedUrl() which requires a service account private key
 * (not available when Cloud Run uses Application Default Credentials).
 */
function buildFirebaseStorageUrl(bucketName: string, storagePath: string, token: string): string {
  const encodedPath = encodeURIComponent(storagePath)
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
}

/**
 * Upload a buffer to Firebase Storage (temp area).
 * Returns the storage path and a download URL.
 */
export async function uploadTempFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  sessionId: string
): Promise<{ fileId: string; storagePath: string; previewUrl: string }> {
  const fileId = uuidv4()
  const downloadToken = uuidv4()
  const ext = originalName.split('.').pop() || 'bin'
  const storagePath = `${TEMP_STORAGE_PREFIX}/${sessionId}/${fileId}.${ext}`

  const bucket = adminStorage.bucket()
  const file = bucket.file(storagePath)

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000).toISOString(),
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })

  const previewUrl = buildFirebaseStorageUrl(bucket.name, storagePath, downloadToken)

  return { fileId, storagePath, previewUrl }
}

/**
 * Download a file from Firebase Storage into a Buffer.
 */
export async function downloadFile(storagePath: string): Promise<Buffer> {
  const bucket = adminStorage.bucket()
  const file = bucket.file(storagePath)
  const [buffer] = await file.download()
  return buffer
}

/**
 * Upload processing result to Firebase Storage.
 * Returns a download URL using a Firebase Storage token.
 */
export async function uploadResult(
  buffer: Buffer,
  mimeType: string,
  jobId: string,
  outputFilename: string
): Promise<{ storagePath: string; signedUrl: string }> {
  const storagePath = `${RESULTS_STORAGE_PREFIX}/${jobId}/${outputFilename}`
  const downloadToken = uuidv4()

  const bucket = adminStorage.bucket()
  const file = bucket.file(storagePath)

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        jobId,
        createdAt: new Date().toISOString(),
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })

  const signedUrl = buildFirebaseStorageUrl(bucket.name, storagePath, downloadToken)

  return { storagePath, signedUrl }
}

/**
 * Delete a file from Firebase Storage before TTL.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const bucket = adminStorage.bucket()
  await bucket.file(storagePath).delete({ ignoreNotFound: true })
}
