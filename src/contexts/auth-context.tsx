
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User as AppUser, AdminUser } from '@/lib/types';
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
  admin: AdminUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  updateUserProfile: (profileData: { name: string; contactNumber?: string }) => Promise<void>;
  logout: () => void;
  adminLogin: (adminId: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // By removing the onAuthStateChanged listener, the app will no longer
    // automatically log in users, requiring a manual login each time.
    setLoading(false);
  }, []);

  const handleSuccessfulAuth = (firebaseUser: FirebaseUser) => {
    const appUser: AppUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || 'No Email',
      photoURL: firebaseUser.photoURL || undefined,
      contactNumber: '123-456-7890' // Placeholder
    };
    setUser(appUser);
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    handleSuccessfulAuth(result.user);
  };
  
  const registerWithEmail = async (email: string, pass: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    handleSuccessfulAuth(result.user);
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
    const result = await signInWithEmailAndPassword(auth, email, pass);
    handleSuccessfulAuth(result.user);
  }

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  // Simulated Admin Auth
  const adminLogin = async (adminId: string, pass: string) => {
    // In a real app, you'd verify this against a database.
    if (adminId === 'admin' && pass === 'password') {
      const demoAdmin: AdminUser = {
        id: 'admin01',
        name: 'Station Admin',
        stationId: 'CZ-001', // Manages this station
      };
      setAdmin(demoAdmin);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdmin(null);
    router.push('/admin/login');
  }


  const value = { user, admin, loading, signInWithGoogle, signInWithEmail, registerWithEmail, updateUserProfile, logout, adminLogin, adminLogout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
