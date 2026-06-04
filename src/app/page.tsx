'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Star, Shield, Clock, Users, TrendingUp,
  ChevronDown, X, Send, MessageSquarePlus, CheckCircle, Sparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
import AdCarousel from '@/components/AdCarousel'
import LocationPickerModal from '@/components/LocationPickerModal'
import { useLang } from '@/context/LangContext'
import { PAPERS, type Paper } from '@/lib/papers'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ── Static data ─────────────────────────────────────────────────────────────
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
  { icon: Shield,    title: 'Secure PDFs',       titleGu: 'સુરક્ષિત PDF',         desc: 'Watermarked, expiring links, no sharing possible', descGu: 'વૉટરમાર્ક, એક્સ્પાઇરિંગ લિંક', color: 'bg-blue-50 text-blue-500' },
  { icon: Clock,     title: '6 Month Access',    titleGu: '૬ મહિના ઍક્સેસ',       desc: 'Full access for 6 months after purchase',          descGu: 'ખરીદી પછી ૬ મહિના ઍક્સેસ',       color: 'bg-purple-50 text-purple-500' },
  { icon: Users,     title: 'Referral Rewards',  titleGu: 'રેફરલ પુરસ્કાર',       desc: '20% commission on every referral purchase',        descGu: 'દરેક રેફરલ ખરીદી પર ૨૦%',         color: 'bg-emerald-50 text-emerald-500' },
  { icon: TrendingUp,title: 'Expert Papers',     titleGu: 'નિષ્ણાત પ્રશ્નપત્રો', desc: 'Crafted by experienced Gujarat Board teachers',    descGu: 'અનુભવી શિક્ષકો દ્વારા તૈયાર',     color: 'bg-amber-50 text-amber-500' },
]

type Review = {
  id: string
  user_name: string
  city: string | null
  rating: number
  text: string
  created_at: string
}

// ── Hooks ────────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  const prevTarget = useRef(0)
  useEffect(() => {
    if (target === 0 || target === prevTarget.current) return
    prevTarget.current = target
    cancelAnimationFrame(rafRef.current)
    const startTime = performance.now()
    const startVal = count
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(startVal + ease * (target - startVal)))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration]) // eslint-disable-line react-hooks/exhaustive-deps
  return count
}

