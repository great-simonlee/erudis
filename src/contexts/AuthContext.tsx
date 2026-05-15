import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../lib/firebase';
import type { User as UserProfile } from '../types';

type AuthContextValue = {
  user: FirebaseAuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: Error | null;
  refreshProfile: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const authSvc = auth;
    if (!firebaseReady || !authSvc) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(
      authSvc,
      (u) => {
        setUser(u);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- firebase module singletons
  }, []);

  useEffect(() => {
    if (!user?.uid || !firebaseReady || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const firestore = db;
    const ref = doc(firestore, 'users', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: snap.id, ...(snap.data() as Omit<UserProfile, 'uid'>) });
        } else {
          setProfile(null);
        }
        setProfileLoading(false);
      },
      (e) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setProfileLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- firebase module singletons
  }, [user?.uid]);

  const refreshProfile = useCallback(() => {
    if (!user) return;
    void user.reload();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      error,
      refreshProfile,
    }),
    [user, profile, loading, profileLoading, error, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
