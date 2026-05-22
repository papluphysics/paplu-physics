'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  name: string | null
  mobile: string | null
  email: string | null
  referral_code: string
  wallet_balance: number
  is_blocked: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

function makeReferralCode(userId: string): string {
  return 'PP' + userId.replace(/-/g, '').slice(0, 6).toUpperCase()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchOrCreateProfile(authUser: User) {
    const meta = authUser.user_metadata ?? {}
    const nameFromAuth = meta.full_name || meta.name || null
    const emailFromAuth = authUser.email ?? null

    // Try to fetch existing profile
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existing) {
      // Patch any missing fields (name from Google, email, referral_code)
      const patch: Record<string, string> = {}
      if (!existing.name && nameFromAuth) patch.name = nameFromAuth
      if (!existing.email && emailFromAuth) patch.email = emailFromAuth
      if (!existing.referral_code) patch.referral_code = makeReferralCode(authUser.id)

      if (Object.keys(patch).length > 0) {
        const { data: patched } = await supabase
          .from('users')
          .update(patch)
          .eq('id', authUser.id)
          .select()
          .maybeSingle()
        setProfile((patched ?? { ...existing, ...patch }) as UserProfile)
      } else {
        setProfile(existing as UserProfile)
      }
      return
    }

    // First login — insert new profile row
    const referralCode = makeReferralCode(authUser.id)
    const { data: created, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        name: nameFromAuth,
        mobile: authUser.phone ?? null,
        email: emailFromAuth,
        referral_code: referralCode,
      })
      .select()
      .maybeSingle()

    if (created) {
      setProfile(created as UserProfile)
    } else if (error?.code === '23505') {
      // Race condition: another call already inserted — fetch existing
      const { data: fallback } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()
      if (fallback) setProfile(fallback as UserProfile)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchOrCreateProfile(u).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchOrCreateProfile(u)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchOrCreateProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
