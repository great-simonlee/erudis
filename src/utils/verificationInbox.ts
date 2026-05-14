import { useCentralVerificationInbox } from '../config/flags';

/** Human-facing staging inbox (plus-addresses must route here). */
export const CENTRAL_VERIFICATION_INBOX = 'info@theerudis.com';

const INBOX_DOMAIN = 'theerudis.com';
const INBOX_LOCAL = 'info';

/**
 * Email used for Firebase Auth (sign-in, verification, password reset).
 * When `useCentralVerificationInbox` is true, returns a unique
 * `info+v1_<sha256prefix>@theerudis.com` for each institutional address.
 */
export async function institutionalToAuthEmail(
  institutionalEmail: string
): Promise<string> {
  const norm = institutionalEmail.trim().toLowerCase();
  if (!useCentralVerificationInbox) return norm;

  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 56);

  return `${INBOX_LOCAL}+v1_${hex}@${INBOX_DOMAIN}`;
}
