'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
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
  // Location fields — populated after student sets their location via LocationPickerModal
  state:    string | null
  district: string | null
  city:     string | null
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

// Use the token from the EXISTING session — never call getSession() again inside
async function loadProfile(token: string, setProfile: (p: UserProfile) => void) {
  try {
    const res = await fetch('/api/profile/ensure', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const { profile } = await res.json()
      if (profile) setProfile(profile as UserProfile)
    }
  } catch (err) {
    console.error('Profile load error:', err)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.access_token) {
        setUser(session.user)
        loadProfile(session.access_token, setProfile).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        if (session?.user && session.access_token) {
          setUser(session.user)
          // Token is right here — no second getSession() call needed
          loadProfile(session.access_token, setProfile)
          // On fresh sign-in, flush any pre-auth contact data collected before login
          if (_event === 'SIGNED_IN') {
            try {
              const raw = sessionStorage.getItem('pp_pending_contact')
              if (raw) {
                const contact = JSON.parse(raw)
                fetch('/api/profile/contact', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify(contact),
                }).finally(() => sessionStorage.removeItem('pp_pending_contact'))
              }
            } catch { /* sessionStorage unavailable (SSR) or malformed JSON */ }
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      await loadProfile(session.access_token, setProfile)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
