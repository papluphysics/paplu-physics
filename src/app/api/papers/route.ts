import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const db = createServerClient()
  const { data, error } = await db
    .from('papers')
    .select('id, title_en, title_gu, description_en, description_gu, price, paper_count, is_popular, categories(section, subject, class_level)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ data: [] })

  const papers = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title_en,
    titleGu: p.title_gu || p.title_en,
    description: p.description_en || '',
    descriptionGu: p.description_gu || p.description_en || '',
    category: p.categories?.section || 'board',
    subject: p.categories?.subject || 'general',
    classLevel: p.categories?.class_level || '10',
    paperCount: p.paper_count || 1,
    price: p.price || 25,
    popular: p.is_popular || false,
  }))

  return NextResponse.json({ data: papers })
}
