import { v4 as uuidv4 } from 'uuid'
import { adminFirestore } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export type JobStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Job {
  id: string
  userId: string
  operation: string
  status: JobStatus
  fileId: string
  storagePath: string
  files?: Array<{ fileId: string; storagePath: string }>
  params: Record<string, unknown>
  suggestedParams: Record<string, unknown>
  progress: number
  resultUrl?: string
  resultStoragePath?: string
  inputSizeBytes?: number
  outputSizeBytes?: number
  resultText?: string
  errorMessage?: string
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
}

/**
 * Create a new job document in Firestore.
 */
export async function createJob(data: {
  userId: string
  operation: string
  fileId: string
  storagePath: string
  files?: Array<{ fileId: string; storagePath: string }>
  params: Record<string, unknown>
  suggestedParams: Record<string, unknown>
  inputSizeBytes: number
}): Promise<Job> {
  const jobId = uuidv4()
  const now = FieldValue.serverTimestamp()

  const job: Omit<Job, 'createdAt' | 'updatedAt'> & {
    createdAt: FirebaseFirestore.FieldValue
    updatedAt: FirebaseFirestore.FieldValue
  } = {
    id: jobId,
    userId: data.userId,
    operation: data.operation,
    status: 'pending',
    fileId: data.fileId,
    storagePath: data.storagePath,
    files: data.files,
    params: data.params,
    suggestedParams: data.suggestedParams,
    progress: 0,
    inputSizeBytes: data.inputSizeBytes,
    createdAt: now,
    updatedAt: now,
  }

  await adminFirestore.collection('jobs').doc(jobId).set(job)
  return { ...job, id: jobId } as unknown as Job
}

/**
 * Update job status and progress.
 */
export async function updateJob(
  jobId: string,
  updates: Partial<Omit<Job, 'id' | 'createdAt'>>
): Promise<void> {
  await adminFirestore
    .collection('jobs')
    .doc(jobId)
    .update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    })
}

/**
 * Get a job by ID.
 */
export async function getJob(jobId: string): Promise<Job | null> {
  const doc = await adminFirestore.collection('jobs').doc(jobId).get()
  if (!doc.exists) return null
  return doc.data() as Job
}

/**
 * Track a usage event in Firestore.
 */
export async function trackUsageEvent(
  userId: string,
  event: 'file_upload' | 'operation_start' | 'operation_complete' | 'operation_error' | 'download',
  data: Record<string, unknown>
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM

  const eventRef = adminFirestore
    .collection('users')
    .doc(userId)
    .collection('usage')
    .doc(month)

  const increment = FieldValue.increment(1)

  try {
    await eventRef.set(
      {
        [`events.${event}`]: increment,
        operations_count: event === 'operation_start' ? increment : FieldValue.increment(0),
        last_active: FieldValue.serverTimestamp(),
        [`operations_by_type.${data.operation}`]:
          event === 'operation_start' ? increment : FieldValue.increment(0),
      },
      { merge: true }
    )
  } catch (err) {
    // Non-critical — don't fail the request if tracking fails
    console.error('Usage tracking failed:', err)
  }
}
