import { useAuthContext } from '../contexts/AuthContext';

/**
 * Current Firebase session and Firestore user profile.
 */
export function useAuth() {
  const { user, profile, loading, profileLoading, error, refreshProfile } =
    useAuthContext();
  return { user, profile, loading, profileLoading, error, refreshProfile };
}
