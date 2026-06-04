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

export default function AdCarousel() {
  const [ads,     setAds]     = useState<Ad[]>([])
  const [index,   setIndex]   = useState(0)
  const [paused,  setPaused]  = useState(false)
  const [loaded,  setLoaded]  = useState(false)
  const reducedMotion = useReducedMotion()

  // Touch-swipe state
  const touchStartX  = useRef<number | null>(null)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch ads on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const headers: Record<string, string> = {}
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
        const res  = await fetch('/api/ads', { headers })
        const json = await res.json()
        if (!cancelled && Array.isArray(json.ads)) {
          setAds(json.ads)
          setLoaded(true)
        }
      } catch {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const total = ads.length

  const next = useCallback(() => setIndex(i => (i + 1) % total), [total])
  const prev = useCallback(() => setIndex(i => (i - 1 + total) % total), [total])

  // Auto-advance (disabled when paused, reduced-motion, or 1 slide)
  useEffect(() => {
    if (reducedMotion || paused || total <= 1) return
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, paused, reducedMotion, total, next])

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  // Don't render until fetch is done (avoids flash)
  if (!loaded || total === 0) return null

  const ad = ads[index]

  return (
    <section
      aria-label="Promotions"
      className="w-full bg-white"
    >
      <div
        className="relative overflow-hidden shadow-sm select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Slide ── */}
        <div className="relative w-full aspect-[3.5/1] min-h-[80px] bg-gray-100">
          {ad.link_url ? (
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full" aria-label={ad.title ?? 'Promotion'}>
              <SlideImage ad={ad} reducedMotion={reducedMotion} index={index} />
            </a>
          ) : (
            <SlideImage ad={ad} reducedMotion={reducedMotion} index={index} />
          )}

          {/* Title overlay */}
          {ad.title && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
              <p className="text-white text-sm font-semibold drop-shadow truncate">{ad.title}</p>
            </div>
          )}

          {/* Prev / Next arrows — only if more than one ad */}
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

// Separate component so Next.js Image lazy-loads per slide
function SlideImage({ ad, reducedMotion, index }: { ad: Ad; reducedMotion: boolean; index: number }) {
  return (
    <Image
      key={`${ad.id}-${index}`}
      src={ad.image_url}
      alt={ad.title ?? 'Promotion'}
      fill
      sizes="100vw"
      className={`object-cover ${reducedMotion ? '' : 'transition-opacity duration-500'}`}
      priority={index === 0}
      loading={index === 0 ? 'eager' : 'lazy'}
    />
  )
}
