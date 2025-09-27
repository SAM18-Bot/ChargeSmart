
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
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { chargers } from '@/lib/data';

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

const adminCredentials = [
    { adminId: 'admin-cz-001', password: '123456', stationId: 'CZ-001' },
    { adminId: 'admin-cz-002', password: '123456', stationId: 'CZ-002' },
    { adminId: 'admin-cz-003', password: '123456', stationId: 'CZ-003' },
    { adminId: 'admin-cz-004', password: '123456', stationId: 'CZ-004' },
    { adminId: 'admin-cz-005', password: '123456', stationId: 'CZ-005' },
    { adminId: 'admin-cz-006', password: '123456', stationId: 'CZ-006' },
    { adminId: 'admin-cz-007', password: '123456', stationId: 'CZ-007' },
    { adminId: 'admin-cz-008', password: '123456', stationId: 'CZ-008' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Set persistence to 'session' to only keep user logged in for the session.
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            handleSuccessfulAuth(firebaseUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
        setLoading(false);
      });
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
    await setPersistence(auth, browserSessionPersistence);
    const result = await signInWithPopup(auth, provider);
    handleSuccessfulAuth(result.user);
  };
  
  const registerWithEmail = async (email: string, pass: string) => {
    await setPersistence(auth, browserSessionPersistence);
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
    await setPersistence(auth, browserSessionPersistence);
    const result = await signInWithEmailAndPassword(auth, email, pass);
    handleSuccessfulAuth(result.user);
  }

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const adminLogin = async (adminId: string, pass: string) => {
    const creds = adminCredentials.find(c => c.adminId === adminId && c.password === pass);
    if (creds) {
      const station = chargers.find(c => c.id === creds.stationId);
      const demoAdmin: AdminUser = {
        id: creds.adminId,
        name: station?.name || 'Admin',
        stationId: creds.stationId,
        stationName: station?.name || 'Unknown Station'
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
