import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the user JWT with anon key
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Service role key — bypasses RLS completely
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not set in environment')
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    )

    // The DB trigger already created the row — just fetch it
    // If missing (edge case), insert it now
    const meta = user.user_metadata ?? {}
    const name = meta.full_name || meta.name || user.email?.split('@')[0] || null
    const referralCode = 'PP' + user.id.replace(/-/g, '').slice(0, 6).toUpperCase()

    const { data: profile } = await db
      .from('users')
      .upsert(
        {
          id: user.id,
          name,
          email: user.email ?? null,
          referral_code: referralCode,
          wallet_balance: 0,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      .select()
      .maybeSingle()

    if (profile) {
      // Patch null fields without overwriting existing data
      const patch: Record<string, unknown> = {}
      if (!profile.name && name) patch.name = name
      if (!profile.email && user.email) patch.email = user.email
      if (!profile.referral_code) patch.referral_code = referralCode

      if (Object.keys(patch).length > 0) {
        const { data: patched } = await db
          .from('users').update(patch).eq('id', user.id).select().maybeSingle()
        return NextResponse.json({ profile: patched ?? { ...profile, ...patch } })
      }
      return NextResponse.json({ profile })
    }

    // Upsert with ignoreDuplicates returns null for existing rows — fetch directly
    const { data: existing } = await db
      .from('users').select('*').eq('id', user.id).maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Patch missing fields
    const patch: Record<string, unknown> = {}
    if (!existing.name && name) patch.name = name
    if (!existing.email && user.email) patch.email = user.email
    if (!existing.referral_code) patch.referral_code = referralCode

    if (Object.keys(patch).length > 0) {
      const { data: patched } = await db
        .from('users').update(patch).eq('id', user.id).select().maybeSingle()
      return NextResponse.json({ profile: patched ?? { ...existing, ...patch } })
    }

    return NextResponse.json({ profile: existing })
  } catch (err) {
    console.error('Profile ensure error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
