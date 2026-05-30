import { getIdToken } from './firebase'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: Record<string, unknown> | FormData
  requireAuth?: boolean
}

/**
 * Base API client that automatically attaches Firebase ID Token to requests.
 */
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requireAuth = false } = options

  const headers: Record<string, string> = {}

  // Attach auth token if available
  const token = await getIdToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else if (requireAuth) {
    throw new Error('Authentication required')
  }

  const isFormData = body instanceof FormData

  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(endpoint, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

// ─── Upload ──────────────────────────────────────

export type UploadResponse = {
  fileId: string
  storagePath: string
  previewUrl: string
  fileName: string
  mimeType: string
  sizeBytes: number
  suggestions: {
    params: Record<string, unknown>
    rationale: string
  }
}

export async function uploadFile(file: File, operation: string): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('operation', operation)

  return apiRequest<UploadResponse>('/api/upload', { method: 'POST', body: formData })
}

// ─── Process ─────────────────────────────────────

export type ProcessResponse = {
  jobId: string
  suggestedParams: Record<string, unknown>
  rationale: string
}

export async function startProcess(data: {
  fileId: string
  storagePath: string
  files?: Array<{fileId: string, storagePath: string}>
  operation: string
  params?: Record<string, unknown>
  mimeType?: string
  inputSizeBytes?: number
}): Promise<ProcessResponse> {
  return apiRequest<ProcessResponse>('/api/process', { method: 'POST', body: data })
}

// ─── Jobs ────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'done' | 'error'

export type Job = {
  id: string
  status: JobStatus
  progress: number
  resultUrl?: string
  inputSizeBytes?: number
  outputSizeBytes?: number
  errorMessage?: string
}

export async function getJobStatus(jobId: string): Promise<Job> {
  return apiRequest<Job>(`/api/jobs/${jobId}`)
}

import { fetchEventSource } from '@microsoft/fetch-event-source'

/**
 * Create an SSE connection to stream job progress.
 * Returns a cleanup function to close the connection (using AbortController).
 */
export function streamJobProgress(
  jobId: string,
  token: string | null,
  handlers: {
    onProgress: (pct: number, status: JobStatus) => void
    onDone: (result: { resultUrl: string; inputSizeBytes: number; outputSizeBytes: number; reductionPct: number }) => void
    onError: (message: string) => void
  }
): () => void {
  const url = window.location.origin + `/api/jobs/${jobId}/stream`
  const ctrl = new AbortController()
  
  const headers: Record<string, string> = {
    'Accept': 'text/event-stream',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  fetchEventSource(url, {
    method: 'GET',
    headers,
    signal: ctrl.signal,
    async onopen(response) {
      if (response.ok) {
        return;
      }
      handlers.onError(`Connection failed: ${response.status}`)
      ctrl.abort()
    },
    onmessage(msg) {
      if (msg.event === 'progress') {
        const data = JSON.parse(msg.data)
        handlers.onProgress(data.progress, data.status)
      } else if (msg.event === 'done') {
        const data = JSON.parse(msg.data)
        handlers.onDone(data)
        ctrl.abort()
      } else if (msg.event === 'error') {
        const data = JSON.parse(msg.data)
        handlers.onError(data.message)
        ctrl.abort()
      }
    },
    onclose() {
      // Do not retry automatically if closed normally
    },
    onerror(err) {
      handlers.onError(err.message || 'Connection lost')
      ctrl.abort()
      throw err // Stop retrying
    }
  })

  return () => ctrl.abort()
}

// ─── User ────────────────────────────────────────

export async function getUserUsage() {
  return apiRequest('/api/user/usage', { requireAuth: true })
}

export async function getUserHistory() {
  return apiRequest('/api/user/history', { requireAuth: true })
}

export async function deleteFile(fileId: string, storagePath: string) {
  return apiRequest(`/api/files/${fileId}`, {
    method: 'DELETE',
    body: { storagePath },
    requireAuth: true,
  })
}
