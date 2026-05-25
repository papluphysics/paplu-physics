'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, Shield, Clock, Users, TrendingUp, ChevronDown, X, Send, MessageSquarePlus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
import { useLang } from '@/context/LangContext'
import { PAPERS } from '@/lib/papers'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const FAQS = [
  {
    q: 'How long is access valid after purchase?',
    qGu: 'ખરીદી પછી ઍક્સેસ કેટલા સમય માટે માન્ય છે?',
    a: 'Every purchased paper set stays active for 6 months from the date of purchase. You will see a countdown on your dashboard. After expiry, you can re-purchase at the same price.',
    aGu: 'દરેક ખરીદેલ પ્રશ્નપત્ર સેટ ખરીદીની તારીખથી ૬ મહિના સક્રિય રહે છે. સમાપ્ત થયા પછી, તમે એ જ કિંમતે ફરીથી ખરીદી શકો છો.',
  },
  {
    q: 'What is the ₹60 combo offer?',
    qGu: '₹60 કૉમ્બો ઑફર શું છે?',
    a: 'If you add any 3 paper sections to your cart together, the price automatically drops to ₹60 total — saving ₹15. Just add 3 items and the discount applies at checkout.',
    aGu: 'જો તમે કાર્ટમાં કોઈ પણ ૩ વિભાગ ઉમેરો, તો કુલ કિંમત આપોઆપ ₹60 થઈ જાય છે — ₹15 ની બચત.',
  },
  {
    q: 'Are the PDFs secure? Can they be shared?',
    qGu: 'PDFs સુરક્ષિત છે? તેમને શેર કરી શકાય?',
    a: 'Every PDF download has a unique invisible watermark tied to your account. Downloads use expiring secure links. Direct file sharing is against our terms and the watermark traces it back to the source.',
    aGu: 'દરેક PDF ડાઉનલોડ પર તમારા ખાતા સાથે જોડાયેલ અનન્ય અદ્રશ્ય વૉટરમાર્ક હોય છે.',
  },
  {
    q: 'How does the referral commission work?',
    qGu: 'રેફરલ કમિશન કેવી રીતે કામ કરે છે?',
    a: 'Share your unique referral link. When anyone purchases using your link, you earn 20% commission after Razorpay fees, credited to your wallet. Withdraw to UPI once balance reaches ₹15.',
    aGu: 'તમારી અનન્ય રેફરલ લિંક શેર કરો. Razorpay ફી પછી ૨૦% કમિશન તમારા વૉલેટમાં જમા થાય. ₹15 થતાં UPI માં ઉપાડ કરો.',
  },
  {
    q: 'What payment methods are accepted?',
    qGu: 'કઈ ચૂકવણી પદ્ધતિઓ સ્વીકારવામાં આવે છે?',
    a: 'We accept UPI, debit/credit cards, net banking, and all major wallets through Razorpay. Payments are 100% secure.',
    aGu: 'અમે Razorpay દ્વારા UPI, ડેબિટ/ક્રેડિટ કાર્ડ, નેટ બૅન્કિંગ અને વૉલેટ સ્વીકારીએ છીએ.',
  },
]

const FEATURES = [
  { icon: Shield, title: 'Secure PDFs', titleGu: 'સુરક્ષિત PDF', desc: 'Watermarked, expiring links, no sharing possible', descGu: 'વૉટરમાર્ક, એક્સ્પાઇરિંગ લિંક' },
  { icon: Clock, title: '6 Month Access', titleGu: '૬ મહિના ઍક્સેસ', desc: 'Full access for 6 months after purchase', descGu: 'ખરીદી પછી ૬ મહિના ઍક્સેસ' },
  { icon: Users, title: 'Referral Rewards', titleGu: 'રેફરલ પુરસ્કાર', desc: '20% commission on every referral purchase', descGu: 'દરેક રેફરલ ખરીદી પર ૨૦%' },
  { icon: TrendingUp, title: 'Expert Papers', titleGu: 'નિષ્ણાત પ્રશ્નપત્રો', desc: 'Crafted by experienced Gujarat Board teachers', descGu: 'અનુભવી શિક્ષકો દ્વારા તૈયાર' },
]

