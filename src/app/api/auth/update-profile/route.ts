import { NextRequest, NextResponse } from 'next/server';
import { usersDb } from '@/lib/users';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, avatarUrl } = await req.json();

    let targetUser = userId ? usersDb.findById(userId) : null;
    if (!targetUser && email) {
      targetUser = usersDb.findByEmail(email);
    }

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updated = usersDb.update(targetUser.id, {
      fullName,
      avatarUrl,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: usersDb.toProfile(updated),
      user: {
        id: updated.id,
        email: updated.email,
        user_metadata: {
          full_name: updated.fullName,
          avatar_url: updated.avatarUrl,
          role: updated.role,
        },
        created_at: updated.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
