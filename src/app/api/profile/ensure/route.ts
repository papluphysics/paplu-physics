import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function makeReferralCode(userId: string): string {
  return 'PP' + userId.replace(/-/g, '').slice(0, 6).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the user's JWT
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: { user } } = await anonClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Service role bypasses RLS entirely
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const meta = user.user_metadata ?? {}
    const nameFromAuth = meta.full_name || meta.name || null
    const emailFromAuth = user.email ?? null
    const referralCode = makeReferralCode(user.id)

    // Fetch existing profile
    const { data: existing } = await db
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      // Patch any null fields without overwriting good data
      const patch: Record<string, string> = {}
      if (!existing.name && nameFromAuth) patch.name = nameFromAuth
      if (!existing.email && emailFromAuth) patch.email = emailFromAuth
      if (!existing.referral_code) patch.referral_code = referralCode

      if (Object.keys(patch).length > 0) {
        const { data: patched } = await db
          .from('users')
          .update(patch)
          .eq('id', user.id)
          .select()
          .maybeSingle()
        return NextResponse.json({ profile: patched ?? { ...existing, ...patch } })
      }
      return NextResponse.json({ profile: existing })
    }

    // Create new profile row
    const { data: created } = await db
      .from('users')
      .insert({
        id: user.id,
        name: nameFromAuth,
        mobile: user.phone ?? null,
        email: emailFromAuth,
        referral_code: referralCode,
      })
      .select()
      .maybeSingle()

    return NextResponse.json({ profile: created })
  } catch (err) {
    console.error('Profile ensure error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
