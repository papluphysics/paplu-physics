import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Run this SQL in Supabase SQL Editor to enable demo papers:
// create table if not exists demo_papers (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   title_gu text,
//   description text,
//   description_gu text,
//   subject text not null default 'general',
//   class_level text not null default '10',
//   pdf_url text not null,
//   is_active boolean not null default true,
//   created_at timestamptz not null default now()
// );

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('demo_papers')
      .select('id, title, title_gu, description, description_gu, subject, class_level, pdf_url, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ data: [] })
    return NextResponse.json({ data: data || [] })
  } catch {
    return NextResponse.json({ data: [] })
  }
}
