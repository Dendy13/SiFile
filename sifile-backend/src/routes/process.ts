import { Router, Response } from 'express'
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth'
import { createJob, updateJob, trackUsageEvent } from '../services/firestore'
import { downloadFile, uploadResult } from '../services/storage'
import { getSuggestions } from '../agentic/paramSuggest'

// Processor imports
import { compressImage } from '../processors/image/compress'
import { resizeImage } from '../processors/image/resize'
import { convertImage } from '../processors/image/convert'
import { imageToPdf } from '../processors/image/fromImages'
import { compressPdf } from '../processors/pdf/compress'
import { splitPdf } from '../processors/pdf/split'
import { pdfToImage } from '../processors/pdf/toImage'
import { mergePdf } from '../processors/pdf/merge'
import { summarizeDocument } from '../processors/ai/summarize'
import { compareDocuments } from '../processors/ai/compare'

export const processRouter = Router()

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string; resultText?: string }>

// Registry of available processors
const PROCESSORS: Record<string, ProcessorFn> = {
  'image-compress': compressImage,
  'image-resize': resizeImage,
  'image-convert': convertImage,
  'image-to-pdf': imageToPdf,
  'pdf-compress': compressPdf,
  'pdf-split': splitPdf,
  'pdf-to-image': pdfToImage,
  'pdf-merge': mergePdf,
  'doc-summarize': summarizeDocument,
  'doc-compare': compareDocuments,
}

/**
 * POST /api/process
 * Start a processing job. Returns job_id and suggested params.
 * Processing runs async — poll via GET /api/jobs/:id or stream via SSE.
 */
processRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { fileId, storagePath, files, operation, params = {}, inputSizeBytes = 0 } = req.body
  const userId = req.user!.uid

  if ((!fileId || !storagePath) && (!files || files.length === 0) || !operation) {
    return res.status(400).json({ error: 'fileId/storagePath or files, and operation are required' })
  }

  if (!PROCESSORS[operation]) {
    return res.status(400).json({
      error: `Unknown operation: ${operation}`,
      available: Object.keys(PROCESSORS),
    })
  }

  // Get suggestions for the operation (re-calculated server-side for security)
  const suggestedParams = await getSuggestions(operation, {
    mimeType: req.body.mimeType || '',
    sizeBytes: inputSizeBytes,
  })

  // Merge user params with suggestions (user overrides take precedence)
  const finalParams = { ...suggestedParams.params, ...params }

  // Create job record
  const job = await createJob({
    userId,
    operation,
    fileId,
    storagePath,
    files,
    params: finalParams,
    suggestedParams: suggestedParams.params,
    inputSizeBytes,
  })

  // Track operation start (non-blocking)
  trackUsageEvent(userId, 'operation_start', { operation, fileId }).catch(() => {})

  // Return immediately — processing runs in background
  res.json({
    jobId: job.id,
    suggestedParams: suggestedParams.params,
    rationale: suggestedParams.rationale,
  })

  // Run processor in background (fire and forget)
  runProcessor(job.id, storagePath, files, operation, finalParams, userId).catch((err) => {
    console.error(`Processor failed for job ${job.id}:`, err)
  })
})

async function runProcessor(
  jobId: string,
  storagePath: string,
  files: Array<{fileId: string, storagePath: string}> | undefined,
  operation: string,
  params: Record<string, unknown>,
  userId: string
) {
  const processor = PROCESSORS[operation]

  try {
    await updateJob(jobId, { status: 'processing', progress: 5 })

    // Download file(s) from Firebase Storage
    await updateJob(jobId, { progress: 15 })
    let inputBuffer: Buffer | Buffer[];
    if (files && files.length > 0) {
      inputBuffer = await Promise.all(files.map(f => downloadFile(f.storagePath)));
    } else {
      inputBuffer = await downloadFile(storagePath);
    }

    await updateJob(jobId, { progress: 25 })

    // Run processor with progress callback
    const result = await processor(inputBuffer, params, async (pct: number) => {
      await updateJob(jobId, { progress: 25 + Math.floor(pct * 0.6) }) // 25–85%
    })

    await updateJob(jobId, { progress: 88 })

    // Upload result
    const { signedUrl, storagePath: resultPath } = await uploadResult(
      result.buffer,
      result.mimeType,
      jobId,
      result.filename
    )

    await updateJob(jobId, {
      status: 'done',
      progress: 100,
      resultUrl: signedUrl,
      resultStoragePath: resultPath,
      outputSizeBytes: result.buffer.length,
      resultText: result.resultText,
    })

    trackUsageEvent(userId, 'operation_complete', { operation, jobId }).catch(() => {})
  } catch (err) {
    const message = (err as Error).message
    await updateJob(jobId, {
      status: 'error',
      errorMessage: message,
    })
    trackUsageEvent(userId, 'operation_error', { operation, jobId, error: message }).catch(() => {})
  }
}
