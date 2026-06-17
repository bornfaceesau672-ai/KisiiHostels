import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check safely in browser
if (typeof window !== 'undefined') {
  try {
    // If in development mode, use debug token to prevent blocking local development
    try {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      } else if ((import.meta as any).env?.DEV) {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
    } catch (e) {
      // ignore
    }

    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LfWPyUtAAAAAEfb8VGKkmcnPrrXzj3mGQvWtnD7'),
      isTokenAutoRefreshEnabled: true,
    });
    console.log('Firebase App Check initialized successfully.');
  } catch (error) {
    console.warn('Failed to initialize Firebase App Check:', error);
  }
}


// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Analytics safely
export let analytics: any = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized successfully.');
  } else {
    console.log('Firebase Analytics is not supported in this environment.');
  }
}).catch((err) => {
  console.warn('Failed to check if Firebase Analytics is supported:', err);
});

/**
 * Log a custom event to Firebase Analytics (safely guards if not supported/initialized)
 */
export function logAnalyticsEvent(eventName: string, eventParams?: Record<string, any>) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.warn(`Failed to log analytics event "${eventName}":`, error);
    }
  }
}

// Firestore operation mapping types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handles custom FireStore permissions and query exceptions conforming to strict JSON schema expectations.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Immediate connection check to Firestore as required by the SKILL guideline
async function testConnection() {
  const path = 'test-connection-probe/status';
  try {
    await getDocFromServer(doc(db, 'test-connection-probe', 'status'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or local connection status.");
    } else {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        console.error("Test connection verification failed:", e);
      }
    }
  }
}

testConnection();
