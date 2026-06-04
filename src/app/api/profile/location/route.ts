import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const state: string | undefined = body.state?.trim()
    if (!state) return NextResponse.json({ error: 'state is required' }, { status: 400 })
    const district: string | null = body.district?.trim() || null
    const city: string | null = body.city?.trim() || null

    // Verify the Supabase JWT
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Update location via service role (bypasses RLS "users see own row" policy)
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: profile, error } = await db
      .from('users')
      .update({ state, district, city })
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Location update error:', error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Location route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
