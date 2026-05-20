'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, ArrowDownToLine, ShoppingCart, Clock, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLang } from '@/context/LangContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface WalletTx {
  id: string
  amount: number
  type: 'credit' | 'debit'
  reason: string | null
  reference: string | null
  status: string
  created_at: string
}

const REASON_LABEL: Record<string, { en: string; gu: string }> = {
  referral_commission: { en: 'Referral commission', gu: 'રેફરલ કમિશન' },
  purchase:           { en: 'Purchase',             gu: 'ખરીદી' },
  withdrawal:         { en: 'Withdrawal to UPI',    gu: 'UPI ઉપાડ' },
  refund:             { en: 'Refund',               gu: 'પૈસા પરત' },
}

export default function WalletPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const router = useRouter()
  const { user, profile, loading, refreshProfile } = useAuth()
  const [transactions, setTransactions] = useState<WalletTx[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [upiId, setUpiId] = useState('')
  const [amount, setAmount] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }
    if (user) {
      supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setTransactions((data as WalletTx[]) || [])
          setDataLoading(false)
        })
    }
  }, [user, loading, router])

  const balance = profile?.wallet_balance ?? 0

  const handleWithdraw = async () => {
    if (!upiId.trim()) {
      toast.error(gu ? 'UPI ID દાખલ કરો' : 'Enter your UPI ID')
      return
    }
    const amt = parseFloat(amount)
    if (!amt || amt < 15) {
      toast.error(gu ? 'ન્યૂનતમ ₹15' : 'Minimum withdrawal is ₹15')
      return
    }
    if (amt > balance) {
      toast.error(gu ? 'પૂરતું બૅલેન્સ નથી' : 'Insufficient balance')
      return
    }
    setWithdrawLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ amount: amt, upiId: upiId.trim() }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success(gu ? 'ઉપાડ વિનંતી મોકલી!' : 'Withdrawal request submitted!')
        setShowWithdraw(false)
        setUpiId('')
        setAmount('')
        await refreshProfile()
        // Refresh transactions
        const { data } = await supabase
          .from('wallet_transactions')
          .select('*')
          .order('created_at', { ascending: false })
        setTransactions((data as WalletTx[]) || [])
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch {
      toast.error(gu ? 'ભૂલ આવી' : 'Something went wrong')
    }
    setWithdrawLoading(false)
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

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-brand-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className={`text-brand-100 text-sm mb-1 ${gu ? 'font-gujarati' : ''}`}>
                {t.walletBalance}
              </p>
              <p className="font-display font-bold text-4xl">
                ₹{balance.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Wallet size={22} className="text-white" />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-brand-600 font-semibold text-sm rounded-xl hover:bg-brand-50 transition-colors"
            >
              <ArrowDownToLine size={15} />
              <span className={gu ? 'font-gujarati' : ''}>{t.withdrawToUPI}</span>
            </button>
            <Link
              href="/papers"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              <ShoppingCart size={15} />
              <span className={gu ? 'font-gujarati' : ''}>{t.useToBuy}</span>
            </Link>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 text-xs text-gray-600 shadow-sm">
            <CheckCircle2 size={13} className="text-green-500" />
            <span className={gu ? 'font-gujarati' : ''}>{t.minWithdrawal}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 text-xs text-gray-600 shadow-sm">
            <Clock size={13} className="text-amber-500" />
            <span>{gu ? 'ઉપાડ: ૧–૩ કામકાજ દિવસ' : 'Withdrawals processed in 1–3 business days'}</span>
          </div>
        </div>

        {/* Withdraw Form */}
        {showWithdraw && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={`font-display font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'UPI માં ઉપાડ' : 'Withdraw to UPI'}
              </h2>
              <button onClick={() => setShowWithdraw(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={`text-xs font-semibold text-gray-500 mb-1.5 block ${gu ? 'font-gujarati' : ''}`}>UPI ID</label>
                <input
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              <div>
                <label className={`text-xs font-semibold text-gray-500 mb-1.5 block ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? 'રકમ (ન્યૂનતમ ₹15)' : 'Amount (min ₹15)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                  <input
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    type="number"
                    min="15"
                    max={balance}
                    placeholder="15"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
                <button
                  onClick={() => setAmount(balance.toString())}
                  className="text-xs text-brand-500 mt-1 hover:underline"
                >
                  {gu ? 'બધું ઉપાડો' : 'Withdraw all'} (₹{balance.toFixed(2)})
                </button>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="btn-primary py-3 mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <ArrowDownToLine size={15} />
                {withdrawLoading ? (gu ? 'પ્રક્રિયા...' : 'Processing...') : (gu ? 'ઉપાડ વિનંતી' : 'Request Withdrawal')}
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className={`font-display font-bold text-gray-900 mb-5 ${gu ? 'font-gujarati' : ''}`}>
            {t.transactionHistory}
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <p className={`text-gray-400 text-sm ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'હજી કોઈ વ્યવહાર નથી' : 'No transactions yet'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {transactions.map(tx => {
                const label = REASON_LABEL[tx.reason || '']
                const desc = label ? (gu ? label.gu : label.en) : (tx.reason || 'Transaction')
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {tx.type === 'credit'
                        ? <ArrowUpRight size={16} className="text-green-600" />
                        : <ArrowDownToLine size={16} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-gray-800 truncate ${gu ? 'font-gujarati' : ''}`}>
                        {desc}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(tx.created_at), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <p className={`text-sm font-bold shrink-0 ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </p>
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
