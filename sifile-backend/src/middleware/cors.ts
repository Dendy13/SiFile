import cors from 'cors'

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  // Add production frontend URL here when deployed
]

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin) return callback(null, true)

    const isAllowedRegex = /sifile-app\.(web\.app|firebaseapp\.com)$|\.hosted\.app$/;
    
    if (ALLOWED_ORIGINS.includes(origin) || isAllowedRegex.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
})
