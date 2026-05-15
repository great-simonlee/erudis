import type { UserRole } from '../types';

/** Short labels for profile and feed badges (English UI). */
export const ROLE_LABEL: Record<UserRole | string, string> = {
  professor: 'Professor / PI',
  phd: 'PhD Candidate',
  postdoc: 'Postdoctoral Researcher',
  researcher: 'Researcher',
  research_scientist: 'Research Scientist',
  industry_researcher: 'Industry Researcher',
  institution_admin: 'Admin',
  pending: 'Member',
};

export function roleLabel(role: UserRole | string | undefined): string {
  if (!role) return 'Member';
  return ROLE_LABEL[role] ?? String(role);
}
