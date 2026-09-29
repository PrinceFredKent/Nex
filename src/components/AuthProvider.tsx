'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
    [key: string]: any;
  };
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  expires_at?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; notice?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; user?: any; notice?: string }>;
  confirmEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'nex_auth_user',
  PROFILE: 'nex_auth_profile',
  SESSION: 'nex_auth_session',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage immediately to prevent UI flicker
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (storedUser && storedProfile) {
        const parsedUser = JSON.parse(storedUser);
        const parsedProfile = JSON.parse(storedProfile);
        const parsedSession = storedSession ? JSON.parse(storedSession) : null;

        setUser(parsedUser);
        setProfile(parsedProfile);
        setSession(parsedSession);

        // Background session verification without blocking UI
        fetch(`/api/auth/session?userId=${encodeURIComponent(parsedUser.id)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.profile) {
              setProfile(data.profile);
              localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
            }
          })
          .catch(() => {
            // Silently retain cached local session
          });
      }
    } catch (e) {
      console.warn('Failed to load local auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthData = (newUser: AuthUser | null, newProfile: UserProfile | null, newSession: AuthSession | null) => {
    setUser(newUser);
    setProfile(newProfile);
    setSession(newSession);

    try {
      if (newUser && newProfile) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
        if (newSession) {
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.warn('Failed to persist auth data to localStorage:', e);
    }
  };

  const confirmEmail = async (userEmail: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/confirm-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to confirm email' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Connection error while confirming email.' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string; notice?: string }> => {
    try {
      // Direct same-origin call to Next.js API server - 100% immune to CORS
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        return { error: json.error || 'Invalid email or password. Please try again.' };
      }

      saveAuthData(json.user, json.profile, json.session);
      return { notice: json.notice };
    } catch (err: any) {
      console.error('Sign-in error:', err);
      return {
        error: 'Unable to reach the authentication service. Please check your network connection.',
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error?: string; user?: any; notice?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        return { error: json.error || 'Failed to create account. Please try again.' };
      }

      saveAuthData(json.user, json.profile, json.session);
      return { user: json.user, notice: json.notice };
    } catch (err: any) {
      console.error('Sign-up error:', err);
      return {
        error: 'Unable to reach the authentication service. Please check your network connection.',
      };
    }
  };

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      saveAuthData(null, null, null);
    }
  }, []);

  const updateProfile = async (data: { fullName?: string; avatarUrl?: string }): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'You must be signed in to update your profile.' };
    }

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        return { error: json.error || 'Failed to update profile' };
      }

      if (json.profile) {
        setProfile(json.profile);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(json.profile));
      }
      if (json.user) {
        setUser(json.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(json.user));
      }

      return {};
    } catch (err: any) {
      return { error: 'Unable to save profile changes. Please try again.' };
    }
  };

  const isAdmin =
    profile?.role === 'admin' ||
    Boolean(profile?.email?.toLowerCase().includes('admin')) ||
    Boolean(user?.email?.toLowerCase().includes('admin')) ||
    user?.email?.toLowerCase() === 'taxwiseplatform@gmail.com' ||
    user?.email?.toLowerCase() === 'princefredkent@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        confirmEmail,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
