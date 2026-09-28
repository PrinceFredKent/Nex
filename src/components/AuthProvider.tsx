'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; user?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'nex_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to construct profile object from user
  const buildProfile = (supabaseUser: User | null): UserProfile | null => {
    if (!supabaseUser) return null;
    const metadata = supabaseUser.user_metadata || {};
    const email = supabaseUser.email || '';
    const isFirstUser = email.toLowerCase().includes('admin') || metadata.role === 'admin';

    return {
      id: supabaseUser.id,
      email: email,
      fullName: metadata.full_name || metadata.name || email.split('@')[0] || 'User',
      avatarUrl: metadata.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supabaseUser.id)}`,
      role: isFirstUser ? 'admin' : (metadata.role || 'user'),
      createdAt: supabaseUser.created_at,
    };
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            setProfile(buildProfile(initialSession?.user ?? null));
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, currentSession) => {
              if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setProfile(buildProfile(currentSession?.user ?? null));
              }
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        } catch (e) {
          console.error('Error initializing Supabase Auth:', e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        // Local mode fallback
        try {
          const savedLocalUser = localStorage.getItem(LOCAL_USER_KEY);
          if (savedLocalUser) {
            const parsed = JSON.parse(savedLocalUser);
            setProfile(parsed);
            setUser({ id: parsed.id, email: parsed.email, user_metadata: { full_name: parsed.fullName } } as any);
          }
        } catch (e) {
          console.error('Error reading local auth user:', e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };
        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          setProfile(buildProfile(data.user));
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || 'Failed to sign in' };
      }
    } else {
      // Local demo mode sign in
      const mockUser: UserProfile = {
        id: 'local-' + Date.now(),
        email,
        fullName: email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };
      setProfile(mockUser);
      setUser({ id: mockUser.id, email: mockUser.email, user_metadata: { full_name: mockUser.fullName } } as any);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      return {};
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: string; user?: any }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
            },
          },
        });
        if (error) return { error: error.message };
        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          setProfile(buildProfile(data.user));
        }
        return { user: data.user };
      } catch (err: any) {
        return { error: err?.message || 'Failed to register account' };
      }
    } else {
      // Local demo mode sign up
      const mockUser: UserProfile = {
        id: 'local-' + Date.now(),
        email,
        fullName,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };
      setProfile(mockUser);
      setUser({ id: mockUser.id, email: mockUser.email, user_metadata: { full_name: mockUser.fullName } } as any);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      return { user: mockUser };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: { fullName?: string; avatarUrl?: string }): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data: updated, error } = await supabase.auth.updateUser({
          data: {
            full_name: data.fullName,
            avatar_url: data.avatarUrl,
          },
        });
        if (error) return { error: error.message };
        if (updated.user) {
          setUser(updated.user);
          setProfile(buildProfile(updated.user));
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || 'Failed to update profile' };
      }
    } else if (profile) {
      const updated: UserProfile = {
        ...profile,
        fullName: data.fullName || profile.fullName,
        avatarUrl: data.avatarUrl || profile.avatarUrl,
      };
      setProfile(updated);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      return {};
    }
    return { error: 'Not authenticated' };
  };

  const isAdmin = profile?.role === 'admin' || Boolean(profile?.email?.toLowerCase().includes('admin'));

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
