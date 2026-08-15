import admin from 'firebase-admin'

let firebaseAuthInstance = null

export function getFirebaseAuth() {
  if (firebaseAuthInstance) return firebaseAuthInstance

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Firebase Admin environment variables are missing')
  }

  const app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      })

  firebaseAuthInstance = app.auth()
  return firebaseAuthInstance
}
