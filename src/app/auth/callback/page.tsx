'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (code) {
      // PKCE flow — used by Google OAuth and email magic links
      supabase.auth.exchangeCodeForSession(code).then(({ error: e }) => {
        if (e) router.replace('/login')
        else router.replace('/dashboard')
      })
    } else {
      // Hash-based implicit flow — Supabase handles it automatically
      // Just wait for the onAuthStateChange to fire, then redirect
      supabase.auth.getSession().then(({ data: { session } }) => {
        router.replace(session ? '/dashboard' : '/login')
      })
    }
  }, [router, searchParams])

  return null
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
