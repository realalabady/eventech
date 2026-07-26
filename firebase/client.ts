import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import { getFirebaseConfig, shouldUseEmulators } from "./config";

/**
 * Lazy Firebase client singletons.
 * Import these getters instead of initializing Firebase anywhere else.
 * Emulators are connected automatically when NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true.
 */

let emulatorsConnected = false;

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }
  return initializeApp(getFirebaseConfig());
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  connectEmulatorsOnce(auth);
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  const db = getFirestore(getFirebaseApp());
  connectEmulatorsOnce(undefined, db);
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  const storage = getStorage(getFirebaseApp());
  connectEmulatorsOnce(undefined, undefined, storage);
  return storage;
}

/**
 * Callables live in me-central1 (Doha) — the nearest Cloud Functions region to
 * the Firestore database in me-central2 (Dammam), which does not host Functions.
 * The region MUST match functions/src/index.ts or every call 404s.
 */
export const FUNCTIONS_REGION = "me-central1";

export function getFirebaseFunctions(): Functions {
  const functions = getFunctions(getFirebaseApp(), FUNCTIONS_REGION);
  connectEmulatorsOnce(undefined, undefined, undefined, functions);
  return functions;
}

function connectEmulatorsOnce(
  auth?: Auth,
  db?: Firestore,
  storage?: FirebaseStorage,
  functions?: Functions,
): void {
  if (!shouldUseEmulators() || emulatorsConnected) {
    return;
  }

  const app = getFirebaseApp();
  const resolvedAuth = auth ?? getAuth(app);
  const resolvedDb = db ?? getFirestore(app);
  const resolvedStorage = storage ?? getStorage(app);
  const resolvedFunctions = functions ?? getFunctions(app);

  connectAuthEmulator(resolvedAuth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(resolvedDb, "127.0.0.1", 8080);
  connectStorageEmulator(resolvedStorage, "127.0.0.1", 9199);
  connectFunctionsEmulator(resolvedFunctions, "127.0.0.1", 5001);

  emulatorsConnected = true;
}
