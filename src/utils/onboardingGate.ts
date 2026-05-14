import type { User } from '../types';

/** True when the user has completed the full onboarding pipeline. */
export function isOnboardingComplete(profile: User | null | undefined): boolean {
  if (!profile) return false;
  if (!profile.researchAreas?.length) return false;
  if (profile.role === 'pending') return false;
  if (!profile.institutionName?.trim()) return false;
  if (!profile.openToWork?.length) return false;
  return true;
}