function formatStudentCount(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000) * 1000}+`
  if (n >= 100)  return `${Math.floor(n / 100) * 100}+`
  return n.toString()
}

// ── Sub-components ───────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i} type="button"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-125 focus:outline-none"
          aria-label={`${i} star`}
        >
          <Star
            size={26}
            fill={i <= (hovered || value) ? '#fbbf24' : 'none'}
            className={i <= (hovered || value) ? 'text-amber-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}

// ── How It Works inline SVG icons ────────────────────────────────────────────
function IconBrowse() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="8" y="6" width="28" height="36" rx="4" fill="#EEF4FF" stroke="#1264F0" strokeWidth="2.5"/>
      <line x1="14" y1="16" x2="30" y2="16" stroke="#1264F0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="22" x2="30" y2="22" stroke="#1264F0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="28" x2="22" y2="28" stroke="#1264F0" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="36" cy="34" r="8" fill="#1264F0"/>
      <line x1="33" y1="34" x2="39" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="31" x2="36" y2="37" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconBuy() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="24" r="18" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5"/>
      <text x="24" y="31" textAnchor="middle" fontSize="20" fontWeight="700" fill="#B45309">₹</text>
    </svg>
  )
}

function IconPdf() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="8" y="4" width="26" height="34" rx="4" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.5"/>
      <path d="M28 4 L36 12 L28 12 Z" fill="#16A34A" opacity="0.5"/>
      <path d="M24 20 L24 32 M19 27 L24 32 L29 27" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="6" y="36" width="36" height="8" rx="4" fill="#16A34A"/>
      <text x="24" y="43" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">PDF</text>
    </svg>
  )
}

function IconTrophy() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M14 8 H34 V26 C34 34 14 34 14 26 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5"/>
      <path d="M8 10 H14 V22 C8 22 6 18 8 10Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
      <path d="M34 10 H40 V22 C40 22 42 18 40 10Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
      <line x1="24" y1="34" x2="24" y2="40" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="16" y="40" width="16" height="4" rx="2" fill="#F59E0B"/>
      <path d="M20 22 L22 20 L24 22 L26 20 L28 22" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Framer Motion variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const gu = lang === 'gu'

  // ── Page state ──────────────────────────────────────────────────────────────
  const [openFaq,    setOpenFaq]    = useState<number | null>(null)
  const [stats,      setStats]      = useState({ students: 0, papers: 0 })
  const [allPapers,  setAllPapers]  = useState<Paper[]>(PAPERS)
  const [reviews,    setReviews]    = useState<Review[] | null>(null)
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState({ name: '', city: '', rating: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)

  // ── Data fetching (unchanged) ───────────────────────────────────────────────
  const trending     = allPapers.filter(p => p.popular).slice(0, 3)
  const animStudents = useCountUp(stats.students, 1800)
  const animPapers   = useCountUp(stats.papers,   1200)

  useEffect(() => {
    const fetchStats = () =>
      fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
    fetchStats()
    const id = setInterval(fetchStats, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/papers')
      .then(r => r.json())
      .then(d => { const live = d.data as Paper[]; if (live?.length) setAllPapers(live) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/reviews?limit=4')
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => setReviews([]))
  }, [])

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
      const res  = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: form.name, city: form.city, rating: form.rating, text: form.text }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Review submitted! Thank you.')
        setShowModal(false)
        setForm({ name: '', city: '', rating: 5, text: '' })
        fetch('/api/reviews?limit=4').then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => {})
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setSubmitting(false)
  }

  const statItems = [
    { num: formatStudentCount(animStudents), label: gu ? 'વિદ્યાર્થીઓ' : t.studentsEnrolled, delay: 0.4, icon: '👨‍🎓' },
    { num: String(animPapers),               label: gu ? 'પ્રશ્નપત્ર સેટ' : t.paperSets,      delay: 0.5, icon: '📄' },
    { num: '₹60',                            label: gu ? 'કોઈ પણ ૩ નો કૉમ્બો' : t.comboDeal, delay: 0.6, icon: '🎯' },
  ]

  const howSteps = [
    { Icon: IconBrowse, label: t.howStep1Label, desc: t.howStep1Desc, ring: 'ring-brand-200'  },
    { Icon: IconBuy,    label: t.howStep2Label, desc: t.howStep2Desc, ring: 'ring-amber-200'  },
    { Icon: IconPdf,    label: t.howStep3Label, desc: t.howStep3Desc, ring: 'ring-green-200'  },
    { Icon: IconTrophy, label: t.howStep4Label, desc: t.howStep4Desc, ring: 'ring-yellow-200' },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════ AD STRIP */}
      <AdCarousel />

      {/* ══════════════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#04091A]">

        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-600/25 rounded-full blur-[120px] animate-blob pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px] animate-blob-delay pointer-events-none" />
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: copy + CTAs ── */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-brand-300 mb-7 backdrop-blur-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {gu ? 'ગુજરાત બોર્ડ · ધોરણ ૧૦ & ૧૨ વિજ્ઞાન' : 'Gujarat Board · Class 10 & 12 Science'}
              </div>

              {/* Headline */}
              <h1 className={`text-5xl lg:text-[3.75rem] font-display font-bold leading-[1.1] mb-6 ${gu ? 'font-gujarati' : ''}`}>
                <span className="text-white block">{gu ? 'સ્માર્ટ પ્રશ્નપત્ર' : 'Crack Your Exams'}</span>
                <span className="block mt-1" style={{ background: 'linear-gradient(135deg,#60a5fa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {gu ? 'સાથે સફળ થાઓ' : 'with Smart Papers'}
                </span>
              </h1>

              {/* Sub */}
              <p className={`text-gray-400 text-lg max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                {t.heroSub}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-14">

                <Link
                  href="/papers"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-brand-400 hover:-translate-y-0.5"
                  style={{ boxShadow: '0 8px 32px rgba(18,100,240,0.4)' }}
                >
                  <span className={gu ? 'font-gujarati' : ''}>{t.browsePapers}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

                {/* Free Demo — unchanged Link */}
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white font-semibold rounded-2xl hover:bg-white/8 transition-all duration-300 backdrop-blur-sm"
                >
                  <Sparkles size={16} className="text-amber-400" />
                  <span className={gu ? 'font-gujarati' : ''}>{gu ? 'ફ્રી ડૅમો' : 'Free Demo'}</span>
                </Link>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {statItems.map(s => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: s.delay, duration: 0.45, type: 'spring', stiffness: 180, damping: 16 }}
                    className="flex items-center gap-2.5 bg-white/6 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <div className="font-display font-bold text-xl text-white tabular-nums leading-none">{s.num}</div>
                      <div className={`text-xs text-gray-400 mt-0.5 ${gu ? 'font-gujarati' : ''}`}>{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: student photo (desktop) ── */}
          <div className="hidden lg:flex justify-center items-end relative min-h-[500px]">

            {/* Multi-layer glow aura behind student */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Floating subject badge — top-left */}
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [3, 4, 3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 left-0 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl px-4 py-3 text-white"
            >
              <div className="text-2xl mb-1">📐</div>
              <div className="text-xs font-bold">Mathematics</div>
              <div className="text-[10px] text-white/60">Class 12</div>
            </motion.div>

            {/* Floating subject badge — bottom-right */}
            <motion.div
              animate={{ y: [5, -5, 5], rotate: [-3, -4, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-20 right-0 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl px-4 py-3 text-white"
            >
              <div className="text-2xl mb-1">⚛️</div>
              <div className="text-xs font-bold">Physics</div>
              <div className="text-[10px] text-white/60">Class 12</div>
            </motion.div>

            {/* Combo deal badge — top-right */}
            <motion.div
              animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
              transition={{ duration: 3.2, repeat: Infinity }}
              className="absolute top-4 right-4 text-white rounded-2xl px-4 py-2.5 text-center z-20"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', boxShadow: '0 12px 32px rgba(245,158,11,0.4)' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Combo Deal</div>
              <div className="text-2xl font-display font-bold leading-none">₹60</div>
            </motion.div>

            {/* Class 10 badge — bottom-left */}
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.8, repeat: Infinity }}
              className="absolute bottom-12 left-4 text-white rounded-2xl px-4 py-2.5 text-center z-20"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 12px 32px rgba(16,185,129,0.4)' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Class 10</div>
              <div className="text-sm font-bold">Available!</div>
            </motion.div>

            {/* Floating physics symbols */}
            <motion.span
              animate={{ y: [-5, 5, -5], rotate: [-8, 8, -8], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[28%] right-2 text-white text-xl font-mono font-bold pointer-events-none select-none"
            >
              E=mc²
            </motion.span>
            <motion.span
              animate={{ y: [4, -4, 4], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute top-[55%] left-3 text-white text-lg font-mono pointer-events-none select-none"
            >
              ∫ dx
            </motion.span>
            <motion.span
              animate={{ y: [-3, 3, -3], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-[18%] left-[38%] text-white text-base font-mono pointer-events-none select-none"
            >
              π = 3.14
            </motion.span>

            {/* Student image — gentle entry + soft float */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <Image
                  src="/student.png"
                  alt="Student holding books"
                  width={360}
                  height={440}
                  priority
                  className="relative z-10 max-w-[360px] w-full"
                  style={{ filter: 'drop-shadow(0 24px 56px rgba(18,100,240,0.28)) drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}
                />
                {/* Bottom gradient — student fades into the hero background */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, #04091A 0%, #04091A 18%, transparent 100%)' }}
                />
              </motion.div>
            </motion.div>

            {/* Ambient pulsing dots */}
            {[
              { top: '12%', left: '14%', size: 6, delay: 0 },
              { top: '70%', left: '8%',  size: 4, delay: 1 },
              { top: '32%', right: '8%', size: 5, delay: 0.5 },
              { top: '80%', right: '18%',size: 3, delay: 1.5 },
            ].map((d, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.4, 1] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: d.delay }}
                className="absolute rounded-full bg-brand-400"
                style={{ width: d.size, height: d.size, top: d.top, left: (d as { left?: string }).left, right: (d as { right?: string }).right }}
              />
            ))}
          </div>

          {/* Mobile student image — smaller, below the CTA on narrow screens */}
          <div className="lg:hidden flex justify-center mt-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative w-52"
            >
              <Image
                src="/student.png"
                alt="Student holding books"
                width={210}
                height={260}
                className="relative z-10 w-full"
                style={{ filter: 'drop-shadow(0 12px 32px rgba(18,100,240,0.3)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top, #04091A 0%, transparent 100%)' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 56L1440 56L1440 28C1200 56 960 0 720 28C480 56 240 0 0 28L0 56Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ BROWSE BY SUBJECT */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              {gu ? 'વિષય પ્રમાણે' : 'Browse by Subject'}
            </span>
            <h2 className={`text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'તમારો વિષય પસંદ કરો' : 'Choose Your Subject'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {gu ? 'ગુજરાત બોર્ડ & સ્પર્ધાત્મક પ્રવેશ પરીક્ષાઓ' : 'Gujarat Board & competitive entrance exams'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '📐', label: gu ? 'ગણિત' : 'Mathematics', href: '/papers?subject=math&class=12', from: 'from-blue-50',   to: 'to-blue-100/50',   border: 'border-blue-100',   text: 'text-blue-700',   badge: 'Class 12' },
              { icon: '⚛️', label: gu ? 'ભૌતિક વિજ્ઞાન' : 'Physics',     href: '/papers?subject=physics&class=12', from: 'from-purple-50', to: 'to-purple-100/50', border: 'border-purple-100', text: 'text-purple-700', badge: 'Class 12' },
              { icon: '📋', label: gu ? 'ધોરણ ૧૦' : 'Class 10',         href: '/papers?class=10',    from: 'from-emerald-50', to: 'to-emerald-100/50', border: 'border-emerald-100', text: 'text-emerald-700', badge: 'All Subjects' },
              { icon: '🎯', label: gu ? 'JEE' : 'JEE Prep',             href: '/papers?cat=jee',     from: 'from-amber-50',   to: 'to-amber-100/50',   border: 'border-amber-100',  text: 'text-amber-700',  badge: 'Entrance' },
              { icon: '🩺', label: gu ? 'NEET' : 'NEET Prep',           href: '/papers?cat=neet',    from: 'from-rose-50',    to: 'to-rose-100/50',    border: 'border-rose-100',   text: 'text-rose-700',   badge: 'Medical' },
              { icon: '🏛️', label: gu ? 'GUJCET' : 'GUJCET',           href: '/papers?cat=gujcet',  from: 'from-cyan-50',    to: 'to-cyan-100/50',    border: 'border-cyan-100',   text: 'text-cyan-700',   badge: 'Gujarat' },
              { icon: '🏆', label: gu ? '૯૦%+ સ્કોર' : 'Above 90%',   href: '/papers?cat=90',      from: 'from-indigo-50',  to: 'to-indigo-100/50',  border: 'border-indigo-100', text: 'text-indigo-700', badge: 'Top Score' },
              { icon: '✅', label: gu ? 'પાસ પૅકેજ' : 'Pass Package',   href: '/papers?cat=pass',    from: 'from-teal-50',    to: 'to-teal-100/50',    border: 'border-teal-100',   text: 'text-teal-700',   badge: 'Guaranteed' },
            ].map(s => (
              <motion.div key={s.label} variants={fadeUp}>
                <Link
                  href={s.href}
                  className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border ${s.border} bg-gradient-to-b ${s.from} ${s.to} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{s.icon}</span>
                  <div className="text-center">
                    <div className={`text-sm font-bold ${s.text} ${gu ? 'font-gujarati' : ''}`}>{s.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.badge}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═════════════════════════════════════════ TRENDING PAPERS */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                {gu ? 'ટ્રેન્ડિંગ' : 'Trending Now'}
              </span>
              <h2 className={`text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>{t.trending}</h2>
            </div>
            <Link href="/papers" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-500 font-semibold hover:text-brand-600 transition-colors group">
              <span className={gu ? 'font-gujarati' : ''}>{t.viewAll}</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {trending.map(p => (
              <motion.div key={p.id} variants={fadeUp}><PaperCard paper={p} /></motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-8 text-center sm:hidden"
          >
            <Link href="/papers" className="btn-outline px-6 py-3 inline-flex items-center gap-2">
              <span className={gu ? 'font-gujarati' : ''}>{t.viewAll}</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
            {gu ? 'પ્રક્રિયા' : 'Process'}
          </span>
          <h2 className={`text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>
            {t.howItWorksLabel}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-100 via-brand-300 to-brand-100 pointer-events-none" />

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6"
          >
            {howSteps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-center text-center group"
              >
                {/* Icon ring */}
                <div className={`relative w-24 h-24 rounded-full bg-white border-2 ${step.ring} flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow duration-300 ring-4 ring-offset-2 ring-transparent group-hover:${step.ring} group-hover:ring-offset-0`}
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                >
                  {/* Step number bubble */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                  <motion.div
                    whileInView={{ scale: [0.8, 1.05, 1] }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
                  >
                    <step.Icon />
                  </motion.div>
                </div>

                <h3 className={`font-display font-bold text-gray-900 text-base mb-2 ${gu ? 'font-gujarati' : ''}`}>
                  {step.label}
                </h3>
                <p className={`text-sm text-gray-500 leading-relaxed max-w-[180px] ${gu ? 'font-gujarati' : ''}`}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════════ WHY CHOOSE US */}
      <section className="bg-gray-50/70 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              {gu ? 'શા માટે' : 'Why Us'}
            </span>
            <h2 className={`text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'શા માટે Paplu Physics?' : 'Why choose Paplu Physics?'}
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {FEATURES.map(f => (
              <motion.div
                key={f.title} variants={fadeUp}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} />
                </div>
                <h3 className={`font-display font-bold text-gray-900 text-base mb-2 ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? f.titleGu : f.title}
                </h3>
                <p className={`text-sm text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? f.descGu : f.desc}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════════ STUDENT REVIEWS */}
      <section className="bg-gradient-to-b from-brand-50/60 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              {gu ? 'વિદ્યાર્થીઓ' : 'Student Reviews'}
            </span>
            <h2 className={`text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'ગુજરાત ના વિદ્યાર્થીઓ' : 'Trusted by Gujarat students'}
            </h2>
          </motion.div>

          {reviews === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((__, j) => <div key={j} className="w-3 h-3 rounded-full bg-gray-100" />)}</div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                    <div className="h-3 bg-gray-100 rounded w-3/5" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="space-y-1.5"><div className="h-3 bg-gray-100 rounded w-20" /><div className="h-2.5 bg-gray-100 rounded w-14" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviews !== null && reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⭐</div>
              <p className={`text-gray-700 font-semibold mb-1 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'હજી સુધી કોઈ સમીક્ષા નથી' : 'No reviews yet'}
              </p>
              <p className={`text-sm text-gray-400 mb-6 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'સૌ પ્રથમ સમીક્ષા આપો!' : 'Be the first to share your experience!'}
              </p>
              <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto">
                <MessageSquarePlus size={16} />
                {gu ? 'સમીક્ષા લખો' : 'Write a Review'}
              </button>
            </div>
          )}

          {reviews !== null && reviews.length > 0 && (
            <>
              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {reviews.map(r => (
                  <motion.div
                    key={r.id} variants={fadeUp}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex text-amber-400 mb-3 gap-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < r.rating ? 'currentColor' : 'none'} />)}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">&ldquo;{r.text}&rdquo;</p>
                    <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {r.user_name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.user_name}</p>
                        {r.city && <p className="text-xs text-gray-400 truncate">{r.city}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Link href="/reviews" className="btn-outline px-6 py-3 flex items-center gap-2 justify-center">
                  <span className={gu ? 'font-gujarati' : ''}>{gu ? 'બધી સમીક્ષાઓ જુઓ' : 'See All Reviews'}</span>
                  <ArrowRight size={14} />
                </Link>
                <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3 flex items-center gap-2 justify-center">
                  <MessageSquarePlus size={16} />
                  <span className={gu ? 'font-gujarati' : ''}>{gu ? 'સમીક્ષા લખો' : 'Write a Review'}</span>
                </button>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">FAQ</span>
          <h2 className={`text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>{t.faqTitle}</h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <motion.div
              key={i} variants={fadeUp}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-brand-100 transition-colors"
              style={{ boxShadow: openFaq === i ? '0 4px 20px rgba(18,100,240,0.08)' : '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 group"
              >
                <span className={`font-semibold text-gray-800 text-sm group-hover:text-brand-600 transition-colors ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? f.qGu : f.q}
                </span>
                <div className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${openFaq === i ? 'bg-brand-500 border-brand-500' : 'border-gray-200 group-hover:border-brand-200'}`}>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-white' : 'text-gray-400'}`} />
                </div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className={`px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3 ${gu ? 'font-gujarati' : ''}`}>
                      {gu ? f.aGu : f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════ CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl px-8 py-14 md:px-16 text-center text-white"
          style={{ background: 'linear-gradient(135deg,#0D52CC 0%,#1264F0 50%,#06B6D4 100%)' }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px),radial-gradient(circle at 80% 20%,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-[-30%] right-[-5%] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-5%] w-64 h-64 bg-white/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <Sparkles size={14} className="text-amber-300" />
              {gu ? 'સ્પેશ્યલ ઑફર' : 'Special Offer'}
            </div>
            <h2 className={`text-3xl md:text-4xl font-display font-bold mb-3 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'આજે જ શરૂ કરો' : 'Start preparing today'}
            </h2>
            <p className={`text-blue-100 mb-8 max-w-md mx-auto text-base ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'માત્ર ₹25 માં પ્રીમિયમ પ્રશ્નપત્ર સેટ. ₹60 કૉમ્બો ઑફર સાથે.' : 'Premium paper sets from just ₹25. Grab the ₹60 combo deal.'}
            </p>
            <Link
              href="/papers"
              className="group inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-10 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <span className={gu ? 'font-gujarati' : ''}>{t.browsePapers}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />

      {/* ═══════════════════════════════════ LOCATION PICKER (one-time) */}
      <LocationPickerModal />

      {/* ════════════════════════════════════════ WRITE REVIEW MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{gu ? 'નામ *' : 'Your Name *'}</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input" placeholder={gu ? 'રાજ પટેલ' : 'Raj Patel'} maxLength={50} required />
                  </div>
                  <div>
                    <label className="label">{gu ? 'શહેર' : 'City'}</label>
                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="input" placeholder={gu ? 'અમદાવાદ' : 'Ahmedabad'} maxLength={30} />
                  </div>
                </div>

                <div>
                  <label className="label">{gu ? 'રેટિંગ *' : 'Rating *'}</label>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>

                <div>
                  <label className="label">{gu ? 'સમીક્ષા *' : 'Your Review *'}</label>
                  <textarea
                    value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    className="input resize-none" rows={4}
                    placeholder={gu ? 'Paplu Physics કેવી રીતે મદદ કરી...' : 'Share how Paplu Physics helped you prepare...'}
                    minLength={10} maxLength={500} required
                  />
                  <p className="text-xs mt-1 text-gray-400">
                    {form.text.length}/500
                    {form.text.length > 0 && form.text.length < 10 && (
                      <span className="text-rose-400 ml-2">
                        {gu ? 'ઓછામાં ઓછા ૧૦ અક્ષર' : `${10 - form.text.length} more characters needed`}
                      </span>
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
