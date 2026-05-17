import type { Lab, User } from '../types';

export function isInstitutionAdminRole(role: string | undefined): boolean {
  return role === 'institution_admin';
}

export function isInstitutionAdmin(profile: User | null | undefined): boolean {
  return isInstitutionAdminRole(profile?.role);
}

export function managesInstitution(
  profile: User | null | undefined,
  institutionId: string
): boolean {
  if (!profile || !isInstitutionAdmin(profile)) return false;
  return profile.institutionId === institutionId;
}

export function canManageLab(profile: User | null | undefined, lab: Lab): boolean {
  if (!profile?.uid) return false;
  if (lab.piId === profile.uid) return true;
  return managesInstitution(profile, lab.institutionId);
}
