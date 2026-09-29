import { NextRequest, NextResponse } from 'next/server';
import { usersDb } from '@/lib/users';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (userId) {
      const user = usersDb.findById(userId);
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              full_name: user.fullName,
              avatar_url: user.avatarUrl,
              role: user.role,
            },
            created_at: user.createdAt,
          },
          profile: usersDb.toProfile(user),
        });
      }
    }

    if (email) {
      const user = usersDb.findByEmail(email);
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              full_name: user.fullName,
              avatar_url: user.avatarUrl,
              role: user.role,
            },
            created_at: user.createdAt,
          },
          profile: usersDb.toProfile(user),
        });
      }
    }

    return NextResponse.json({ success: false, user: null, profile: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