type Review = {
  id: string
  user_name: string
  city: string | null
  rating: number
  text: string
  created_at: string
}

// Animated count-up hook using requestAnimationFrame
function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === 0) return
    if (target === prevTarget.current) return
    prevTarget.current = target
    cancelAnimationFrame(rafRef.current)
    const startTime = performance.now()
    const startVal = count

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setCount(Math.round(startVal + ease * (target - startVal)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration]) // eslint-disable-line react-hooks/exhaustive-deps

  return count
}

// Format student count with milestones
function formatStudentCount(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000) * 1000}+`
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`
  return n.toString()
}

// Interactive star picker for the review form
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-125 focus:outline-none"
          aria-label={`${i} star`}
        >
          <Star
            size={26}
            fill={i <= (hovered || value) ? '#fbbf24' : 'none'}
            className={`transition-colors ${i <= (hovered || value) ? 'text-amber-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

export default function HomePage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [stats, setStats] = useState({ students: 0, papers: 0 })
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', rating: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)

  const trending = PAPERS.filter(p => p.popular)
  const gu = lang === 'gu'

  const animStudents = useCountUp(stats.students, 1800)
  const animPapers = useCountUp(stats.papers, 1200)

  // Fetch stats and poll every 30s for real-time updates
  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch top 4 reviews
  useEffect(() => {
    fetch('/api/reviews?limit=4')
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => setReviews([]))
  }, [])

  // Handle Google OAuth hash-based redirect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace('/dashboard')
      })
    }
  }, [router])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: form.name,
          city: form.city,
          rating: form.rating,
          text: form.text,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Review submitted! Thank you.')
        setShowModal(false)
        setForm({ name: '', city: '', rating: 5, text: '' })
        // Refresh reviews
        fetch('/api/reviews?limit=4')
          .then(r => r.json())
          .then(d => setReviews(d.reviews || []))
          .catch(() => {})
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setSubmitting(false)
  }

  const statItems = [
    { num: formatStudentCount(animStudents), label: gu ? 'વિદ્યાર્થીઓ' : t.studentsEnrolled, delay: 0.4 },
    { num: String(animPapers), label: gu ? 'પ્રશ્નપત્ર સેટ' : t.paperSets, delay: 0.5 },
    { num: '₹60', label: gu ? 'કોઈ પણ ૩ નો કૉમ્બો' : t.comboDeal, delay: 0.6 },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(18,100,240,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-brand-100 rounded-full text-xs font-semibold text-brand-600 shadow-sm mb-6">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
              {gu ? 'ગુજરાત બોર્ડ · ધોરણ ૧૦ અને ૧૨ વિજ્ઞાન' : 'Gujarat Board · Class 10 & 12 Science'}
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 max-w-3xl mx-auto leading-tight tracking-tight mb-5 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'સ્માર્ટ પ્રશ્નપત્રો સાથે' : 'Crack Your Exam with'}{' '}
              <span className="text-brand-500">{gu ? 'પરીક્ષામાં સફળ' : 'Smart Paper Sets'}</span>
            </h1>
            <p className={`text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/papers" className="btn-primary px-7 py-3.5 text-base flex items-center gap-2 justify-center">
                <span className={gu ? 'font-gujarati' : ''}>{t.browsePapers}</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-outline px-7 py-3.5 text-base flex items-center gap-2 justify-center">
                <span className={gu ? 'font-gujarati' : ''}>{gu ? 'ડૅમો જુઓ' : t.watchDemo}</span>
              </Link>
            </div>
          </motion.div>

          {/* ── Animated Stats ── */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {statItems.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 32, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: s.delay, duration: 0.55, type: 'spring', stiffness: 200, damping: 18 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm py-4 px-3 text-center relative overflow-hidden group"
              >
                {/* shimmer sweep on load */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ delay: s.delay + 0.3, duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-50/60 to-transparent pointer-events-none"
                />
                <motion.div
                  key={s.num}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.3 }}
                  className="font-display font-bold text-2xl text-gray-900 tabular-nums"
                >
                  {s.num}
                </motion.div>
                <div className={`text-xs text-gray-500 mt-1 ${gu ? 'font-gujarati' : ''}`}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY SUBJECT ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <p className="section-label">{gu ? 'વિષય પ્રમાણે' : 'Browse by Subject'}</p>
          <h2 className={`section-title mt-1 ${gu ? 'font-gujarati' : ''}`}>
            {gu ? 'વિષય પ્રમાણે શોધો' : 'Browse by Subject'}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { icon: '📐', label: gu ? 'ગણિત' : 'Mathematics', href: '/papers?subject=math&class=12', color: 'bg-blue-50 border-blue-100' },
            { icon: '⚛️', label: gu ? 'ભૌતિક વિજ્ઞાન' : 'Physics',     href: '/papers?subject=physics&class=12', color: 'bg-purple-50 border-purple-100' },
            { icon: '📋', label: gu ? 'ધોરણ ૧૦' : 'Class 10',         href: '/papers?class=10',   color: 'bg-green-50 border-green-100' },
            { icon: '🎯', label: gu ? 'JEE' : 'JEE Prep',             href: '/papers?cat=jee',    color: 'bg-amber-50 border-amber-100' },
            { icon: '🩺', label: gu ? 'NEET' : 'NEET Prep',           href: '/papers?cat=neet',   color: 'bg-rose-50 border-rose-100' },
            { icon: '🏛️', label: gu ? 'GUJCET' : 'GUJCET',           href: '/papers?cat=gujcet', color: 'bg-cyan-50 border-cyan-100' },
            { icon: '🏆', label: gu ? '૯૦%+ સ્કોર' : 'Above 90%',    href: '/papers?cat=90',     color: 'bg-indigo-50 border-indigo-100' },
            { icon: '✅', label: gu ? 'પાસ પૅકેજ' : 'Pass Package',   href: '/papers?cat=pass',   color: 'bg-emerald-50 border-emerald-100' },
          ].map(s => (
            <Link
              key={s.label}
              href={s.href}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${s.color} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{s.icon}</span>
              <span className={`text-sm font-semibold text-gray-700 text-center ${gu ? 'font-gujarati' : ''}`}>{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRENDING PAPERS ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label">{gu ? 'ટ્રેન્ડિંગ' : 'Trending'}</p>
              <h2 className={`section-title mt-1 ${gu ? 'font-gujarati' : ''}`}>{t.trending}</h2>
            </div>
            <Link href="/papers" className="text-sm text-brand-500 font-semibold hover:underline flex items-center gap-1">
              <span className={gu ? 'font-gujarati' : ''}>{t.viewAll}</span> <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map(p => <PaperCard key={p.id} paper={p} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="section-label">{gu ? 'શા માટે' : 'Why Paplu Physics'}</p>
          <h2 className={`section-title mt-1 ${gu ? 'font-gujarati' : ''}`}>
            {gu ? 'શા માટે Paplu Physics?' : 'Why choose us?'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                <f.icon size={20} className="text-brand-500" />
              </div>
              <h3 className={`font-display font-bold text-gray-900 text-sm mb-1.5 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? f.titleGu : f.title}
              </h3>
              <p className={`text-xs text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                {gu ? f.descGu : f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STUDENT REVIEWS ── */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-label">{gu ? 'વિદ્યાર્થીઓ શું કહે છે' : 'Student Reviews'}</p>
            <h2 className={`section-title mt-1 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'ગુજરાત ના વિદ્યાર્થીઓ' : 'Trusted by Gujarat students'}
            </h2>
          </div>

          {/* Loading skeleton */}
          {reviews === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-5 bg-white animate-pulse">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((__, j) => <div key={j} className="w-3 h-3 rounded-full bg-gray-100" />)}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                    <div className="h-3 bg-gray-100 rounded w-3/5" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-20" />
                      <div className="h-2.5 bg-gray-100 rounded w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {reviews !== null && reviews.length === 0 && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">⭐</div>
              <p className={`text-gray-600 font-medium mb-1 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'હજી સુધી કોઈ સમીક્ષા નથી' : 'No reviews yet'}
              </p>
              <p className={`text-sm text-gray-400 mb-6 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'સૌ પ્રથમ સમીક્ષા આપો!' : 'Be the first to share your experience!'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto"
              >
                <MessageSquarePlus size={16} />
                {gu ? 'સમીક્ષા લખો' : 'Write a Review'}
              </button>
            </div>
          )}

          {/* Reviews grid */}
          {reviews !== null && reviews.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {reviews.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="card p-5 bg-white"
                  >
                    <div className="flex text-amber-400 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={14} fill={j < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">
                      &ldquo;{r.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                        {r.user_name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.user_name}</p>
                        {r.city && <p className="text-xs text-gray-400 truncate">{r.city}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/reviews"
                  className="btn-outline px-6 py-3 flex items-center gap-2 justify-center"
                >
                  <span className={gu ? 'font-gujarati' : ''}>
                    {gu ? 'બધી સમીક્ષાઓ જુઓ' : 'See All Reviews'}
                  </span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary px-6 py-3 flex items-center gap-2 justify-center"
                >
                  <MessageSquarePlus size={16} />
                  <span className={gu ? 'font-gujarati' : ''}>
                    {gu ? 'સમીક્ષા લખો' : 'Write a Review'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="section-label">FAQ</p>
          <h2 className={`section-title mt-1 ${gu ? 'font-gujarati' : ''}`}>{t.faqTitle}</h2>
        </div>
        <div className="flex flex-col gap-2">
          {FAQS.map((f, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
              >
                <span className={`font-medium text-gray-800 text-sm ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? f.qGu : f.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className={`px-5 pb-4 text-sm text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? f.aGu : f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-brand-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className={`text-3xl font-display font-bold mb-3 ${gu ? 'font-gujarati' : ''}`}>
            {gu ? 'આજે જ શરૂ કરો' : 'Start preparing today'}
          </h2>
          <p className={`text-brand-100 mb-6 max-w-md mx-auto ${gu ? 'font-gujarati' : ''}`}>
            {gu ? 'માત્ર ₹25 માં પ્રીમિયમ પ્રશ્નપત્ર સેટ. ₹60 કૉમ્બો ઑફર સાથે.' : 'Premium paper sets from just ₹25. Grab the ₹60 combo deal.'}
          </p>
          <Link href="/papers" className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors">
            <span className={gu ? 'font-gujarati' : ''}>{t.browsePapers}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />

      {/* ── WRITE REVIEW MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className={`text-lg font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'તમારો અનુભવ શેર કરો' : 'Share Your Experience'}
                  </h3>
                  <p className={`text-xs text-gray-400 mt-0.5 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'તમારી સમીક્ષા અન્ય વિદ્યાર્થીઓને મદદ કરે છે' : 'Your review helps other students'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{gu ? 'નામ *' : 'Your Name *'}</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input"
                      placeholder={gu ? 'રાજ પટેલ' : 'Raj Patel'}
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">{gu ? 'શહેર' : 'City'}</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="input"
                      placeholder={gu ? 'અમદાવાદ' : 'Ahmedabad'}
                      maxLength={30}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{gu ? 'રેટિંગ *' : 'Rating *'}</label>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>

                <div>
                  <label className="label">{gu ? 'સમીક્ષા *' : 'Your Review *'}</label>
                  <textarea
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    className="input resize-none"
                    rows={4}
                    placeholder={gu ? 'Paplu Physics કેવી રીતે મદદ કરી...' : 'Share how Paplu Physics helped you prepare...'}
                    minLength={10}
                    maxLength={500}
                    required
                  />
                  <p className={`text-xs mt-1 ${form.text.length < 10 ? 'text-gray-400' : 'text-gray-400'}`}>
                    {form.text.length}/500
                    {form.text.length > 0 && form.text.length < 10 && (
                      <span className="text-rose-400 ml-2">{gu ? 'ઓછામાં ઓછા ૧૦ અક્ષર' : `${10 - form.text.length} more characters needed`}</span>
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.name.trim() || form.text.trim().length < 10}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className={gu ? 'font-gujarati' : ''}>{gu ? 'સબમિટ...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span className={gu ? 'font-gujarati' : ''}>{gu ? 'સમીક્ષા સબમિટ કરો' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
