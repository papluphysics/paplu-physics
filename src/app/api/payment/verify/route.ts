import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'

const RAZORPAY_FEE_RATE = 0.02  // ~2% Razorpay fee
const REFERRER_COMMISSION_RATE = 0.20  // 20% of net amount to referrer

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate buyer
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: { user } } = await anonClient.auth.getUser(token)
    if (!user) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })

    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, intentId } = body

    // 2. Verify Razorpay signature (skip in dev if secret is placeholder)
    const secret = process.env.RAZORPAY_KEY_SECRET || ''
    const isRealPayment = secret && !secret.includes('placeholder')

    if (isRealPayment) {
      const generated = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      if (generated !== razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
      }
    }

    const db = createServerClient()

    // 3. Look up the payment intent
    if (!intentId) {
      return NextResponse.json({ success: false, error: 'Missing intent ID' }, { status: 400 })
    }

    const { data: intent } = await db
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .eq('user_id', user.id)  // must belong to this user
      .eq('status', 'pending')
      .single()

    if (!intent) {
      return NextResponse.json({ success: false, error: 'Payment intent not found or already processed' }, { status: 400 })
    }

    // 4. Record purchases — one row per paper
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 6)

    const purchaseRows = intent.items.map((paperId: string) => ({
      user_id: user.id,
      paper_id: paperId,
      amount_paid: intent.amount / intent.items.length,  // split evenly
      purchase_date: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(),
      razorpay_order_id,
      razorpay_payment_id,
    }))

    await db.from('purchases').insert(purchaseRows)

    // 5. Deduct wallet balance if used
    if (intent.wallet_deduction > 0) {
      await db.rpc('decrement_wallet', {
        user_id: user.id,
        amount: intent.wallet_deduction,
      }).catch(() => {
        // If RPC doesn't exist, do a manual update
        return db
          .from('users')
          .select('wallet_balance')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            const current = data?.wallet_balance ?? 0
            const newBalance = Math.max(0, current - intent.wallet_deduction)
            return db.from('users').update({ wallet_balance: newBalance }).eq('id', user.id)
          })
      })
    }

    // 6. Increment coupon use_count if a coupon was applied
    if (intent.coupon_code) {
      await db.rpc('increment_coupon_use', { coupon_code: intent.coupon_code })
        .catch(() => {
          // Fallback manual increment
          return db
            .from('coupons')
            .select('use_count')
            .eq('code', intent.coupon_code)
            .single()
            .then(({ data }) => {
              if (data) {
                return db.from('coupons')
                  .update({ use_count: (data.use_count || 0) + 1 })
                  .eq('code', intent.coupon_code)
              }
            })
        })
    }

    // 7. Credit referral commission and record referral
    if (intent.referrer_id && intent.referral_code) {
      // Commission = amount_paid × (1 - razorpay_fee) × 20%
      const netAmount = intent.amount * (1 - RAZORPAY_FEE_RATE)
      const commission = Math.floor(netAmount * REFERRER_COMMISSION_RATE * 100) / 100

      // Record referral
      await db.from('referrals').insert({
        referrer_id: intent.referrer_id,
        referred_id: user.id,
        commission_amount: commission,
        status: 'completed',
        purchase_date: new Date().toISOString(),
      })

      // Credit commission to referrer's wallet
      const { data: referrerData } = await db
        .from('users')
        .select('wallet_balance')
        .eq('id', intent.referrer_id)
        .single()

      if (referrerData) {
        await db.from('users').update({
          wallet_balance: (referrerData.wallet_balance ?? 0) + commission,
        }).eq('id', intent.referrer_id)
      }
    }

    // 8. Mark payment intent as completed
    await db.from('payment_intents').update({
      status: 'completed',
      razorpay_order_id,
      razorpay_payment_id,
    }).eq('id', intentId)

    return NextResponse.json({ success: true, payment_id: razorpay_payment_id })
  } catch (err: any) {
    console.error('Verify payment error:', err)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
