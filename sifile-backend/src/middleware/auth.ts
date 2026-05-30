import { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../services/firebase-admin'

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email?: string
    isAnonymous: boolean
    plan: 'anonymous' | 'free' | 'pro'
  }
}

/**
 * Verify Firebase ID Token from Authorization header.
 * Attaches decoded user to req.user.
 *
 * If REQUIRE_AUTH=false (default), anonymous requests are allowed
 * and assigned a synthetic anonymous user context.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const requireAuth = process.env.REQUIRE_AUTH === 'true'
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (requireAuth) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    // No token — treat as anonymous session
    req.user = {
      uid: `anon_${req.ip?.replace(/[.:]/g, '_')}`,
      isAnonymous: true,
      plan: 'anonymous',
    }
    return next()
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      isAnonymous: decoded.firebase?.sign_in_provider === 'anonymous',
      plan: 'free', // TODO: check Firestore for pro plan status
    }
    next()
  } catch (err) {
    console.error('Auth token verification failed:', err)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Require authentication (reject anonymous users).
 * Use after authMiddleware.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.isAnonymous) {
    return res.status(401).json({ error: 'Authentication required for this operation' })
  }
  next()
}
