import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)

// Auth helpers
export const signInAnon = () => signInAnonymously(auth)

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export const signOutUser = () => signOut(auth)

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback)

/**
 * Get the current user's ID token for API requests.
 * Returns null if user is not authenticated.
 */
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

export default app
