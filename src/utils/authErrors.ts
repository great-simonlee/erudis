import type { AuthError } from 'firebase/auth';

/**
 * Maps Firebase Auth and Firestore client errors to short UI strings.
 * Used on sign-up where failures can come from Auth, profile update, or `users` writes.
 */
export function mapAuthError(err: unknown): string {
  const code = (err as AuthError & { code?: string })?.code;

  if (
    typeof code === 'string' &&
    (code === 'auth/invalid-api-key' ||
      /api-key-not-valid|invalid-api-key/i.test(code))
  ) {
    return 'Firebase rejected the Web API key. In Firebase Console, open Project settings, then General: under "Your apps", copy the Web API key into REACT_APP_FIREBASE_API_KEY in .env.local (no extra spaces or quotes). Stop the dev server, run npm start again, and hard-refresh the browser.';
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'That email address does not look valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account exists for this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters including a number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled for this project. Enable it in Firebase Console → Authentication → Sign-in method.';
    case 'auth/configuration-not-found':
      return 'Firebase Auth could not use this web app configuration. (1) In Firebase → Project settings → General, re-copy all values from the same Web app into .env.local. (2) In Google Cloud → APIs & services → Credentials, open this Browser key: set Application restrictions to “None” for testing, or under HTTP referrers add http://localhost:3000/* and http://127.0.0.1:3000/* (match your URL). (3) In APIs & services → Library, ensure “Identity Toolkit API” is enabled for this project. (4) After changing .env, restart npm start and hard-refresh the browser.';

    // Firestore (e.g. setDoc on users/{uid} after sign-up)
    case 'permission-denied':
      return 'Could not save your profile. In Firebase Console, open Firestore → Rules and allow signed-in users to create their own users/{userId} document (see FIRESTORE_RULES.md in this repo).';
    case 'unavailable':
      return 'Firestore is temporarily unavailable. Try again in a moment.';
    case 'failed-precondition':
      return 'Could not complete the request. Check that Firestore is enabled for this project.';
    case 'auth/internal-error':
      return 'Firebase reported an internal error. Try again shortly, or check Firebase status and your project configuration.';

    default: {
      if (code && typeof code === 'string') {
        return `Something went wrong (${code}). Open the browser console for the full “[Register]” error details.`;
      }
      const msg =
        err instanceof Error && err.message?.trim()
          ? err.message.trim()
          : '';
      return msg
        ? `Something went wrong: ${msg}`
        : 'Something went wrong. Please try again.';
    }
  }
}
