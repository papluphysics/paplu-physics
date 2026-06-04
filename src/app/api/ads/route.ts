import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { REGION_BY_DISTRICT } from '@/lib/locationData'

type Ad = {
  id: string
  image_url: string
  title: string | null
  link_url: string | null
  target_state: string | null
  target_district: string | null
  target_city: string | null
  region: string | null
  expiry_date: string
  is_active: boolean
  priority: number
  created_at: string
}

function adTier(
  ad: Ad,
  userCity: string | null,
  userDistrict: string | null,
  userRegion: string | null,
  userState: string | null,
): number {
  if (ad.target_city && ad.target_city === userCity) return 1
  if (ad.target_district && ad.target_district === userDistrict) return 2
  if (ad.region && userRegion && ad.region === userRegion) return 3
  if (ad.target_state && ad.target_state === userState) return 4
  return 5 // national / no location
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10)

    let userState: string | null = null
    let userDistrict: string | null = null
    let userCity: string | null = null
    let userRegion: string | null = null

    // Resolve the logged-in student's location from their profile
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (token) {
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      )
      const { data: { user } } = await anonClient.auth.getUser(token)
      if (user) {
        const db = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        )
        const { data: profile } = await db
          .from('users')
          .select('state, district, city')
          .eq('id', user.id)
          .maybeSingle()
        if (profile) {
          userState    = profile.state    ?? null
          userDistrict = profile.district ?? null
          userCity     = profile.city     ?? null
          if (userDistrict) userRegion = REGION_BY_DISTRICT[userDistrict] ?? null
        }
      }
    }

    // Use the service-role client so the query is NOT subject to RLS expiry
    // filter (we apply it manually below, which is equivalent but lets us
    // bypass the anon key's RLS performance overhead).
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    let query = db
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .gte('expiry_date', today)

    if (userState) {
      // Logged-in student: show ads for their state OR national ads (null state)
      query = query.or(`target_state.eq.${userState},target_state.is.null`)
    } else {
      // Logged-out / no location: national ads only
      query = query.is('target_state', null)
    }

    const { data: ads, error } = await query

    if (error) {
      console.error('Ads query error:', error)
      return NextResponse.json({ ads: [] })
    }
    if (!ads || ads.length === 0) return NextResponse.json({ ads: [] })

    // Tier-sort: city > district > region > state > national
    // Within the same tier: higher priority first, then newest first
    const sorted = (ads as Ad[]).slice().sort((a, b) => {
      const tA = adTier(a, userCity, userDistrict, userRegion, userState)
      const tB = adTier(b, userCity, userDistrict, userRegion, userState)
      if (tA !== tB) return tA - tB
      if (b.priority !== a.priority) return b.priority - a.priority
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({ ads: sorted })
  } catch (err) {
    console.error('Ads route error:', err)
    return NextResponse.json({ ads: [] })
  }
}
