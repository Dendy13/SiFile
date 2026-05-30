import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

/**
 * Initialize Firebase Admin SDK.
 * Priority order:
 * 1. FIREBASE_ADMIN_SDK env var — inline JSON string (production/Cloud Run)
 * 2. GOOGLE_APPLICATION_CREDENTIALS env var — path to service account JSON file (local dev)
 * 3. Application Default Credentials — gcloud auth application-default login (CI/local)
 */
let app: admin.app.App

if (!admin.apps.length) {
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

  if (process.env.FIREBASE_ADMIN_SDK) {
    // Production: inline JSON string from Secret Manager / Cloud Run env
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK)
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket,
    })
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Local dev: service account JSON file path
    const keyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket,
    })
  } else {
    // Fallback: Application Default Credentials (gcloud auth application-default login)
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket,
    })
  }
} else {
  app = admin.app()
}

export const adminAuth = admin.auth()
export const adminFirestore = admin.firestore()
export const adminStorage = admin.storage()
export default app
