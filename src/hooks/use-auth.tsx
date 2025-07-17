
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUserProfile: (updates: { displayName?: string }) => Promise<void>;
  isImpersonating: boolean;
  impersonateUser: (email: string, displayName: string) => void;
  revertImpersonation: () => void;
  reauthenticate: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!impersonatingUser) {
        setUser(currentUser);
        setOriginalUser(currentUser);
      }
      setLoading(false);
    });

    const timer = setTimeout(() => {
        if (loading) {
            setLoading(false);
        }
    }, 3000); 

    return () => {
        unsubscribe();
        clearTimeout(timer);
    };
  }, [impersonatingUser, loading]);
  
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear session storage on logout
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("admin-auth-verified");
      }
      setImpersonatingUser(null);
      setOriginalUser(null);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const reauthenticate = async (password: string): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return false;
    }
    
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
        await reauthenticateWithCredential(currentUser, credential);
        return true;
    } catch (error) {
        console.error("Reauthentication failed:", error);
        return false;
    }
  };

  const updateUserProfile = async (updates: { displayName?: string }) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        // Manually update the user state to reflect changes immediately
        setUser({ ...auth.currentUser });
        if(originalUser && auth.currentUser.uid === originalUser.uid) {
            setOriginalUser({ ...auth.currentUser });
        }
        window.dispatchEvent(new Event('authChanged')); // Notify components
    }
  };

  const impersonateUser = (email: string, displayName: string) => {
    if (originalUser && originalUser.email === "europeueditor@gmail.com") {
        const fakeUser = {
            ...originalUser,
            email: email,
            displayName: displayName,
        } as User;
        
        setImpersonatingUser(fakeUser);
        setUser(fakeUser);
    }
  };

  const revertImpersonation = () => {
    if (originalUser) {
        setImpersonatingUser(null);
        setUser(originalUser);
        router.push('/admin/super');
    }
  };


  const value = {
    user,
    loading,
    logout,
    updateUserProfile,
    isImpersonating: !!impersonatingUser,
    impersonateUser,
    revertImpersonation,
    reauthenticate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
