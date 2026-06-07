// Server Component — no 'use client'.
// Fetches initial national ads from Supabase at request time so the first ad
// is already in the HTML payload; AdCarousel renders immediately with no
// client-side useEffect delay or layout shift.
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import AdCarousel from '@/components/AdCarousel'
import HomeClient from '@/components/HomeClient'

type InitialAd = {
  id: string
  image_url: string
  title: string | null
  link_url: string | null
}

async function getInitialAds(): Promise<InitialAd[]> {
  try {
    const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return []

    const db    = createClient(url, serviceKey, { auth: { persistSession: false } })
    const today = new Date().toISOString().slice(0, 10)

    const { data } = await db
      .from('ads')
      .select('id, image_url, title, link_url')
      .eq('is_active', true)
      .gte('expiry_date', today)
      .is('target_state', null)          // national ads only — no auth required
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    return (data ?? []) as InitialAd[]
  } catch {
    return []
  }
}

export default async function Page() {
  const initialAds = await getInitialAds()

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      {/* initialAds are server-fetched national ads; AdCarousel shows them
          immediately on first paint, then quietly re-fetches with the user's
          auth token after hydration to swap in location-targeted ads.        */}
      <AdCarousel initialAds={initialAds} />
      <HomeClient />
    </div>
  )
}
