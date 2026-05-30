import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsMiddleware } from './middleware/cors'
import { uploadRouter } from './routes/upload'
import { processRouter } from './routes/process'
import { jobsRouter } from './routes/jobs'
import { filesRouter } from './routes/files'
import { userRouter } from './routes/user'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(corsMiddleware)
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sifile-backend', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/upload', uploadRouter)
app.use('/api/process', processRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/files', filesRouter)
app.use('/api/user', userRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 SiFile Backend running on port ${PORT}`)
  console.log(`📋 FREEMIUM_ENABLED: ${process.env.FREEMIUM_ENABLED || 'false'}`)
  console.log(`🔒 REQUIRE_AUTH: ${process.env.REQUIRE_AUTH || 'false'}`)
})

export default app
