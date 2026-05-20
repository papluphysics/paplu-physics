import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const [{ count: students }, { count: papers }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('papers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])
    return NextResponse.json({ students: students ?? 0, papers: papers ?? 0 })
  } catch {
    return NextResponse.json({ students: 0, papers: 0 })
  }
}
