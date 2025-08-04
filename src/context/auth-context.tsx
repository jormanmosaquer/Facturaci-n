// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// For this prototype, we use sessionStorage to track the logged-in state.
// In a real application, you would use a secure, HTTP-only cookie
// managed by the server after a successful login.

interface AuthContextType {
  user: { email: string } | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, login: () => {}, logout: () => {} });

const SESSION_STORAGE_KEY = 'auth-user-email';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUserEmail = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUserEmail) {
        setUser({ email: storedUserEmail });
      }
    } catch (e) {
      console.error("Could not access sessionStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, email);
    setUser({ email });
    router.push('/');
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading || (!user && pathname !== '/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user && pathname === '/login') {
      router.push('/');
      return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      );
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
