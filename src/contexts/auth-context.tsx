
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  updateUserProfile: (profileData: { name: string; contactNumber?: string }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // In a real app, you would fetch the contactNumber from Firestore
        const appUser: AppUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || 'No Email',
          photoURL: firebaseUser.photoURL || undefined,
          contactNumber: '123-456-7890' // Placeholder
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
  
  const registerWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  }

  const updateUserProfile = async (profileData: { name: string; contactNumber?: string }) => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: profileData.name });
        // In a real app, you would save the contactNumber to Firestore here
        // e.g., await setUserData(firebaseUser.uid, { contactNumber: profileData.contactNumber });
        
        // Refresh the user state by creating a new object to trigger re-renders
        const updatedUser: AppUser = {
            id: firebaseUser.uid,
            name: profileData.name,
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
            contactNumber: profileData.contactNumber || 'N/A'
        };
        setUser(updatedUser);
      } else {
        throw new Error("No user is signed in to update.");
      }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  }

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const value = { user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, updateUserProfile, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

    