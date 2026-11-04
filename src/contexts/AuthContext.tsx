import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getMyProfile, type UserModel } from '../api/auth';

type AuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'profileIncomplete'
  | 'pendingApproval'
  | 'authenticated'
  | 'blocked';

interface AuthContextValue {
  firebaseUser: User | null;
  user: UserModel | null;
  status: AuthStatus;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  status: 'loading',
  reload: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserModel | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const fetchProfile = async (fbUser: User) => {
    try {
      const profile = await getMyProfile();
      if (profile.blocked) {
        setStatus('blocked');
      } else if (!profile.approved) {
        setStatus('pendingApproval');
      } else {
        setStatus('authenticated');
      }
      setUser(profile);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setStatus('profileIncomplete');
      } else {
        setStatus('unauthenticated');
      }
      setUser(null);
    }
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
        return;
      }
      await fetchProfile(fbUser);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, status, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
