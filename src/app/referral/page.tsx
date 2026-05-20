'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Share2, Trophy, Users, TrendingUp, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLang } from '@/context/LangContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface LeaderboardEntry {
  rank: number
  name: string
  city: string
  earned: number
  refs: number
  initials: string
  isMe: boolean
}

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const RANK_COLORS = [
  'bg-amber-100 text-amber-700',
  'bg-gray-100 text-gray-600',
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
]

export default function ReferralPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [copied, setCopied] = useState(false)
  const [totalRefs, setTotalRefs] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://papluphysics.in'
  const refCode = profile?.referral_code || ''
  const refLink = `${siteUrl}/ref/${refCode}`

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }
    if (user) {
      Promise.all([
        // User's own referral stats
        supabase
          .from('referrals')
          .select('commission_amount, status')
          .eq('referrer_id', user.id),
        // Leaderboard from API
        fetch('/api/referral/leaderboard').then(r => r.json()),
      ]).then(([statsRes, lbData]) => {
        const refs = statsRes.data || []
        setTotalRefs(refs.length)
        setTotalEarned(
          refs
            .filter((r: { status: string }) => r.status === 'paid')
            .reduce((sum: number, r: { commission_amount: number | null }) => sum + (r.commission_amount || 0), 0)
        )
        // Inject isMe flag
        const lb: LeaderboardEntry[] = (lbData.entries || []).map((e: LeaderboardEntry) => ({
          ...e,
          isMe: e.name === (profile?.name || profile?.mobile || ''),
        }))
        setLeaderboard(lb)
        setDataLoading(false)
      })
    }
  }, [user, loading, router, profile])

  const copyCode = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true)
      toast.success(gu ? 'લિંક કૉપિ!' : 'Link copied!')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const shareWhatsApp = () => {
    const msg = gu
      ? `Paplu Physics પર ₹25 માં Gujarat Board પ્રશ્નપત્ર સેટ ખરીદો! મારી લિંક: ${refLink}`
      : `Get premium Gujarat Board paper sets for just ₹25 on Paplu Physics! Use my link: ${refLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="section-label">{gu ? 'શેર કરો અને કમાઓ' : 'Share & Earn'}</p>
          <h1 className={`section-title text-3xl mt-1 mb-2 ${gu ? 'font-gujarati' : ''}`}>
            {t.referralProgram}
          </h1>
          <p className={`text-sm text-gray-500 max-w-sm mx-auto ${gu ? 'font-gujarati' : ''}`}>
            {t.earnInfo}
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: '1', icon: '🔗', title: gu ? 'લિંક શેર' : 'Share Link', desc: gu ? 'તમારી અનન્ય લિંક' : 'Share your unique link' },
            { step: '2', icon: '🛒', title: gu ? 'ખરીદી' : 'Purchase', desc: gu ? 'મિત્ર ખરીદે' : 'Friend purchases' },
            { step: '3', icon: '💰', title: gu ? 'કમિશન' : 'Commission', desc: gu ? '20% તમારા વૉલેટ' : '20% to your wallet' },
          ].map(s => (
            <div key={s.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className={`font-display font-bold text-gray-900 text-sm mt-2 mb-0.5 ${gu ? 'font-gujarati' : ''}`}>{s.title}</p>
              <p className={`text-xs text-gray-400 ${gu ? 'font-gujarati' : ''}`}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Referral Code Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ${gu ? 'font-gujarati' : ''}`}>
            {t.yourCode}
          </p>
          <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-100 rounded-2xl mb-4">
            <code className="font-display font-bold text-2xl text-brand-600 flex-1 tracking-wider">
              {refCode || '—'}
            </code>
            <button
              onClick={copyCode}
              disabled={!refCode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                copied ? 'bg-green-100 text-green-600' : 'bg-brand-500 text-white hover:bg-brand-600'
              } disabled:opacity-40`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? (gu ? 'કૉપિ!' : 'Copied!') : (gu ? 'કૉપિ' : 'Copy')}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4 break-all">{refLink}</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={shareWhatsApp}
              disabled={!refCode}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-semibold text-sm rounded-xl hover:bg-green-600 transition-colors disabled:opacity-40"
            >
              <Share2 size={15} />
              <span className={gu ? 'font-gujarati' : ''}>{t.shareWhatsApp}</span>
            </button>
            <button
              onClick={copyCode}
              disabled={!refCode}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Copy size={15} />
              <span className={gu ? 'font-gujarati' : ''}>{t.copyLink}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: t.totalReferred, value: String(totalRefs), icon: Users, color: 'text-blue-500 bg-blue-50' },
            { label: t.totalEarned, value: `₹${totalEarned.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <p className="font-display font-bold text-xl text-gray-900">{s.value}</p>
              <p className={`text-xs text-gray-400 mt-0.5 ${gu ? 'font-gujarati' : ''}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={18} className="text-amber-500" />
            <h2 className={`font-display font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'માસિક લીડરબોર્ડ' : 'Monthly Leaderboard'}
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-gray-400 text-sm ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'હજી કોઈ રેફરલ નથી — પ્રથમ બનો!' : 'No referrals yet — be the first!'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    entry.isMe
                      ? 'bg-brand-50 border border-brand-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 text-center shrink-0">
                    {RANK_ICONS[entry.rank] || (
                      <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${RANK_COLORS[idx % RANK_COLORS.length]}`}>
                    {entry.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-gray-900 ${entry.isMe ? 'text-brand-700' : ''}`}>
                      {entry.name}{entry.isMe ? (gu ? ' (તમે)' : ' (You)') : ''}
                    </p>
                    <p className="text-xs text-gray-400">{entry.refs} {gu ? 'રેફરલ' : 'referrals'}</p>
                  </div>
                  <p className="text-sm font-bold text-green-600 shrink-0">₹{entry.earned.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 text-center">
            🏆 {gu ? 'ટોચના ૩ રેફરરો દર મહિને ₹500 બોનસ જીતે છે!' : 'Top 3 referrers win ₹500 bonus every month!'}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
