import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // 1. Authenticate the buyer — must be logged in to use a referral code
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'You must be logged in to use a referral code' }, { status: 401 })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 })

  const { code } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: 'No referral code provided' }, { status: 400 })

  const db = createServerClient()

  // 2. Look up the referral code in the users table
  const { data: referrer, error: lookupError } = await db
    .from('users')
    .select('id, name')
    .eq('referral_code', code.toUpperCase().trim())
    .single()

  if (lookupError || !referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
  }

  // 3. Prevent self-referral — cannot use your own code
  if (referrer.id === user.id) {
    return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 })
  }

  // 4. Prevent duplicate use — buyer can only benefit from a referral code once
  const { count } = await db
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referred_id', user.id)
    .eq('status', 'completed')

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'You have already used a referral code before' }, { status: 400 })
  }

  // Return referrer's first name only (privacy)
  const referrerFirstName = referrer.name
    ? referrer.name.trim().split(/\s+/)[0]
    : 'a friend'

  return NextResponse.json({
    valid: true,
    referrerId: referrer.id,
    referrerName: referrerFirstName,
    discount: 10,
  })
}
