'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '@/firebase/firebase';
import { createUserProfile, getUserProfile, updateUserPresence } from '@/firebase/firestore';
import type { UserProfile } from '@/types';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile(nextUser: User | null) {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    const existingProfile = await getUserProfile(nextUser.uid);
    setProfile(existingProfile || (await createUserProfile(nextUser)));
    await updateUserPresence(nextUser.uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setError(null);
      setUser(nextUser);

      try {
        await loadProfile(nextUser);
      } catch (err) {
        setError(getFirebaseErrorMessage(err, 'Unable to load your profile.'));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      refreshProfile: () => loadProfile(user)
    }),
    [user, profile, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
