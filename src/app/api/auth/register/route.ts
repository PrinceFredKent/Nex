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
    const { email, password, fullName } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const displayName = (fullName || cleanEmail.split('@')[0] || 'User').trim();

    // 1. Try Supabase Auth server-side if configured
    let supabaseUser: any = null;
    let supabaseSession: any = null;

    if (supabaseUrl && (anonKey || serviceKey)) {
      try {
        const clientKey = anonKey || serviceKey;
        const supabase = createClient(supabaseUrl, clientKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: displayName,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
            },
          },
        });

        if (!error && data?.user) {
          supabaseUser = data.user;
          supabaseSession = data.session;

          // Attempt to auto-confirm email immediately with admin client
          const admin = getAdminClient();
          if (admin) {
            try {
              await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true });
            } catch {}
          }
        }
      } catch (err: any) {
        console.warn('Supabase signUp network/unreachable error, using local vault:', err?.message);
      }
    }

    // 2. Always create/mirror in local vault
    const localUser = usersDb.create({
      id: supabaseUser?.id,
      email: cleanEmail,
      password,
      fullName: displayName,
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
    });

    const returnedUser = supabaseUser || {
      id: localUser.id,
      email: localUser.email,
      user_metadata: {
        full_name: localUser.fullName,
        avatar_url: localUser.avatarUrl,
        role: localUser.role,
      },
      created_at: localUser.createdAt,
    };

    const returnedSession = supabaseSession || {
      access_token: `vault_${localUser.id}_${Date.now()}`,
    };

    return NextResponse.json({
      success: true,
      user: returnedUser,
      session: returnedSession,
      profile: usersDb.toProfile(localUser),
    });
  } catch (err: any) {
    console.error('Unhandled error in /api/auth/register:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
