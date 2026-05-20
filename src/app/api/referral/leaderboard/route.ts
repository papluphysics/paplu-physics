import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function anonymizeName(name: string | null, mobile: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0]} ${parts[1][0]}.`
    return parts[0]
  }
  if (mobile) {
    const digits = mobile.replace('+91', '').replace(/\D/g, '')
    return `****${digits.slice(-4)}`
  }
  return 'Anonymous'
}

export async function GET() {
  try {
    const supabaseAdmin = createServerClient()

    // Fetch all paid referrals
    const { data: referrals } = await supabaseAdmin
      .from('referrals')
      .select('referrer_id, commission_amount')
      .eq('status', 'paid')

    if (!referrals || referrals.length === 0) {
      return NextResponse.json({ entries: [] })
    }

    // Aggregate by referrer_id in JS
    const byReferrer = new Map<string, { earned: number; refs: number }>()
    for (const r of referrals) {
      const cur = byReferrer.get(r.referrer_id) || { earned: 0, refs: 0 }
      byReferrer.set(r.referrer_id, {
        earned: cur.earned + (r.commission_amount || 0),
        refs: cur.refs + 1,
      })
    }

    // Sort and take top 10
    const sorted = [...byReferrer.entries()]
      .sort((a, b) => b[1].earned - a[1].earned)
      .slice(0, 10)

    const topIds = sorted.map(([id]) => id)

    // Fetch user profiles
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, mobile')
      .in('id', topIds)

    const userMap = new Map((users || []).map(u => [u.id, u]))

    const entries = sorted.map(([id, stats], idx) => {
      const u = userMap.get(id)
      const displayName = anonymizeName(u?.name || null, u?.mobile || null)
      return {
        rank: idx + 1,
        name: displayName,
        city: '',
        earned: stats.earned,
        refs: stats.refs,
        initials: initials(displayName),
        isMe: false,
      }
    })

    return NextResponse.json({ entries })
  } catch (err) {
    console.error('Leaderboard error:', err)
    return NextResponse.json({ entries: [] })
  }
}
