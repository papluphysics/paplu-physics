import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'

const SINGLE_PRICE = 25
const COMBO_PRICE = 60

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate buyer
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: { user } } = await anonClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const body = await req.json()
    const { items, coupon, referralCode, referrerId, useWallet } = body

    if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 })

    const db = createServerClient()

    // 2. Fetch paper prices from DB (don't trust client prices)
    const { data: papers } = await db
      .from('papers')
      .select('id, price, is_active')
      .in('id', items)
      .eq('is_active', true)

    if (!papers || papers.length !== items.length) {
      return NextResponse.json({ error: 'One or more papers are unavailable' }, { status: 400 })
    }

    // 3. Calculate subtotal with combo logic
    const count = papers.length
    const subtotal = count >= 3
      ? COMBO_PRICE + Math.max(0, count - 3) * SINGLE_PRICE
      : count * SINGLE_PRICE

    let afterDiscounts = subtotal

    // 4. Validate & apply coupon server-side
    let couponRecord: { type: string; value: number } | null = null
    if (coupon) {
      const { data: c } = await db
        .from('coupons')
        .select('type, value, max_uses, use_count, expiry_date, is_active')
        .eq('code', coupon.toUpperCase().trim())
        .single()

      if (c && c.is_active &&
        (!c.expiry_date || new Date(c.expiry_date) >= new Date()) &&
        (!c.max_uses || c.use_count < c.max_uses)) {
        couponRecord = { type: c.type, value: c.value }
        const couponDiscount = c.type === 'percent'
          ? Math.floor(afterDiscounts * c.value / 100)
          : Math.min(c.value, afterDiscounts)
        afterDiscounts -= couponDiscount
      }
    }

    // 5. Validate & apply referral code server-side
    let validatedReferrerId: string | null = null
    if (referralCode && referrerId) {
      const { data: referrer } = await db
        .from('users')
        .select('id, referral_code')
        .eq('referral_code', referralCode.toUpperCase().trim())
        .eq('id', referrerId)
        .single()

      // Must match both code AND referrerId to prevent code substitution attacks
      if (referrer && referrer.id !== user.id) {
        // Check buyer hasn't already used a referral code
        const { count: usedCount } = await db
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .eq('referred_id', user.id)
          .eq('status', 'completed')

        if ((usedCount ?? 0) === 0) {
          const referralDiscount = Math.floor(afterDiscounts * 10 / 100)
          afterDiscounts -= referralDiscount
          validatedReferrerId = referrer.id
        }
      }
    }

    // 6. Apply wallet deduction (capped at afterDiscounts)
    let walletDeduction = 0
    if (useWallet) {
      const { data: buyerProfile } = await db
        .from('users')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()

      const walletBalance = buyerProfile?.wallet_balance ?? 0
      walletDeduction = Math.min(walletBalance, afterDiscounts)
      afterDiscounts -= walletDeduction
    }

    const finalAmount = Math.max(0, afterDiscounts)

    // 7. Store payment intent in Supabase so verify can look it up securely
    const { data: intent } = await db
      .from('payment_intents')
      .insert({
        user_id: user.id,
        items,
        subtotal,
        coupon_code: couponRecord ? coupon : null,
        referral_code: validatedReferrerId ? referralCode : null,
        referrer_id: validatedReferrerId,
        wallet_deduction: walletDeduction,
        amount: finalAmount,
        status: 'pending',
      })
      .select('id')
      .single()

    const intentId = intent?.id || null

    // 8. Create Razorpay order
    const amountInPaise = Math.round(finalAmount * 100)

    if (process.env.RAZORPAY_KEY_SECRET && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
        !process.env.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      const Razorpay = require('razorpay')
      const rzp = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
      const order = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `pp_${Date.now()}`,
        notes: { intentId: intentId || '', userId: user.id, items: items.join(',') },
      })

      // Update intent with razorpay_order_id
      if (intentId) {
        await db.from('payment_intents').update({ razorpay_order_id: order.id }).eq('id', intentId)
      }

      return NextResponse.json({ id: order.id, amount: order.amount, currency: 'INR', intentId })
    }

    // Placeholder for development (Razorpay not yet configured)
    const placeholderOrderId = `order_dev_${Date.now()}`
    if (intentId) {
      await db.from('payment_intents').update({ razorpay_order_id: placeholderOrderId }).eq('id', intentId)
    }
    return NextResponse.json({
      id: placeholderOrderId,
      amount: amountInPaise,
      currency: 'INR',
      intentId,
    })
  } catch (err: any) {
    console.error('Create order error:', err)
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }
}
