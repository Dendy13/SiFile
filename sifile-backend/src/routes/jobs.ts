import { Router, Response } from 'express'
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth'
import { getJob, getRecentJobs, deleteJob } from '../services/firestore'
import { adminFirestore } from '../services/firebase-admin'

export const jobsRouter = Router()

/**
 * GET /api/jobs
 * Get recent jobs for the authenticated user (last 24 hours).
 */
jobsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid
    const jobs = await getRecentJobs(userId)
    res.json(jobs)
  } catch (error) {
    console.error('Error fetching recent jobs:', error)
    res.status(500).json({ error: 'Failed to fetch job history' })
  }
})

/**
 * DELETE /api/jobs/:id
 * Delete a specific job from history.
 */
jobsRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.uid
    
    const success = await deleteJob(id, userId)
    if (!success) {
      return res.status(404).json({ error: 'Job not found or access denied' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    res.status(500).json({ error: 'Failed to delete job' })
  }
})

/**
 * GET /api/jobs/:id

 * Get current job status and result URL.
 */
jobsRouter.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const userId = req.user!.uid

  const job = await getJob(id)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  // Ensure users can only access their own jobs
  if (job.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  res.json(job)
})

/**
 * GET /api/jobs/:id/stream
 * Server-Sent Events (SSE) stream for real-time job progress.
 *
 * Polls Firestore every second and pushes progress updates.
 * Closes connection when job is done or errored.
 */
jobsRouter.get('/:id/stream', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const userId = req.user!.uid

  // Verify job ownership
  const job = await getJob(id)
  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }
  if (job.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering
  res.flushHeaders()

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Send initial state
  sendEvent('progress', { progress: job.progress, status: job.status })

  // Subscribe to Firestore real-time updates
  const unsubscribe = adminFirestore
    .collection('jobs')
    .doc(id)
    .onSnapshot((doc) => {
      if (!doc.exists) return

      const data = doc.data() as typeof job

      if (data.status === 'processing' || data.status === 'pending') {
        sendEvent('progress', { progress: data.progress, status: data.status })
      } else if (data.status === 'done') {
        sendEvent('done', {
          progress: 100,
          status: 'done',
          resultUrl: data.resultUrl,
          inputSizeBytes: data.inputSizeBytes,
          outputSizeBytes: data.outputSizeBytes,
          reductionPct: data.inputSizeBytes && data.outputSizeBytes
            ? Math.round((1 - data.outputSizeBytes / data.inputSizeBytes) * 100)
            : 0,
          resultText: data.resultText,
        })
        cleanup()
      } else if (data.status === 'error') {
        sendEvent('error', { message: data.errorMessage || 'Processing failed' })
        cleanup()
      }
    })

  // Heartbeat to keep connection alive (every 15s)
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n')
  }, 15000)

  // Timeout after 5 minutes
  const timeout = setTimeout(() => {
    sendEvent('error', { message: 'Processing timeout' })
    cleanup()
  }, 5 * 60 * 1000)

  function cleanup() {
    unsubscribe()
    clearInterval(heartbeat)
    clearTimeout(timeout)
    res.end()
  }

  // Cleanup on client disconnect
  req.on('close', cleanup)
})
