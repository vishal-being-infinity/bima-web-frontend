import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createSession, getMyProfile, type UserModel } from '../api/auth';

type AuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'profileIncomplete'
  | 'pendingApproval'
  | 'authenticated'
  | 'blocked'
  | 'sessionConflict';

interface AuthContextValue {
  firebaseUser: User | null;
  user: UserModel | null;
  status: AuthStatus;
  sessionConflictMessage: string | null;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  status: 'loading',
  sessionConflictMessage: null,
  reload: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserModel | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [sessionConflictMessage, setSessionConflictMessage] = useState<string | null>(null);

  const fetchProfile = async (_fbUser: User) => {
    // Step 1: fetch profile — determines if user is registered
    let profile;
    try {
      profile = await getMyProfile();
    } catch (err: unknown) {
      const httpStatus = (err as { response?: { status?: number } })?.response?.status;
      if (httpStatus === 404) {
        // New user — no session needed yet, just show registration
        setStatus('profileIncomplete');
      } else {
        setStatus('unauthenticated');
      }
      setUser(null);
      return;
    }

    // Step 2: registered user — create/validate session (409 = active on another device)
    try {
      await createSession();
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { code?: string; message?: string } } })?.response;
      if (res?.status === 409 && res?.data?.code === 'SESSION_EXISTS') {
        setSessionConflictMessage(
          res.data?.message ?? 'You already have an active session on another device. Please log out there first.'
        );
        setStatus('sessionConflict');
        setUser(null);
        return;
      }
      // Other session errors — allow login to continue
    }

    // Step 3: apply profile state
    if (profile.blocked) {
      setStatus('blocked');
    } else if (!profile.approved) {
      setStatus('pendingApproval');
    } else {
      setStatus('authenticated');
    }
    setUser(profile);
  };

  const reload = async () => {
    if (firebaseUser) await fetchProfile(firebaseUser);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setStatus('unauthenticated');
        setUser(null);
        setSessionConflictMessage(null);
        return;
      }
      await fetchProfile(fbUser);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, status, sessionConflictMessage, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
