import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const [authResult, { count: papers }] = await Promise.all([
      // Count all auth users (every registered account, even before profile setup)
      supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
      supabase.from('papers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])

    // admin.listUsers response includes `total` in the data object
    const students = (authResult.data as unknown as { total?: number })?.total
      ?? authResult.data?.users?.length
      ?? 0

    return NextResponse.json({ students, papers: papers ?? 0 })
  } catch {
    return NextResponse.json({ students: 0, papers: 0 })
  }
}
