'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, Clock, RefreshCw, BookOpen, Wallet, Share2, LogOut } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLang } from '@/context/LangContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { differenceInDays, format } from 'date-fns'

interface Purchase {
  id: string
  amount_paid: number
  purchase_date: string
  expiry_date: string
  papers: {
    id: string
    title_en: string
    title_gu: string
    paper_count: number
  } | null
}

function paperIcon(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('physics') || t.includes('phy') || t.includes('ભૌતિક')) return '⚛️'
  if (t.includes('math') || t.includes('maths') || t.includes('ગણિત')) return '📐'
  return '📋'
}

function ExpiryChip({ expiryDate }: { expiryDate: string }) {
  const days = differenceInDays(new Date(expiryDate), new Date())
  const expired = days < 0
  if (expired) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
      <Clock size={11} /> Expired
    </span>
  )
  if (days <= 30) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
      <Clock size={11} /> {days} days left
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
      <Clock size={11} /> {days} days left
    </span>
  )
}

export default function DashboardPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }
    if (user) {
      supabase
        .from('purchases')
        .select('id, amount_paid, purchase_date, expiry_date, papers(id, title_en, title_gu, paper_count)')
        .order('purchase_date', { ascending: false })
        .then(({ data }) => {
          setPurchases((data as unknown as Purchase[]) || [])
          setDataLoading(false)
        })
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleDownload = (_id: string) => {
    alert('Downloads will be enabled after Cloudflare R2 is connected.')
  }

  if (loading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const now = new Date()
  const activePurchases = purchases.filter(p => new Date(p.expiry_date) > now)
  const expiredPurchases = purchases.filter(p => new Date(p.expiry_date) <= now)
  const walletBalance = profile?.wallet_balance ?? 0

  const displayName = profile?.name
    || profile?.mobile?.replace('+91', '')
    || profile?.email?.split('@')[0]
    || 'Student'

  const displayInitial = displayName[0]?.toUpperCase() || 'S'

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy')
    : ''

  const displayPhone = profile?.mobile
    ? profile.mobile.replace('+91', '+91 ')
    : profile?.email || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-xl shrink-0">
            {displayInitial}
          </div>
          <div className="flex-1">
            <h1 className={`font-display font-bold text-xl text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? `નમસ્તે, ${displayName}` : `Hello, ${displayName}`}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {displayPhone}{memberSince ? ` · Member since ${memberSince}` : ''}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/wallet" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-semibold border border-brand-100 hover:bg-brand-100 transition-colors">
              <Wallet size={13} /> ₹{walletBalance.toFixed(2)} {gu ? 'વૉલેટ' : 'Wallet'}
            </Link>
            <Link href="/referral" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-600 text-xs font-semibold border border-purple-100 hover:bg-purple-100 transition-colors">
              <Share2 size={13} /> {gu ? 'રેફર' : 'Refer'}
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={13} /> {gu ? 'લૉગ આઉટ' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: gu ? 'ખરીદેલ' : 'Purchased', value: String(purchases.length), icon: BookOpen, color: 'text-brand-500 bg-brand-50' },
            { label: gu ? 'સક્રિય' : 'Active', value: String(activePurchases.length), icon: Clock, color: 'text-green-600 bg-green-50' },
            { label: gu ? 'સમાપ્ત' : 'Expired', value: String(expiredPurchases.length), icon: RefreshCw, color: 'text-red-500 bg-red-50' },
            { label: gu ? 'વૉલેટ' : 'Wallet', value: `₹${walletBalance.toFixed(2)}`, icon: Wallet, color: 'text-purple-600 bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-gray-900 leading-none">{s.value}</p>
                <p className={`text-xs text-gray-400 mt-0.5 ${gu ? 'font-gujarati' : ''}`}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Purchased Papers */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`font-display font-bold text-lg text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'મારા પ્રશ્નપત્રો' : 'My Papers'}
            </h2>
            <Link href="/papers" className="text-xs text-brand-500 font-semibold hover:underline">
              + {gu ? 'વધુ ખરીદો' : 'Buy more'}
            </Link>
          </div>

          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">📂</div>
              <p className={`text-gray-500 text-sm font-medium mb-4 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'હજી કોઈ પ્રશ્નપત્ર ખરીદ્યા નથી' : 'No papers purchased yet'}
              </p>
              <Link href="/papers" className="btn-primary text-sm px-5 py-2.5">
                {gu ? 'પ્રશ્નપત્રો જુઓ' : 'Browse Papers'}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {purchases.map(p => {
                const expired = new Date(p.expiry_date) <= now
                const title = gu ? (p.papers?.title_gu || p.papers?.title_en || '') : (p.papers?.title_en || '')
                const icon = paperIcon(title)
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${expired ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-100 hover:border-brand-100 hover:bg-brand-50/30'}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-900 text-sm truncate ${gu ? 'font-gujarati' : ''}`}>
                        {title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.papers?.paper_count ?? 1} {gu ? 'પ્રશ્નપત્રો' : 'papers'} · {gu ? 'ખરીદ્યું' : 'Purchased'} {format(new Date(p.purchase_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      <ExpiryChip expiryDate={p.expiry_date} />
                      {expired ? (
                        <Link href="/papers" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors">
                          <RefreshCw size={11} /> {gu ? 'નવીકરણ ₹25' : 'Renew ₹25'}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleDownload(p.papers?.id || p.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
                        >
                          <Download size={11} /> {gu ? 'ડાઉનલોડ' : 'Download'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
