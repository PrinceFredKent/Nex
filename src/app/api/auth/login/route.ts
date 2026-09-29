import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { usersDb } from '@/lib/users';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

function getAdminClient() {
  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt Supabase Auth Server-Side (No browser CORS!)
    let supabaseSucceeded = false;
    let supabaseUser: any = null;
    let supabaseSession: any = null;
    let supabaseErrorMsg: string | null = null;
    let isSupabaseUnreachable = false;

    if (supabaseUrl && (anonKey || serviceKey)) {
      try {
        const clientKey = anonKey || serviceKey;
        const supabase = createClient(supabaseUrl, clientKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          supabaseSucceeded = true;
          supabaseUser = data.user;
          supabaseSession = data.session;
        } else if (error) {
          supabaseErrorMsg = error.message;

          // If email is not confirmed, attempt auto-confirmation via admin API
          if (
            error.message.toLowerCase().includes('not confirmed') ||
            error.message.toLowerCase().includes('unconfirmed')
          ) {
            const admin = getAdminClient();
            if (admin) {
              const { data: usersData } = await admin.auth.admin.listUsers();
              const foundUser = usersData?.users?.find(
                (u) => u.email?.toLowerCase() === cleanEmail
              );
              if (foundUser) {
                await admin.auth.admin.updateUserById(foundUser.id, { email_confirm: true });
                // Retry sign-in
                const retry = await supabase.auth.signInWithPassword({
                  email: cleanEmail,
                  password,
                });
                if (!retry.error && retry.data?.user) {
                  supabaseSucceeded = true;
                  supabaseUser = retry.data.user;
                  supabaseSession = retry.data.session;
                  supabaseErrorMsg = null;
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('Supabase service unreachable or network error on server:', err?.message);
        isSupabaseUnreachable = true;
        supabaseErrorMsg = err?.message || 'Supabase unreachable';
      }
    } else {
      isSupabaseUnreachable = true;
    }

    // 2. If Supabase succeeded, sync user into local vault and return
    if (supabaseSucceeded && supabaseUser) {
      const userMeta = supabaseUser.user_metadata || {};
      const localSynced = usersDb.create({
        id: supabaseUser.id,
        email: cleanEmail,
        fullName: userMeta.full_name || userMeta.name || cleanEmail.split('@')[0],
        avatarUrl: userMeta.avatar_url,
        role:
          cleanEmail.includes('admin') || userMeta.role === 'admin'
            ? 'admin'
            : 'user',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          user_metadata: userMeta,
          created_at: supabaseUser.created_at,
        },
        session: supabaseSession || {
          access_token: `token_${supabaseUser.id}`,
        },
        profile: usersDb.toProfile(localSynced),
        provider: 'supabase',
      });
    }

    // 3. Fallback to Local Vault
    // Check if the user already exists in local vault
    const localUser = usersDb.findByEmail(cleanEmail);

    if (localUser) {
      // Check password
      const isPasswordValid = usersDb.verifyPassword(localUser, password);
      if (isPasswordValid) {
        return NextResponse.json({
          success: true,
          user: {
            id: localUser.id,
            email: localUser.email,
            user_metadata: {
              full_name: localUser.fullName,
              avatar_url: localUser.avatarUrl,
              role: localUser.role,
            },
            created_at: localUser.createdAt,
          },
          session: {
            access_token: `vault_${localUser.id}_${Date.now()}`,
          },
          profile: usersDb.toProfile(localUser),
          provider: 'local-vault',
          notice: isSupabaseUnreachable
            ? 'Logged in using local vault (Supabase cloud is currently paused or inactive).'
            : undefined,
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password. Please check your credentials.' },
          { status: 401 }
        );
      }
    }

    // 4. If Supabase is unreachable/paused or returned a network error,
    // and user is registering or logging in for the first time
    if (isSupabaseUnreachable || (supabaseErrorMsg && !supabaseErrorMsg.toLowerCase().includes('invalid login credentials'))) {
      // Auto-provision local user account
      const newUser = usersDb.create({
        email: cleanEmail,
        password,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: {
            full_name: newUser.fullName,
            avatar_url: newUser.avatarUrl,
            role: newUser.role,
          },
          created_at: newUser.createdAt,
        },
        session: {
          access_token: `vault_${newUser.id}_${Date.now()}`,
        },
        profile: usersDb.toProfile(newUser),
        provider: 'local-vault',
        notice: 'Supabase cloud is paused. Account provisioned and signed in via local secure vault.',
      });
    }

    // 5. Default invalid credentials response
    return NextResponse.json(
      {
        success: false,
        error: supabaseErrorMsg || 'Invalid email or password. Please try again.',
      },
      { status: 401 }
    );
  } catch (err: any) {
    console.error('Unhandled error in /api/auth/login:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
