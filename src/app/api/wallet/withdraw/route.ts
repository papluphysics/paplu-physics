import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createServerClient()

    // Verify the user's JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, upiId } = body

    if (!amount || typeof amount !== 'number' || amount < 15) {
      return NextResponse.json({ success: false, error: 'Minimum withdrawal is ₹15' }, { status: 400 })
    }
    if (!upiId || typeof upiId !== 'string') {
      return NextResponse.json({ success: false, error: 'UPI ID is required' }, { status: 400 })
    }

    // Fetch current balance
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (fetchError || !userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (amount > userData.wallet_balance) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 })
    }

    // Insert withdrawal request
    const { data: withdrawal, error: withdrawError } = await supabaseAdmin
      .from('withdrawals')
      .insert({ user_id: user.id, amount, upi_id: upiId, status: 'pending' })
      .select()
      .single()

    if (withdrawError || !withdrawal) {
      return NextResponse.json({ success: false, error: 'Failed to create withdrawal' }, { status: 500 })
    }

    // Debit wallet balance
    await supabaseAdmin
      .from('users')
      .update({ wallet_balance: userData.wallet_balance - amount })
      .eq('id', user.id)

    // Log wallet transaction
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount,
        type: 'debit',
        reason: 'withdrawal',
        reference: withdrawal.id,
        status: 'pending',
      })

    return NextResponse.json({ success: true, withdrawal_id: withdrawal.id })
  } catch (err) {
    console.error('Withdraw error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
