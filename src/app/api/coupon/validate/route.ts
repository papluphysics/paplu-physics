import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  const db = createServerClient()
  const { data: coupon, error } = await db
    .from('coupons')
    .select('id, code, type, value, max_uses, use_count, expiry_date, is_active')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (error || !coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
  if (!coupon.is_active) return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 })
  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  }
  if (coupon.max_uses && coupon.use_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
  }

  return NextResponse.json({ valid: true, type: coupon.type, value: coupon.value, code: coupon.code })
}
