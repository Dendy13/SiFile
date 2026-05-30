import { Router, Response } from 'express'
import { AuthenticatedRequest, authMiddleware, requireAuth } from '../middleware/auth'
import { adminFirestore } from '../services/firebase-admin'

export const userRouter = Router()

/**
 * GET /api/user/usage
 * Get usage stats for current user (this month).
 */
userRouter.get(
  '/usage',
  authMiddleware,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid
    const month = new Date().toISOString().slice(0, 7) // YYYY-MM

    try {
      const doc = await adminFirestore
        .collection('users')
        .doc(userId)
        .collection('usage')
        .doc(month)
        .get()

      res.json(doc.exists ? doc.data() : { operations_count: 0, total_mb_processed: 0 })
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch usage stats' })
    }
  }
)

/**
 * GET /api/user/history
 * Get last 30 days of operations for current user.
 */
userRouter.get(
  '/history',
  authMiddleware,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    try {
      const snap = await adminFirestore
        .collection('jobs')
        .where('userId', '==', userId)
        .where('createdAt', '>=', thirtyDaysAgo)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()

      const history = snap.docs.map((doc) => doc.data())
      res.json({ operations: history, count: history.length })
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch history' })
    }
  }
)

/**
 * POST /api/auth/merge-session
 * Merge anonymous session data into authenticated account after login.
 */
userRouter.post(
  '/merge-session',
  authMiddleware,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const { anonymousUid } = req.body
    const authenticatedUid = req.user!.uid

    if (!anonymousUid) {
      return res.status(400).json({ error: 'anonymousUid is required' })
    }

    try {
      // Move anonymous jobs to authenticated account
      const anonJobs = await adminFirestore
        .collection('jobs')
        .where('userId', '==', anonymousUid)
        .get()

      const batch = adminFirestore.batch()
      anonJobs.docs.forEach((doc) => {
        batch.update(doc.ref, { userId: authenticatedUid })
      })
      await batch.commit()

      res.json({ merged: anonJobs.size, message: 'Session merged successfully' })
    } catch (err) {
      res.status(500).json({ error: 'Failed to merge session' })
    }
  }
)
