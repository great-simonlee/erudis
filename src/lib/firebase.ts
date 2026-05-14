import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { skipFirebase } from '../config/flags';

/** Trim and remove a single pair of wrapping quotes from .env values. */
function cleanEnv(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v || undefined;
}

const firebaseConfig = {
  apiKey: cleanEnv(process.env.REACT_APP_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.REACT_APP_FIREBASE_APP_ID),
};

/** True when required env vars are present (does not guarantee init succeeded). */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (!skipFirebase && firebaseConfigured) {
  try {
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined' &&
      typeof sessionStorage !== 'undefined'
    ) {
      const key = '__erudis_fb_cfg_fingerprint';
      const fp = `${firebaseConfig.projectId}|${firebaseConfig.apiKey?.slice(0, 8)}|${firebaseConfig.authDomain}`;
      const prev = sessionStorage.getItem(key);
      if (prev && prev !== fp) {
        // eslint-disable-next-line no-console -- dev-only hint after .env changes
        console.warn(
          '[THE ERUDIS] Firebase env fingerprint changed. Do a full reload (hard refresh or close the tab) so the SDK picks up the new API key; hot reload alone can leave the old Firebase app in memory.'
        );
      }
      sessionStorage.setItem(key, fp);
    }

    firebaseApp =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console -- confirm which project loaded (no secrets)
      console.info('[THE ERUDIS] Firebase ready', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
      });
    }
  } catch (e) {
    console.error('[THE ERUDIS] Firebase initialization failed.', e);
  }
} else if (!skipFirebase) {
  console.warn(
    '[THE ERUDIS] Firebase env vars missing. Copy .env.example to .env.local and add your keys.'
  );
}

/** True when Auth and Firestore are usable (safe to call SDK methods). */
export const firebaseReady = Boolean(auth && db && storage);

export { firebaseApp, auth, db, storage };
