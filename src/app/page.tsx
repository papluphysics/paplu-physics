'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Shield, Clock, Users, TrendingUp, ChevronDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
import { useLang } from '@/context/LangContext'
import { PAPERS } from '@/lib/papers'
import { supabase } from '@/lib/supabase'

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

const TESTIMONIALS = [
  { name: 'Raj Verma', nameGu: 'રાજ વર્મા', city: 'Ahmedabad', score: '89%', text: 'Got 89% in boards! The paper patterns were exactly like actual exam. Totally worth ₹25.', textGu: 'બોર્ડ પરીક્ષામાં ૮૯% મળ્યા! પ્રશ્નપત્ર પૅટર્ન એકદમ સાચો હતો. ₹25 ની સંપૂર્ણ કિંમત.' },
  { name: 'Priya Shah', nameGu: 'પ્રિયા શાહ', city: 'Surat', score: '₹120 earned', text: 'Earned ₹120 just by sharing with my friends via referral. Used it to buy GUJCET set!', textGu: 'રેફરલ દ્વારા ₹120 કમાયા. GUJCET સેટ ખરીદ્યો!' },
  { name: 'Arjun Modi', nameGu: 'અર્જુન મોદી', city: 'Vadodara', score: '93%', text: 'Scored 93 in maths. The 90+ set is genuinely harder than the actual exam — perfect practice.', textGu: 'ગણિતમાં ૯૩ ગુણ. ૯૦+ સેટ ખૂબ સારો સ્ત્રોત છે.' },
]

const FEATURES = [
  { icon: Shield, title: 'Secure PDFs', titleGu: 'સુરક્ષિત PDF', desc: 'Watermarked, expiring links, no sharing possible', descGu: 'વૉટરમાર્ક, એક્સ્પાઇરિંગ લિંક' },
  { icon: Clock, title: '6 Month Access', titleGu: '૬ મહિના ઍક્સેસ', desc: 'Full access for 6 months after purchase', descGu: 'ખરીદી પછી ૬ મહિના ઍક્સેસ' },
  { icon: Users, title: 'Referral Rewards', titleGu: 'રેફરલ પુરસ્કાર', desc: '20% commission on every referral purchase', descGu: 'દરેક રેફરલ ખરીદી પર ૨૦%' },
  { icon: TrendingUp, title: 'Expert Papers', titleGu: 'નિષ્ણાત પ્રશ્નપત્રો', desc: 'Crafted by experienced Gujarat Board teachers', descGu: 'અનુભવી શિક્ષકો દ્વારા તૈયાર' },
]

export default function HomePage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [stats, setStats] = useState({ students: 0, papers: 0 })
  const trending = PAPERS.filter(p => p.popular)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
  }, [])

  // Handle Google OAuth hash-based redirect (when Supabase redirects here instead of /auth/callback)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace('/dashboard')
      })
    }
  }, [router])

  const gu = lang === 'gu'

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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto"
          >
            {[
              { num: stats.students.toLocaleString(), label: t.studentsEnrolled },
              { num: String(stats.papers),            label: t.paperSets },
              { num: '₹60',                           label: t.comboDeal },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm py-4 px-3 text-center">
                <div className="font-display font-bold text-2xl text-gray-900">{s.num}</div>
                <div className={`text-xs text-gray-500 mt-1 ${gu ? 'font-gujarati' : ''}`}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BROWSE BY SUBJECT (DIKSHA style) ── */}
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

      {/* ── TESTIMONIALS ── */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-label">{gu ? 'વિદ્યાર્થીઓ શું કહે છે' : 'Student Reviews'}</p>
            <h2 className={`section-title mt-1 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'ગુજરાત ના વિદ્યાર્થીઓ' : 'Trusted by Gujarat students'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(r => (
              <div key={r.name} className="card p-5 bg-white">
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${gu ? 'font-gujarati' : ''}`}>
                  "{gu ? r.textGu : r.text}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold text-gray-800 ${gu ? 'font-gujarati' : ''}`}>
                      {gu ? r.nameGu : r.name}
                    </p>
                    <p className="text-xs text-gray-400">{r.city} · {r.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
}
