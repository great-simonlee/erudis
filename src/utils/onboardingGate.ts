import type { User } from '../types';
import { isGeneralMemberRole } from './userRole';

/** True when the user has completed the full onboarding pipeline. */
export function isOnboardingComplete(profile: User | null | undefined): boolean {
  if (!profile) return false;
  if (!profile.researchAreas?.length) return false;
  if (profile.role === 'pending') return false;
  if (!profile.openToWork?.length) return false;
  if (isGeneralMemberRole(profile.role)) return true;
  if (!profile.institutionName?.trim()) return false;
  return true;
}
