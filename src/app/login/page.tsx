'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Step = 'choose' | 'email' | 'otp'

function LoginInner() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('choose')
  const [email, setEmail] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err) toast.error(decodeURIComponent(err))
  }, [searchParams])

  const sendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error(gu ? 'માન્ય ઇમેઇલ દાખલ કરો' : 'Enter a valid email address')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setOtpValue('')
    setStep('otp')
  }

  const doVerify = async () => {
    const code = otpValue.trim()
    if (code.length < 6) {
      toast.error(gu ? 'OTP કોડ દાખલ કરો' : 'Enter the OTP code')
      return
    }
    setVerifying(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'email',
    })
    setVerifying(false)
    if (error) {
      toast.error(gu ? 'ખોટો કોડ. ફરી પ્રયાસ કરો.' : 'Wrong code. Try again.')
      setOtpValue('')
    } else {
      router.replace('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={13} className="text-white fill-white" />
          </div>
          <span className="font-display font-bold text-gray-900">PapluPhysics</span>
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Back
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8">

            {step === 'choose' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap size={24} className="text-brand-500" />
                  </div>
                  <h1 className={`font-display font-bold text-2xl text-gray-900 mb-1 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'સ્વાગત છે' : 'Welcome back'}
                  </h1>
                  <p className={`text-sm text-gray-500 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'આગળ ચાલુ રાખવા લૉગિન કરો' : 'Login to access your papers'}
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
                    </svg>
                  )}
                  <span className={gu ? 'font-gujarati' : ''}>
                    {googleLoading ? (gu ? 'રીડાયરેક્ટ...' : 'Redirecting...') : t.googleLogin}
                  </span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className={`text-xs text-gray-400 ${gu ? 'font-gujarati' : ''}`}>{t.orLoginWith}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <button
                  onClick={() => setStep('email')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-brand-500 rounded-2xl font-semibold text-white hover:bg-brand-600 transition-all text-sm"
                >
                  <Mail size={16} />
                  <span className={gu ? 'font-gujarati' : ''}>{gu ? 'ઇમેઇલ OTP દ્વારા લૉગિન' : 'Login with Email OTP'}</span>
                </button>

                <p className={`text-center text-xs text-gray-400 mt-5 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                  {gu ? 'લૉગિન કરીને તમે અમારી સેવાની શરતો સ્વીકારો છો' : 'By logging in you agree to our Terms of Use & Privacy Policy'}
                </p>
              </>
            )}

            {step === 'email' && (
              <>
                <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} className="text-brand-500" />
                  </div>
                  <h2 className={`font-display font-bold text-xl text-gray-900 mb-1 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'ઇમેઇલ સરનામું' : 'Email Address'}
                  </h2>
                  <p className={`text-sm text-gray-500 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'અમે 6 અંકનો OTP કોડ મોકલીશું' : "We'll send a 6-digit OTP to your email"}
                  </p>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm outline-none focus:border-brand-400 transition-colors mb-4"
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  autoFocus
                />
                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-2xl text-sm disabled:opacity-60"
                >
                  {loading ? (gu ? 'OTP મોકલી રહ્યા...' : 'Sending OTP...') : (gu ? 'OTP મોકલો' : 'Send OTP')}
                </button>
              </>
            )}

            {step === 'otp' && (
              <>
                <button onClick={() => setStep('email')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={20} className="text-green-500" />
                  </div>
                  <h2 className={`font-display font-bold text-xl text-gray-900 mb-1 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'OTP દાખલ કરો' : 'Enter OTP'}
                  </h2>
                  <p className={`text-sm text-gray-500 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? `${email} પર OTP કોડ મોકલ્યો` : `OTP code sent to ${email}`}
                  </p>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && doVerify()}
                  placeholder={gu ? 'OTP કોડ અહીં લખો' : 'Paste OTP code here'}
                  disabled={verifying}
                  autoFocus
                  className="w-full text-center text-2xl font-bold tracking-widest px-4 py-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-brand-400 transition-colors mb-4 disabled:opacity-50"
                />

                <button
                  onClick={doVerify}
                  disabled={verifying || otpValue.length < 6}
                  className="w-full btn-primary py-3 rounded-2xl text-sm disabled:opacity-60 mb-3"
                >
                  {verifying
                    ? (gu ? 'ચકાસી રહ્યા...' : 'Verifying...')
                    : (gu ? 'OTP ચકાસો' : 'Verify OTP')}
                </button>

                <button
                  onClick={sendOtp}
                  disabled={loading || verifying}
                  className="w-full text-sm text-brand-500 hover:underline disabled:opacity-50"
                >
                  {loading ? (gu ? 'મોકલી રહ્યા...' : 'Sending...') : (gu ? 'ફરી OTP મોકલો' : 'Resend OTP')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}
