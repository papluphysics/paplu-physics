'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Star, Shield, Clock, Users, TrendingUp,
  ChevronDown, X, Send, MessageSquarePlus, Sparkles,
} from 'lucide-react'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
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
  { icon: Shield,     title: 'Secure PDFs',       titleGu: 'સુરક્ષિત PDF',         desc: 'Watermarked, expiring links, no sharing possible', descGu: 'વૉટરમાર્ક, એક્સ્પાઇરિંગ લિંક', color: 'bg-blue-50 text-blue-500' },
  { icon: Clock,      title: '6 Month Access',    titleGu: '૬ મહિના ઍક્સેસ',       desc: 'Full access for 6 months after purchase',          descGu: 'ખરીદી પછી ૬ મહિના ઍક્સેસ',       color: 'bg-purple-50 text-purple-500' },
  { icon: Users,      title: 'Referral Rewards',  titleGu: 'રેફરલ પુરસ્કાર',       desc: '20% commission on every referral purchase',        descGu: 'દરેક રેફરલ ખરીદી પર ૨૦%',         color: 'bg-emerald-50 text-emerald-500' },
  { icon: TrendingUp, title: 'Expert Papers',     titleGu: 'નિષ્ણાત પ્રશ્નપત્રો', desc: 'Crafted by experienced Gujarat Board teachers',    descGu: 'અનુભવી શિક્ષકો દ્વારા તૈયાર',     color: 'bg-amber-50 text-amber-500' },
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

