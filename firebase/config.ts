import { z } from "zod";

/**
 * Firebase client configuration, validated with Zod.
 * Values come from `.env.local` (see `.env.example`).
 * Validation is lazy (called from `firebase/client.ts`) so the app can build
 * before a Firebase project has been provisioned.
 */
const firebaseEnvSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
});

export type FirebaseClientConfig = z.infer<typeof firebaseEnvSchema>;

export function getFirebaseConfig(): FirebaseClientConfig {
  const parsed = firebaseEnvSchema.safeParse({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  if (!parsed.success) {
    throw new Error(
      `Missing or invalid NEXT_PUBLIC_FIREBASE_* environment variables. Copy .env.example to .env.local and fill it in. Details: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

export function shouldUseEmulators(): boolean {
  return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
}
