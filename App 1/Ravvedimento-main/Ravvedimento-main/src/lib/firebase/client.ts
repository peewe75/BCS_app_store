import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let db: Firestore
let auth: Auth

export function initFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
  auth = getAuth(app)
  return { app, db, auth }
}

export function getFirestoreDB(): Firestore {
  if (!db) {
    initFirebase()
  }
  return db
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebase()
  }
  return auth
}

export async function saveCalcolo(calcolo: any, userId: string) {
  const database = getFirestoreDB()
  try {
    const docRef = await addDoc(collection(database, 'calcoli'), {
      ...calcolo,
      userId,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id }
  } catch (error) {
    console.error('Error saving calcolo:', error)
    throw error
  }
}

export async function getStoricoCalcoli(userId: string) {
  const database = getFirestoreDB()
  try {
    const q = query(
      collection(database, 'calcoli'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const calcoli = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Assicuriamoci che createdAt sia trattato correttamente per l'ordinamento
    }))

    // Ordiniamo in memoria per evitare errori di indice mancante in Firestore
    return calcoli.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
  } catch (error) {
    console.error('Error fetching storico:', error)
    return []
  }
}

export async function getParametriNormativi() {
  const database = getFirestoreDB()
  try {
    const querySnapshot = await getDocs(collection(database, 'parametri'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching parametri:', error)
    return []
  }
}

