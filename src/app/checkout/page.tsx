'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Tag, Zap, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useLang } from '@/context/LangContext'
import { useCart } from '@/lib/cartStore'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

declare global {
  interface Window { Razorpay: any }
}

export default function CheckoutPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const { items, total, hasCombo, clearCart } = useCart()
  const { profile, user } = useAuth()

  // Coupon
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponData, setCouponData] = useState<{ type: 'percent' | 'flat'; value: number } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // Referral
  const [referral, setReferral] = useState('')
  const [referralApplied, setReferralApplied] = useState(false)
  const [referralData, setReferralData] = useState<{ referrerId: string; referrerName: string; discount: number } | null>(null)
  const [referralLoading, setReferralLoading] = useState(false)

  // Wallet & payment
  const [useWallet, setUseWallet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [intentId, setIntentId] = useState<string | null>(null)

  const walletBalance = profile?.wallet_balance ?? 0
  const subtotal = total()

  // Coupon discount (applied to subtotal which already has combo applied)
  const couponDiscount = couponApplied && couponData
    ? couponData.type === 'percent'
      ? Math.floor(subtotal * couponData.value / 100)
      : Math.min(couponData.value, subtotal)
    : 0

  // Referral discount: 10% of amount after coupon
  const referralDiscount = referralApplied && referralData
    ? Math.floor((subtotal - couponDiscount) * referralData.discount / 100)
    : 0

  const afterDiscounts = subtotal - couponDiscount - referralDiscount
  const walletDeduction = useWallet ? Math.min(walletBalance, afterDiscounts) : 0
  const finalAmount = Math.max(0, afterDiscounts - walletDeduction)

  const applyCoupon = async () => {
    if (!coupon) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon }),
      })
      const json = await res.json()
      if (json.error) {
        toast.error(json.error)
      } else {
        setCouponApplied(true)
        setCouponData({ type: json.type, value: json.value })
        toast.success(json.type === 'percent' ? `${json.value}% discount applied!` : `₹${json.value} discount applied!`)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCouponLoading(false)
    }
  }

  const applyReferral = async () => {
    if (!referral) return
    if (!user) { toast.error(gu ? 'પ્રથમ લૉગ ઇન કરો' : 'Please log in first'); return }
    setReferralLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) { toast.error('Session expired. Please log in again.'); return }

      const res = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code: referral }),
      })
      const json = await res.json()
      if (json.error) {
        toast.error(json.error)
      } else {
        setReferralApplied(true)
        setReferralData({ referrerId: json.referrerId, referrerName: json.referrerName, discount: json.discount })
        toast.success(`${json.discount}% referral discount applied! Thanks to ${json.referrerName}'s code.`)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setReferralLoading(false)
    }
  }

  const handlePayment = async () => {
    if (items.length === 0) { toast.error('Cart is empty'); return }
    if (!user) { toast.error('Please log in to checkout'); return }
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token || ''

      // Step 1: Create order — server recalculates amount to prevent tampering
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: items.map(i => i.id),
          coupon: couponApplied ? coupon : null,
          referralCode: referralApplied ? referral : null,
          referrerId: referralData?.referrerId || null,
          useWallet,
        }),
      })
      const order = await orderRes.json()
      if (order.error) throw new Error(order.error)
      if (!order.id) throw new Error('Order creation failed')

      setIntentId(order.intentId || null)

      // Step 2: Open Razorpay
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: 'INR',
        name: 'Paplu Physics',
        description: `${items.length} Paper Set(s)`,
        order_id: order.id,
        prefill: {
          name: profile?.name || '',
          contact: profile?.mobile || '',
          email: profile?.email || '',
        },
        theme: { color: '#1264F0' },
        handler: async (response: any) => {
          // Step 3: Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            body: JSON.stringify({ ...response, intentId: order.intentId }),
          })
          const result = await verifyRes.json()
          if (result.success) {
            clearCart()
            toast.success(gu ? 'ચૂકવણી સફળ!' : 'Payment successful!')
            window.location.href = '/dashboard'
          } else {
            toast.error('Payment verification failed')
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || (gu ? 'ભૂલ આવી. ફરી પ્રયાસ કરો.' : 'Something went wrong. Please try again.'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/papers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={15} /> {gu ? 'પ્રશ્નપત્રો પર પાછા' : 'Back to Papers'}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left — Order summary + discounts */}
          <div className="md:col-span-3 space-y-4">
            {/* Order items */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className={`font-display font-bold text-gray-900 mb-4 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'ઓર્ડર સારાંશ' : 'Order Summary'}
              </h2>

              {hasCombo() && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  <Zap size={14} className="text-green-500 fill-green-500" />
                  <span className={gu ? 'font-gujarati' : ''}>
                    {gu ? 'કૉમ્બો ઑફર: ₹15 ની બચત!' : 'Combo offer applied! Saving ₹15'}
                  </span>
                </div>
              )}

              {items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {gu ? 'કાર્ટ ખાલી છે' : 'Your cart is empty'}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={15} className="text-brand-500" />
                <h3 className={`font-display font-semibold text-gray-900 text-sm ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? 'કૂપન કોડ' : 'Coupon Code'}
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="BOARD25"
                  disabled={couponApplied}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponApplied || !coupon || couponLoading}
                  className="btn-primary px-4 py-2.5 disabled:opacity-50 text-sm"
                >
                  {couponApplied ? '✓' : couponLoading ? '...' : (gu ? 'લગાવો' : 'Apply')}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users size={15} className="text-purple-500" />
                <h3 className={`font-display font-semibold text-gray-900 text-sm ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? 'રેફરલ કોડ' : 'Referral Code'}
                </h3>
              </div>
              <p className={`text-xs text-gray-400 mb-3 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'મિત્રના રેફરલ કોડથી 10% ડિસ્કાઉન્ટ મળે' : "Have a friend's referral code? Get 10% off!"}
              </p>
              <div className="flex gap-2">
                <input
                  value={referral}
                  onChange={e => setReferral(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  disabled={referralApplied}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                />
                <button
                  onClick={applyReferral}
                  disabled={referralApplied || !referral || referralLoading}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {referralApplied ? '✓' : referralLoading ? '...' : (gu ? 'લગાવો' : 'Apply')}
                </button>
              </div>
              {referralApplied && referralData && (
                <p className="mt-2 text-xs text-purple-600 font-medium">
                  {gu
                    ? `${referralData.referrerName} ના કોડ સાથે ${referralData.discount}% ડિસ્કાઉન્ટ!`
                    : `${referralData.discount}% off with ${referralData.referrerName}'s code!`}
                </p>
              )}
            </div>

            {/* Wallet */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={e => setUseWallet(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <div>
                  <p className={`text-sm font-semibold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'વૉલેટ બૅલેન્સ વાપરો' : 'Use Wallet Balance'}
                  </p>
                  <p className="text-xs text-gray-400">₹{walletBalance.toFixed(2)} available</p>
                </div>
              </label>
            </div>
          </div>

          {/* Right — Payment summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h2 className={`font-display font-bold text-gray-900 mb-5 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'ચૂકવણી' : 'Payment'}
              </h2>
              <div className="flex flex-col gap-2 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{gu ? 'મૂળ' : 'Subtotal'}</span>
                  <span className="font-semibold">₹{items.length * 25}</span>
                </div>
                {hasCombo() && (
                  <div className="flex justify-between text-green-600">
                    <span>{gu ? 'કૉમ્બો ડિસ્કાઉન્ટ' : 'Combo discount'}</span>
                    <span>-₹{items.length * 25 - subtotal}</span>
                  </div>
                )}
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>{coupon}</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                {referralApplied && referralData && (
                  <div className="flex justify-between text-purple-600">
                    <span>{gu ? 'રેફરલ ડિસ્કાઉન્ટ' : 'Referral discount'}</span>
                    <span>-₹{referralDiscount}</span>
                  </div>
                )}
                {useWallet && walletDeduction > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>{gu ? 'વૉલેટ' : 'Wallet'}</span>
                    <span>-₹{walletDeduction.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between font-bold text-base">
                  <span className="text-gray-900">{gu ? 'કુલ' : 'Total'}</span>
                  <span className="text-gray-900">₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || items.length === 0}
                className="w-full btn-primary py-3.5 text-base rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (gu ? 'ખોલી રહ્યા...' : 'Opening...') : (
                  <>
                    {gu ? 'Razorpay સાથે ચૂકવો' : 'Pay with Razorpay'}
                    {finalAmount === 0 && ' (Free)'}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
                <ShieldCheck size={13} className="text-green-500" />
                <span>{gu ? '100% સુરક્ષિત ચૂકવણી' : '100% Secure Payment'}</span>
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {['UPI', 'Cards', 'NetBanking', 'Wallets'].map(m => (
                  <span key={m} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] text-gray-500 font-medium">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
