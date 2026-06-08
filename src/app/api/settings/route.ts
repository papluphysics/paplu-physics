import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createServerClient()
    const { data } = await db.from('settings').select('key, value')
    const map: Record<string, string | null> = {}
    for (const row of data || []) map[row.key] = row.value
    return NextResponse.json({ data: map })
  } catch {
    return NextResponse.json({ data: {} })
  }
}
