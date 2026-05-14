/**
 * When true: no Firebase init, no auth — shell and placeholder pages only.
 * Set to false when you add `.env.local` and want real Auth/Firestore.
 */
export const skipFirebase = false;

/** Stable uid for demo links (profile, etc.) when not signed in. */
export const demoUserId = 'demo';

/**
 * When true, Firebase Auth email is a deterministic alias under
 * `info+...@theerudis.com` so verification & password-reset mail can be read
 * from **info@theerudis.com** (plus-address routing). Firestore `users.email`
 * stays the institutional address the user typed.
 * Set to **false** for production so Auth email equals the institutional email.
 */
export const useCentralVerificationInbox = true;

/**
 * Domains allowed as “institutional” email in addition to academic TLDs
 * (`.edu`, `.ac.*`, etc.). Use for staging / demo accounts.
 */
export const extraInstitutionalEmailDomains: readonly string[] = [
  'misaeng.com',
];
