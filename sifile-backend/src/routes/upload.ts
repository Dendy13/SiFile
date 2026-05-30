import { Router, Response } from 'express'
import multer from 'multer'
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth'
import { uploadTempFile } from '../services/storage'
import { trackUsageEvent } from '../services/firestore'
import { getSuggestions } from '../agentic/paramSuggest'

export const uploadRouter = Router()

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/avif',
])

const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB || '200') * 1024 * 1024

// Use memory storage — file never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  },
})

/**
 * POST /api/upload
 * Upload a file to Firebase Storage (temp area).
 * Returns file_id, preview_url, and initial parameter suggestions.
 */
uploadRouter.post(
  '/',
  authMiddleware,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const { originalname, mimetype, buffer, size } = req.file
    const userId = req.user!.uid
    const operation = req.body.operation as string

    try {
      // Upload to Firebase Storage
      const { fileId, storagePath, previewUrl } = await uploadTempFile(
        buffer,
        mimetype,
        originalname,
        userId
      )

      // Get parameter suggestions
      const suggestions = await getSuggestions(operation, {
        mimeType: mimetype,
        sizeBytes: size,
        originalName: originalname,
      })

      // Track upload event (non-blocking)
      trackUsageEvent(userId, 'file_upload', {
        fileId,
        fileType: mimetype,
        fileSizeBytes: size,
        operation,
      }).catch(() => {})

      res.json({
        fileId,
        storagePath,
        previewUrl,
        fileName: originalname,
        mimeType: mimetype,
        sizeBytes: size,
        suggestions,
      })
    } catch (err) {
      console.error('Upload error:', err)
      res.status(500).json({ error: 'Upload failed', message: (err as Error).message })
    }
  }
)
