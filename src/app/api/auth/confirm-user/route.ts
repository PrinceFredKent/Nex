import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getAdminClient = () => {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = getAdminClient();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin service key is not configured.' },
        { status: 500 }
      );
    }

    // Find the user by email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ success: false, error: listError.message }, { status: 500 });
    }

    const user = users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: `No user found with email ${cleanEmail}` },
        { status: 404 }
      );
    }

    // Confirm the email for this user
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${cleanEmail} has been confirmed successfully.`,
      userId: user.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to confirm user' },
      { status: 500 }
    );
  }
}
