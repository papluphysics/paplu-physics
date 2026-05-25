import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Run this SQL in Supabase SQL Editor before using reviews:
// create table if not exists reviews (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid,
//   user_name text not null,
//   city text,
//   rating integer not null default 5 check (rating >= 1 and rating <= 5),
//   text text not null check (length(text) >= 10 and length(text) <= 500),
//   approved boolean not null default true,
//   created_at timestamptz not null default now()
// );
// create index on reviews (approved, created_at desc);

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  const limitParam = parseInt(searchParams.get('limit') || '4')

  try {
    const supabase = createServerClient()
    let query = supabase
      .from('reviews')
      .select('id, user_name, city, rating, text, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (!all) {
      query = query.limit(limitParam)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ reviews: [] })
    return NextResponse.json({ reviews: data || [] })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_name, city, rating, text, user_id } = body

    if (!user_name?.trim() || !text?.trim()) {
      return NextResponse.json({ error: 'Name and review are required' }, { status: 400 })
    }
    if (text.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 })
    }
    if (text.trim().length > 500) {
      return NextResponse.json({ error: 'Review must be under 500 characters' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase.from('reviews').insert({
      user_name: user_name.trim().slice(0, 50),
      city: city?.trim().slice(0, 30) || null,
      rating: Math.min(5, Math.max(1, parseInt(String(rating)) || 5)),
      text: text.trim(),
      user_id: user_id || null,
      approved: true,
    })

    if (error) {
      // Table not created yet — guide the admin
      if (error.code === '42P01') {
        return NextResponse.json({
          error: 'Reviews table not set up. Please run the SQL from DEPLOYMENT.md Step 2.1 in your Supabase dashboard.',
        }, { status: 503 })
      }
      console.error('Review insert error:', error)
      return NextResponse.json({ error: 'Failed to submit review. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
