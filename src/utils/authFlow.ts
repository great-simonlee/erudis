import { requireEmailVerification } from '../config/flags';

/** True when the app should block unverified users (verify-email step). */
export function emailVerificationBlocksAccess(emailVerified: boolean): boolean {
  return requireEmailVerification && !emailVerified;
}
