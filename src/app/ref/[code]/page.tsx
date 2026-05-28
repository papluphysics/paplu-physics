'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ReferralLandingPage() {
  const params = useParams()
  const router = useRouter()
  const code = typeof params.code === 'string' ? params.code : ''

  useEffect(() => {
    if (code) {
      localStorage.setItem('pendingReferralCode', code)
    }
    const timer = setTimeout(() => router.replace('/papers'), 2500)
    return () => clearTimeout(timer)
  }, [code, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">You got a special offer!</h1>
        <p className="text-gray-600 mb-6">
          Your friend shared a referral link — you&apos;ll get a{' '}
          <span className="font-semibold text-indigo-600">10% discount</span> when you use code{' '}
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {code}
          </span>{' '}
          at checkout.
        </p>
        <p className="text-sm text-gray-400">Taking you to the papers page…</p>
        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full animate-[shrink_2.5s_linear_forwards]" />
        </div>
      </div>
    </div>
  )
}
