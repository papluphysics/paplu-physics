'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Phone, MapPin, ArrowRight } from 'lucide-react'
import { STATES, DISTRICTS_BY_STATE, CITIES_BY_DISTRICT } from '@/lib/locationData'

const STORAGE_KEY = 'pp_pending_contact'

interface Props {
  open: boolean
  onClose: () => void
}

export default function PreAuthModal({ open, onClose }: Props) {
  const router = useRouter()
  const [mobile,   setMobile]   = useState('')
  const [mobileErr, setMobileErr] = useState('')
  const [state,    setState]    = useState('')
  const [district, setDistrict] = useState('')
  const [city,     setCity]     = useState('')
  const [saving,   setSaving]   = useState(false)

  // Pre-fill from previous visit if data exists in localStorage
  useEffect(() => {
    if (!open) return
    try {
      const prev = localStorage.getItem('pp_last_contact')
      if (prev) {
        const d = JSON.parse(prev)
        if (d.mobile)   setMobile(d.mobile)
        if (d.state)    setState(d.state)
        if (d.district) setDistrict(d.district)
        if (d.city)     setCity(d.city)
      }
    } catch { /* ignore */ }
  }, [open])

  const districts = state    ? (DISTRICTS_BY_STATE[state]    ?? []) : []
  const cities    = district ? (CITIES_BY_DISTRICT[district] ?? []) : []

  const handleMobileChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    setMobile(digits)
    if (digits.length > 0 && digits.length < 10) {
      setMobileErr('Mobile number must be exactly 10 digits')
    } else {
      setMobileErr('')
    }
  }

  const isValid = mobile.length === 10 && state !== ''

  const handleContinue = () => {
    if (!isValid) return
    setSaving(true)
    const contact = { mobile, state, district: district || null, city: city || null }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(contact))
      localStorage.setItem('pp_last_contact', JSON.stringify(contact))
    } catch { /* ignore */ }
    router.push('/login')
    onClose()
    setSaving(false)
  }

  const handleClose = () => {
    setMobileErr('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={17} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
                <Phone size={20} className="text-brand-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Quick details before you continue
              </h2>
              <p className="text-sm text-gray-500">
                Enter your mobile number and location to get started.
              </p>
            </div>

            {/* Mobile */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-transparent transition-all">
                <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 select-none shrink-0">
                  +91
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mobile}
                  onChange={e => handleMobileChange(e.target.value)}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                  autoFocus
                />
                {mobile.length === 10 && (
                  <span className="pr-3 text-green-500 text-xs font-bold">✓</span>
                )}
              </div>
              {mobileErr && (
                <p className="text-xs text-red-500 mt-1">{mobileErr}</p>
              )}
            </div>

            {/* Location header */}
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={13} className="text-brand-500" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Your Location
              </span>
            </div>

            {/* State */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={e => { setState(e.target.value); setDistrict(''); setCity('') }}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent pr-8 transition-all"
                >
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* District */}
            {districts.length > 0 && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">District</label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={e => { setDistrict(e.target.value); setCity('') }}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent pr-8 transition-all"
                  >
                    <option value="">Select district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* City */}
            {cities.length > 0 && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">City / Taluka</label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent pr-8 transition-all"
                  >
                    <option value="">Select city / taluka</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!isValid || saving}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
              Your details are saved to personalise your experience.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
