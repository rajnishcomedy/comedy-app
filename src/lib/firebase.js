import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length) {
  const msg = `Missing Firebase env vars: ${missingKeys.join(', ')}. Copy and fill .env.example to .env.`;
  console.error(msg);
  throw new Error(msg);
}

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence (app loads with cached data even without network)
// Note: v12+ warns this API may change, but fallback keeps the app running.
enableIndexedDbPersistence(db, { synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore offline persistence: multiple tabs open, limited to one.');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore offline persistence: browser not supporting IndexedDB persistence. Falling back to memory cache.');
  } else {
    console.warn('Firestore offline persistence error (non-fatal):', err);
  }
});

// Set explicit fallback cache to avoid dead states from permission or persistence errors.
// With Firestore's new settings interface, this code remains compatible while we future-proof migration.
/*
import { initializeFirestore } from 'firebase/firestore';
const db = initializeFirestore(app, {localCache: true});
*/
