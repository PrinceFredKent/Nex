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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to construct profile object from authenticated Supabase user
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
          console.error('Error connecting to Supabase Auth:', e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase authentication is not configured. Please check your environment variables.' };
    }

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
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: string; user?: any }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase authentication is not configured. Please check your environment variables.' };
    }

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
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error during signOut:', e);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: { fullName?: string; avatarUrl?: string }): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      return { error: 'You must be signed in to update your profile.' };
    }

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