function HeroPaperVisual() {
  return (
    <div className="relative select-none w-full max-w-[380px]" aria-hidden="true">
      <div className="absolute -inset-6 bg-gradient-to-br from-brand-50 via-sky-50/60 to-cyan-50/40 rounded-3xl -z-10 blur-sm" />

      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
        style={{ boxShadow: '0 8px 32px rgba(18,100,240,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-2xl shrink-0">⚛️</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-gray-900 truncate">Physics — Class 12</div>
            <div className="text-xs text-gray-400 mt-0.5">Board · JEE · NEET · GUJCET</div>
          </div>
          <span className="shrink-0 px-2.5 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-full border border-brand-100">Popular</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Starting at</div>
            <div className="text-3xl font-display font-bold text-gray-900">₹25</div>
          </div>
          <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
            {['Pass', '75%', '90%', 'JEE', 'NEET'].map(tag => (
              <span key={tag} className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-white rounded-xl border border-gray-100 p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <div className="text-2xl mb-2">📐</div>
          <div className="text-xs font-bold text-gray-800">Mathematics</div>
          <div className="text-[10px] text-gray-400 mb-2">Class 12</div>
          <div className="text-sm font-bold text-brand-500">₹25 / set</div>
        </motion.div>
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-white rounded-xl border border-gray-100 p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="text-xs font-bold text-gray-800">Class 10</div>
          <div className="text-[10px] text-gray-400 mb-2">All Subjects</div>
          <div className="text-sm font-bold text-brand-500">₹25 / set</div>
        </motion.div>
      </div>

      <motion.div
        animate={{ scale: [1, 1.018, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-white font-bold text-sm"
        style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 8px 24px rgba(245,158,11,0.28)' }}
      >
        <span>🎯</span>
        Any 3 sections for ₹60
        <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs font-semibold">Save ₹15</span>
      </motion.div>
    </div>
  )
}

// ── Main client component ─────────────────────────────────────────────────────
export default function HomeClient() {
  const { t, lang } = useLang()
  const router = useRouter()
  const gu = lang === 'gu'

  const [openFaq,    setOpenFaq]    = useState<number | null>(null)
  const [stats,      setStats]      = useState({ students: 0, papers: 0 })
  const [allPapers,  setAllPapers]  = useState<Paper[]>(PAPERS)
  const [reviews,    setReviews]    = useState<Review[] | null>(null)
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState({ name: '', city: '', rating: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)

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

  // Handle OAuth redirect hash (Google login returns here)
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
    { num: formatStudentCount(animStudents), label: gu ? 'વિદ્યાર્થીઓ' : t.studentsEnrolled, delay: 0.35 },
    { num: String(animPapers),               label: gu ? 'પ્રશ્નપત્ર સેટ' : t.paperSets,     delay: 0.45 },
    { num: '₹60',                            label: gu ? 'કોઈ પણ ૩ નો કૉમ્બો' : t.comboDeal, delay: 0.55 },
  ]

  const howSteps = [
    { Icon: IconBrowse, label: t.howStep1Label, desc: t.howStep1Desc, ring: 'ring-brand-200'  },
    { Icon: IconBuy,    label: t.howStep2Label, desc: t.howStep2Desc, ring: 'ring-amber-200'  },
    { Icon: IconPdf,    label: t.howStep3Label, desc: t.howStep3Desc, ring: 'ring-green-200'  },
    { Icon: IconTrophy, label: t.howStep4Label, desc: t.howStep4Desc, ring: 'ring-yellow-200' },
  ]

  const classCards = [
    { icon: '📋', href: '/papers?class=10',                  title: t.class10CardTitle,     desc: t.class10CardDesc,     bg: 'from-emerald-50 to-emerald-50/30', border: 'border-emerald-100', accent: 'text-emerald-700' },
    { icon: '📐', href: '/papers?subject=math&class=12',     title: t.class12MathCardTitle, desc: t.class12MathCardDesc, bg: 'from-blue-50 to-blue-50/30',       border: 'border-blue-100',    accent: 'text-blue-700'    },
    { icon: '⚛️', href: '/papers?subject=physics&class=12',  title: t.class12PhysCardTitle, desc: t.class12PhysCardDesc, bg: 'from-purple-50 to-purple-50/30',   border: 'border-purple-100',  accent: 'text-purple-700'  },
    { icon: '🏛️', href: '/papers?cat=gujcet',               title: t.gujcetCardTitle,      desc: t.gujcetCardDesc,      bg: 'from-cyan-50 to-cyan-50/30',       border: 'border-cyan-100',    accent: 'text-cyan-700'    },
  ]

  return (
    <>
      {/* ══════════════════════════════════════════════════════ BROWSE BY SUBJECT
           First section after the ad banner — visible on first paint on mobile.
           Top padding trimmed to keep the heading within the initial viewport.  */}
      <section className="bg-slate-50/50 pt-6 pb-20">
        <div className="max-w-6xl mx-auto px-4">
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
                { icon: '📐', label: gu ? 'ગણિત' : 'Mathematics',        href: '/papers?subject=math&class=12',    from: 'from-blue-50',    to: 'to-blue-100/50',    border: 'border-blue-100',    text: 'text-blue-700',    badge: 'Class 12'    },
                { icon: '⚛️', label: gu ? 'ભૌતિક વિજ્ઞાન' : 'Physics',  href: '/papers?subject=physics&class=12', from: 'from-purple-50',  to: 'to-purple-100/50',  border: 'border-purple-100',  text: 'text-purple-700',  badge: 'Class 12'    },
                { icon: '📋', label: gu ? 'ધોરણ ૧૦' : 'Class 10',        href: '/papers?class=10',                 from: 'from-emerald-50', to: 'to-emerald-100/50', border: 'border-emerald-100', text: 'text-emerald-700', badge: 'All Subjects' },
                { icon: '🎯', label: gu ? 'JEE' : 'JEE Prep',            href: '/papers?cat=jee',                  from: 'from-amber-50',   to: 'to-amber-100/50',   border: 'border-amber-100',   text: 'text-amber-700',   badge: 'Entrance'    },
                { icon: '🩺', label: gu ? 'NEET' : 'NEET Prep',          href: '/papers?cat=neet',                 from: 'from-rose-50',    to: 'to-rose-100/50',    border: 'border-rose-100',    text: 'text-rose-700',    badge: 'Medical'     },
                { icon: '🏛️', label: gu ? 'GUJCET' : 'GUJCET',          href: '/papers?cat=gujcet',               from: 'from-cyan-50',    to: 'to-cyan-100/50',    border: 'border-cyan-100',    text: 'text-cyan-700',    badge: 'Gujarat'     },
                { icon: '🏆', label: gu ? '૯૦%+ સ્કોર' : 'Above 90%',   href: '/papers?cat=90',                   from: 'from-indigo-50',  to: 'to-indigo-100/50',  border: 'border-indigo-100',  text: 'text-indigo-700',  badge: 'Top Score'   },
                { icon: '✅', label: gu ? 'પાસ પૅકેજ' : 'Pass Package',  href: '/papers?cat=pass',                 from: 'from-teal-50',    to: 'to-teal-100/50',    border: 'border-teal-100',    text: 'text-teal-700',    badge: 'Guaranteed'  },
              ].map(s => (
                <motion.div key={s.label} variants={fadeUp}>
                  <Link
                    href={s.href}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border ${s.border} bg-gradient-to-b ${s.from} ${s.to} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
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
        </div>
      </section>

      {/* ══════════════════════════════════════════ DEMO PAPER CARD */}
      <section className="bg-white py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/demo"
              className="group flex flex-col sm:flex-row items-center gap-5 sm:gap-7 w-full p-6 sm:p-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 2px 12px rgba(245,158,11,0.10)' }}
            >
              {/* Icon */}
              <div className="shrink-0 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-amber-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14" aria-hidden="true">
                  {/* Document body */}
                  <rect x="8" y="4" width="36" height="46" rx="5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5"/>
                  {/* Document lines */}
                  <line x1="16" y1="18" x2="36" y2="18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="16" y1="25" x2="36" y2="25" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="16" y1="32" x2="28" y2="32" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  {/* Play circle overlay */}
                  <circle cx="46" cy="46" r="14" fill="#F59E0B"/>
                  {/* Play triangle */}
                  <path d="M42 41 L53 46 L42 51 Z" fill="white"/>
                </svg>
              </div>

              {/* Text */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-widest rounded-full mb-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  {gu ? 'ફ્રી' : 'Free'}
                </div>
                <h2 className={`text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1.5 ${gu ? 'font-gujarati' : ''}`}>
                  {t.demoPaperCardTitle}
                </h2>
                <p className={`text-sm text-gray-500 ${gu ? 'font-gujarati' : ''}`}>
                  {t.demoPaperCardSub}
                </p>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 group-hover:bg-amber-400 text-white font-bold text-sm rounded-xl transition-colors duration-200 min-h-[44px]">
                  <span className={gu ? 'font-gujarati' : ''}>{t.demoPaperCardCta}</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════ CHOOSE YOUR CLASS
           Sits below Choose Your Subject + Demo card.                        */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              {gu ? 'તમારો માર્ગ' : 'Your Path'}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-display font-bold text-gray-900 tracking-tight ${gu ? 'font-gujarati' : ''}`}>
              {t.chooseClassTitle}
            </h2>
            <p className={`text-gray-500 mt-2 text-sm ${gu ? 'font-gujarati' : ''}`}>
              {t.chooseClassSub}
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {classCards.map(card => (
              <motion.div key={card.href} variants={fadeUp}>
                <Link
                  href={card.href}
                  className={`group flex flex-col items-center text-center gap-2.5 sm:gap-3 p-4 sm:p-6 rounded-2xl border bg-gradient-to-b ${card.bg} ${card.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{card.icon}</span>
                  <div>
                    <div className={`text-xs sm:text-sm font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>{card.title}</div>
                    <div className={`text-[11px] sm:text-xs text-gray-500 mt-0.5 ${gu ? 'font-gujarati' : ''}`}>{card.desc}</div>
                  </div>
                  <span className={`text-xs font-semibold ${card.accent} flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity`}>
                    {gu ? 'જુઓ' : 'Explore'} <ArrowRight size={11} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ HERO
           Now below "Choose Your Class". For returning students who know
           the product this is secondary context; for new visitors it
           provides the full pitch after they've seen what's available.      */}
      <section className="bg-gradient-to-b from-slate-50 via-slate-50/60 to-white pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badge — truncated on small screens */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-[11px] sm:text-xs font-bold text-brand-600 mb-6 uppercase tracking-wide max-w-full overflow-hidden">
                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                <span className="truncate">{gu ? 'ગુજરાત બોર્ડ · ધોરણ ૧૦ & ૧૨ વિજ્ઞાન' : 'Gujarat Board · Class 10 & 12 Science'}</span>
              </div>

              {/* Headline */}
              <h1 className={`text-3xl sm:text-4xl lg:text-[3.25rem] font-display font-bold leading-[1.12] text-slate-900 mb-5 ${gu ? 'font-gujarati' : ''}`}>
                {gu
                  ? <><span className="block">સ્માર્ટ પ્રશ્નપત્ર</span><span className="text-brand-500">સાથે સફળ થાઓ</span></>
                  : <><span className="block">Crack Your Exams</span><span className="text-brand-500">with Smart Papers</span></>
                }
              </h1>

              {/* Subtext */}
              <p className={`text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8 ${gu ? 'font-gujarati' : ''}`}>
                {t.heroSub}
              </p>

              {/* CTAs — CHANGE 2: stacked full-width on mobile, side-by-side on sm+ */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
                <Link
                  href="/papers"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3 sm:py-3.5 min-h-[48px] w-full sm:w-auto bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-colors"
                  style={{ boxShadow: '0 8px 24px rgba(18,100,240,0.28)' }}
                >
                  <span className={gu ? 'font-gujarati' : ''}>{t.browsePapers}</span>
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 sm:py-3.5 min-h-[48px] w-full sm:w-auto border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <Sparkles size={15} className="text-amber-400 shrink-0" />
                  <span className={gu ? 'font-gujarati' : ''}>{gu ? 'ફ્રી ડૅમો' : 'Free Demo'}</span>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-6 gap-y-4 pt-7 border-t border-gray-100">
                {statItems.map(s => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: s.delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={`text-xl sm:text-2xl font-display font-bold text-slate-900 tabular-nums leading-none ${gu ? 'font-gujarati' : ''}`}>
                      {s.num}
                    </div>
                    <div className={`text-xs text-slate-500 mt-1 ${gu ? 'font-gujarati' : ''}`}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: paper-card visual — desktop only */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center"
            >
              <HeroPaperVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ TRENDING PAPERS */}
      <section className="bg-white py-20">
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
      <section className="bg-slate-50/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
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
            <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-100 via-brand-200 to-brand-100 pointer-events-none" />
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6"
            >
              {howSteps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center group">
                  <div
                    className={`relative w-24 h-24 rounded-full bg-white border-2 ${step.ring} flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                  >
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
                  <h3 className={`font-display font-bold text-gray-900 text-base mb-2 ${gu ? 'font-gujarati' : ''}`}>{step.label}</h3>
                  <p className={`text-sm text-gray-500 leading-relaxed max-w-[180px] ${gu ? 'font-gujarati' : ''}`}>{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════ WHY CHOOSE US */}
      <section className="bg-white py-20">
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
                <h3 className={`font-display font-bold text-gray-900 text-base mb-2 ${gu ? 'font-gujarati' : ''}`}>{gu ? f.titleGu : f.title}</h3>
                <p className={`text-sm text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>{gu ? f.descGu : f.desc}</p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════════ STUDENT REVIEWS */}
      <section className="bg-gradient-to-b from-brand-50/40 to-white py-20">
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
                  <div className="space-y-2 mb-4"><div className="h-3 bg-gray-100 rounded w-full" /><div className="h-3 bg-gray-100 rounded w-4/5" /><div className="h-3 bg-gray-100 rounded w-3/5" /></div>
                  <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gray-100" /><div className="space-y-1.5"><div className="h-3 bg-gray-100 rounded w-20" /><div className="h-2.5 bg-gray-100 rounded w-14" /></div></div>
                </div>
              ))}
            </div>
          )}

          {reviews !== null && reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⭐</div>
              <p className={`text-gray-700 font-semibold mb-1 ${gu ? 'font-gujarati' : ''}`}>{gu ? 'હજી સુધી કોઈ સમીક્ષા નથી' : 'No reviews yet'}</p>
              <p className={`text-sm text-gray-400 mb-6 ${gu ? 'font-gujarati' : ''}`}>{gu ? 'સૌ પ્રથમ સમીક્ષા આપો!' : 'Be the first to share your experience!'}</p>
              <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto">
                <MessageSquarePlus size={16} />
                {gu ? 'સમીક્ષા લખો' : 'Write a Review'}
              </button>
            </div>
          )}

          {reviews !== null && reviews.length > 0 && (
            <>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      <section className="bg-white max-w-3xl mx-auto px-4 py-20">
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
          style={{ background: 'linear-gradient(135deg,#0D52CC 0%,#1264F0 55%,#06B6D4 100%)' }}
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

      {/* One-time location picker (shows after login if state not set) */}
      <LocationPickerModal />

      {/* Write review modal */}
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
    </>
  )
}
