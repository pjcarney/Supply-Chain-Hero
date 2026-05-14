import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from '../lib/firebase';

interface UserProgress {
  userId: string;
  scores: Record<string, number>;
  lastUpdated: any;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  saving: boolean;
  progress: UserProgress | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProgress: (scenario: number, days: number) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Sync listener for user progress
  useEffect(() => {
    let unsubscribeProgress: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Set up real-time listener for this user's progress
        const docRef = doc(db, 'users', user.uid);
        unsubscribeProgress = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProgress(docSnap.data() as UserProgress);
          } else {
            setProgress(null);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });
      } else {
        if (unsubscribeProgress) unsubscribeProgress();
        setProgress(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProgress) unsubscribeProgress();
    };
  }, []);

  const signIn = useCallback(async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, []);

  const userLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const [saving, setSaving] = useState(false);

  const saveProgress = useCallback(async (scenario: number, days: number) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('[FirebaseContext] Cannot save progress: No authenticated user.');
      return;
    }

    try {
      setSaving(true);
      const uid = currentUser.uid;
      const scenarioKey = `scenario_${scenario}`;
      const docRef = doc(db, 'users', uid);

      console.log(`[FirebaseContext] saveProgress for Scenario ${scenario}, Day ${days}`);
      
      const currentBest = progress?.scores?.[scenarioKey];

      if (currentBest === undefined || days < currentBest) {
        console.log(`[FirebaseContext] New best! Saving to Firestore. Prev best: ${currentBest ?? 'None'}`);
        
        const newScores = {
          ...(progress?.scores || {}),
          [scenarioKey]: days,
        };

        // Use merge: true to avoid overwriting other fields if they exist
        await setDoc(docRef, {
          userId: uid,
          scores: newScores,
          lastUpdated: serverTimestamp(),
        }, { merge: true });
        
        console.log('[FirebaseContext] Save success.');
      } else {
        console.log(`[FirebaseContext] Not a new best. Current: ${days}, Best: ${currentBest}`);
      }
    } catch (error) {
      console.error('[FirebaseContext] Save Error:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
    } finally {
      setSaving(false);
    }
  }, [progress]);

  return (
    <FirebaseContext.Provider value={{ user, loading, progress, saving, signIn, signOut: userLogout, saveProgress }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
