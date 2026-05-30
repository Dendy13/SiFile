'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: signInWithGoogle,
    signOut: signOutUser,
  };
}
