'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Ad = {
  id: string
  image_url: string
  title: string | null
  link_url: string | null
}

const AUTO_ADVANCE_MS = 10_000

// 1×1 neutral gray pixel — used as blur placeholder while images decode
const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

type Props = {
  // Server-prefetched national ads: renders on first paint, no layout shift.
  // After hydration the component quietly re-fetches with the user's auth
  // token so location-targeted ads replace the national ones if better matches
  // exist — all carousel behaviour (10s, swipe, arrows, dots) stays the same.
  initialAds?: Ad[]
}

export default function AdCarousel({ initialAds = [] }: Props) {
  const [ads,    setAds]    = useState<Ad[]>(initialAds)
  const [index,  setIndex]  = useState(0)
  const [paused, setPaused] = useState(false)
  // If we received server-prefetched ads, we're "loaded" immediately.
  const [loaded, setLoaded] = useState(initialAds.length > 0)
  const reducedMotion = useReducedMotion()

  const touchStartX = useRef<number | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // After hydration: if the user is authenticated, re-fetch with their token
  // so location-targeted ads replace the national initial ones when available.
  // Unauthenticated visitors keep the server-prefetched national ads as-is.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          // Not logged in — national ads from SSR are final.
          if (!cancelled) setLoaded(true)
          return
        }

        // Logged-in: swap in location-targeted ads if the server finds any.
        const res  = await fetch('/api/ads', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const json = await res.json()
        if (!cancelled && Array.isArray(json.ads) && json.ads.length > 0) {
          setAds(json.ads)
          setIndex(0)
        }
      } catch {
        // Keep whatever ads we already have; never get stuck loading.
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const total = ads.length

  const next = useCallback(() => setIndex(i => (i + 1) % total), [total])
  const prev = useCallback(() => setIndex(i => (i - 1 + total) % total), [total])

  // Auto-advance — respects hover-pause and prefers-reduced-motion.
  useEffect(() => {
    if (reducedMotion || paused || total <= 1) return
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, paused, reducedMotion, total, next])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  // ── Skeleton: height is reserved via aspect-ratio so the page doesn't
  //    jump when the carousel appears (prevents CLS). Only shown when we
  //    have NO server-prefetched ads and are still waiting for the
  //    client-side fetch to complete.
  if (!loaded) {
    return (
      <div
        aria-hidden="true"
        className="w-full bg-slate-100"
        style={{ aspectRatio: '3.5 / 1', minHeight: '80px' }}
      >
        <div className="w-full h-full animate-pulse bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
      </div>
    )
  }

  // Hide entirely when there are no ads to show.
  if (total === 0) return null

  const ad = ads[index]

  return (
    <section aria-label="Promotions" className="w-full bg-white">
      <div
        className="relative overflow-hidden shadow-sm select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Slide ── */}
        <div
          className="relative w-full bg-slate-100"
          style={{ aspectRatio: '3.5 / 1', minHeight: '80px' }}
        >
          {ad.link_url ? (
            <a
              href={ad.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
              aria-label={ad.title ?? 'Promotion'}
            >
              <SlideImage ad={ad} isFirst={index === 0} />
            </a>
          ) : (
            <SlideImage ad={ad} isFirst={index === 0} />
          )}

          {ad.title && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
              <p className="text-white text-sm font-semibold drop-shadow truncate">{ad.title}</p>
            </div>
          )}

          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-700 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label="Previous ad"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-700 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label="Next ad"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* ── Dot indicators ── */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 py-2 bg-white">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  i === index
                    ? 'w-5 h-1.5 bg-brand-500'
                    : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to ad ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Separate component so each slide gets its own Image lifecycle.
// priority=true on the first slide tells Next.js to add a <link rel="preload">
// so it loads in parallel with the page HTML — essentially "above the fold" loading.
function SlideImage({ ad, isFirst }: { ad: Ad; isFirst: boolean }) {
  return (
    <Image
      key={ad.id}
      src={ad.image_url}
      alt={ad.title ?? 'Promotion'}
      fill
      sizes="100vw"
      className="object-cover"
      priority={isFirst}
      loading={isFirst ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
    />
  )
}
