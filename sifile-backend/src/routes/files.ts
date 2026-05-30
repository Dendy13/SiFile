import { Router, Response } from 'express'
import { AuthenticatedRequest, authMiddleware, requireAuth } from '../middleware/auth'
import { deleteFile } from '../services/storage'
import { adminFirestore } from '../services/firebase-admin'

export const filesRouter = Router()

/**
 * DELETE /api/files/:id
 * Delete a file from Firebase Storage before TTL.
 * Requires authentication.
 */
filesRouter.delete(
  '/:id',
  authMiddleware,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user!.uid
    const { storagePath } = req.body

    if (!storagePath) {
      return res.status(400).json({ error: 'storagePath is required in request body' })
    }

    // Verify the storagePath belongs to this user (path contains userId)
    if (!storagePath.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    try {
      await deleteFile(storagePath)

      // Also delete job record if associated
      if (id) {
        const jobSnap = await adminFirestore
          .collection('jobs')
          .where('fileId', '==', id)
          .where('userId', '==', userId)
          .limit(1)
          .get()

        if (!jobSnap.empty) {
          await jobSnap.docs[0].ref.delete()
        }
      }

      res.json({ success: true, message: 'File deleted successfully' })
    } catch (err) {
      console.error('Delete file error:', err)
      res.status(500).json({ error: 'Failed to delete file' })
    }
  }
)
