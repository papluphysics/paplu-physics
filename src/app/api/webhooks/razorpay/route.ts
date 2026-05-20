import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

  // Verify webhook signature
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (expected !== signature && secret !== '') {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    console.log('Payment captured:', payment.id, '₹', payment.amount / 100)

    // TODO: After Supabase connected:
    // - Mark purchase as confirmed
    // - Send confirmation notification
    // - Credit referral commissions
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    console.log('Payment failed:', payment.id)
    // TODO: Mark order as failed in DB
  }

  return NextResponse.json({ received: true })
}
