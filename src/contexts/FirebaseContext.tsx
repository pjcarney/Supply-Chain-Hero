import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle, loginWithGithub, logout, handleFirestoreError, OperationType } from '../lib/firebase';

export interface ScenarioAttempt {
  id: string;
  scenario: number;
  score: number;
  date: string;
  outcome: 'victory' | 'in_progress' | 'failed';
  cashFlow?: number;
}

export interface UserProgress {
  userId: string;
  studentName?: string;
  studentId?: string;
  scores: Record<string, number>;
  attempts?: ScenarioAttempt[];
  lastUpdated?: any;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  saving: boolean;
  progress: UserProgress | null;
  signIn: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProgress: (scenario: number, score: number, attemptInfo?: { outcome?: 'victory' | 'in_progress' | 'failed'; cashFlow?: number }) => Promise<void>;
  updateStudentProfile: (name: string, studentId: string) => Promise<void>;
  exportRecordsJSON: () => void;
  importRecordsJSON: (jsonString: string) => boolean;
  clearRecords: () => void;
}

const LOCAL_STORAGE_KEY = 'supplychain_hero_student_records_v1';

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize progress from localStorage first (for instant offline / student session load)
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          userId: parsed.userId || 'guest_student',
          studentName: parsed.studentName || '',
          studentId: parsed.studentId || '',
          scores: parsed.scores || {},
          attempts: parsed.attempts || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('[FirebaseContext] Failed to load local student progress:', e);
    }
    return {
      userId: 'guest_student',
      studentName: '',
      studentId: '',
      scores: {},
      attempts: []
    };
  });

  // Helper to save to localStorage
  const saveToLocal = (data: UserProgress) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[FirebaseContext] Failed to write to localStorage:', e);
    }
  };

  // Sync listener for user progress via Firestore
  useEffect(() => {
    let unsubscribeProgress: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        const docRef = doc(db, 'users', authUser.uid);
        unsubscribeProgress = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const remoteData = docSnap.data() as UserProgress;
            
            // Merge remote with current local data
            setProgress(prev => {
              const mergedScores = { ...prev.scores, ...remoteData.scores };
              
              // Resolve score improvements
              Object.keys({ ...prev.scores, ...remoteData.scores }).forEach(key => {
                const scNum = parseInt(key.replace('scenario_', ''), 10);
                const localVal = prev.scores[key];
                const remoteVal = remoteData.scores[key];

                if (localVal !== undefined && remoteVal !== undefined) {
                  // Scenarios 3, 4, 5: Higher is better
                  // Scenarios 1, 2, 6: Lower is better
                  if ([3, 4, 5].includes(scNum)) {
                    mergedScores[key] = Math.max(localVal, remoteVal);
                  } else {
                    mergedScores[key] = Math.min(localVal, remoteVal);
                  }
                }
              });

              // Merge attempts avoiding duplicates
              const localAttempts = prev.attempts || [];
              const remoteAttempts = remoteData.attempts || [];
              const attemptMap = new Map<string, ScenarioAttempt>();
              [...localAttempts, ...remoteAttempts].forEach(att => {
                if (att && att.id) attemptMap.set(att.id, att);
              });
              const mergedAttempts = Array.from(attemptMap.values()).sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );

              const updated: UserProgress = {
                userId: authUser.uid,
                studentName: prev.studentName || remoteData.studentName || authUser.displayName || '',
                studentId: prev.studentId || remoteData.studentId || '',
                scores: mergedScores,
                attempts: mergedAttempts,
                lastUpdated: new Date().toISOString()
              };

              saveToLocal(updated);
              return updated;
            });
          }
          setLoading(false);
        }, (error) => {
          console.warn('[FirebaseContext] Firestore snapshot error, falling back to local:', error);
          setLoading(false);
        });
      } else {
        if (unsubscribeProgress) unsubscribeProgress();
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

  const signInWithGithub = useCallback(async () => {
    try {
      await loginWithGithub();
    } catch (error) {
      console.error('GitHub Sign in error:', error);
    }
  }, []);

  const userLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const updateStudentProfile = useCallback(async (name: string, studentId: string) => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        studentName: name,
        studentId: studentId,
        lastUpdated: new Date().toISOString()
      };
      saveToLocal(updated);

      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        setDoc(doc(db, 'users', uid), {
          studentName: name,
          studentId: studentId,
          lastUpdated: serverTimestamp()
        }, { merge: true }).catch(err => {
          console.warn('Failed to sync profile update to Firestore:', err);
        });
      }

      return updated;
    });
  }, []);

  const saveProgress = useCallback(async (
    scenario: number, 
    score: number, 
    attemptInfo?: { outcome?: 'victory' | 'in_progress' | 'failed'; cashFlow?: number }
  ) => {
    const scenarioKey = `scenario_${scenario}`;
    const outcome = attemptInfo?.outcome || 'victory';
    const newAttempt: ScenarioAttempt = {
      id: `${Date.now()}_sc${scenario}`,
      scenario,
      score,
      date: new Date().toISOString(),
      outcome,
      cashFlow: attemptInfo?.cashFlow
    };

    setProgress(prev => {
      let newScores = prev.scores;

      // Only record a high score when outcome is victory
      if (outcome === 'victory') {
        const currentBest = prev.scores[scenarioKey];
        // Scenarios 3, 4, 5, 7: Higher score (cash flow) is better
        // Scenarios 1, 2, 6: Lower score (days) is better
        const isBetter = currentBest === undefined || 
          ([3, 4, 5, 7].includes(scenario) ? score > currentBest : score < currentBest);

        if (isBetter) {
          newScores = { ...prev.scores, [scenarioKey]: score };
        }
      }

      const newAttempts = [newAttempt, ...(prev.attempts || [])].slice(0, 50); // Keep last 50 attempts

      const updated: UserProgress = {
        ...prev,
        scores: newScores,
        attempts: newAttempts,
        lastUpdated: new Date().toISOString()
      };

      // 1. Save to LocalStorage immediately
      saveToLocal(updated);

      // 2. Async save to Firestore if user is authenticated
      const currentUser = auth.currentUser;
      if (currentUser) {
        setSaving(true);
        const uid = currentUser.uid;
        const docRef = doc(db, 'users', uid);

        setDoc(docRef, {
          userId: uid,
          studentName: prev.studentName || currentUser.displayName || '',
          studentId: prev.studentId || '',
          scores: newScores,
          attempts: newAttempts,
          lastUpdated: serverTimestamp(),
        }, { merge: true })
        .then(() => {
          console.log('[FirebaseContext] Cloud save success.');
        })
        .catch(error => {
          console.error('[FirebaseContext] Cloud Save Error:', error);
          handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
        })
        .finally(() => {
          setSaving(false);
        });
      }

      return updated;
    });
  }, []);

  const exportRecordsJSON = useCallback(() => {
    const exportData = {
      app: 'SupplyChain Hero Logistics Simulator',
      exportDate: new Date().toISOString(),
      studentName: progress.studentName || 'Unassigned',
      studentId: progress.studentId || 'N/A',
      userId: progress.userId,
      scores: progress.scores,
      attempts: progress.attempts || []
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const fileName = `supply_chain_records_${(progress.studentName || 'student').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [progress]);

  const importRecordsJSON = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || !parsed.scores) {
        return false;
      }

      setProgress(prev => {
        const mergedScores = { ...prev.scores, ...parsed.scores };
        const combinedAttempts = [...(parsed.attempts || []), ...(prev.attempts || [])];
        const attemptMap = new Map<string, ScenarioAttempt>();
        combinedAttempts.forEach(att => {
          if (att && att.id) attemptMap.set(att.id, att);
        });
        
        const updated: UserProgress = {
          ...prev,
          studentName: parsed.studentName || prev.studentName,
          studentId: parsed.studentId || prev.studentId,
          scores: mergedScores,
          attempts: Array.from(attemptMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          lastUpdated: new Date().toISOString()
        };

        saveToLocal(updated);

        if (auth.currentUser) {
          const uid = auth.currentUser.uid;
          setDoc(doc(db, 'users', uid), {
            studentName: updated.studentName,
            studentId: updated.studentId,
            scores: updated.scores,
            attempts: updated.attempts,
            lastUpdated: serverTimestamp()
          }, { merge: true }).catch(err => console.warn('Cloud sync on import failed:', err));
        }

        return updated;
      });
      return true;
    } catch (e) {
      console.error('Failed to import student records:', e);
      return false;
    }
  }, []);

  const clearRecords = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const reset: UserProgress = {
      userId: 'guest_student',
      studentName: '',
      studentId: '',
      scores: {},
      attempts: []
    };
    setProgress(reset);
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      setDoc(doc(db, 'users', uid), {
        scores: {},
        attempts: [],
        lastUpdated: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Cloud clear failed:', err));
    }
  }, []);

  return (
    <FirebaseContext.Provider 
      value={{ 
        user, 
        loading, 
        progress, 
        saving, 
        signIn, 
        signInWithGithub, 
        signOut: userLogout, 
        saveProgress,
        updateStudentProfile,
        exportRecordsJSON,
        importRecordsJSON,
        clearRecords
      }}
    >
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
