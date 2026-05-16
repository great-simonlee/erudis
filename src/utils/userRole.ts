import type { UserRole } from '../types';

export function isGeneralMemberRole(role: UserRole | string | undefined): boolean {
  return role === 'general';
}
