import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const mobile: string  = (body.mobile  ?? '').trim()
    const state:  string  = (body.state   ?? '').trim()
    const district: string = (body.district ?? '').trim()
    const city:   string  = (body.city    ?? '').trim()

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Valid 10-digit mobile required' }, { status: 400 })
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const patch: Record<string, string | null> = { mobile }
    if (state)    patch.state    = state
    if (district) patch.district = district
    if (city)     patch.city     = city

    const { error } = await db.from('users').update(patch).eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact update error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
