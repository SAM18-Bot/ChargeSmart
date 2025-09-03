'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User as AppUser } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { Zap, Loader2 } from 'lucide-react';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || 'No Email',
          photoURL: firebaseUser.photoURL || undefined,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  
  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if(userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Manually update our local user state as onAuthStateChanged might be slow
        const appUser: AppUser = {
          id: userCredential.user.uid,
          name: name,
          email: email,
        };
        setUser(appUser);
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  }

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const value = { user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout };

  if (loading && !['/login', '/register'].includes(pathname)) {
      return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="flex items-center space-x-4">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
          <h1 className="text-4xl font-headline font-bold text-primary">ChargeSmart</h1>
        </div>
        <p className="mt-4 text-muted-foreground">Securing your session...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
