import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const status = searchParams.get('status') || undefined;

    const movies = await db.getAll({ type, genre, search, sort, status });
    return NextResponse.json({ success: true, count: movies.length, data: movies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.type) {
      return NextResponse.json({ success: false, error: 'Title and type are required' }, { status: 400 });
    }

    const created = await db.create(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('all') === 'true') {
      await db.clearAll();
      return NextResponse.json({ success: true, message: 'All media items deleted successfully' });
    }
    return NextResponse.json({ success: false, error: 'Parameter all=true is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
