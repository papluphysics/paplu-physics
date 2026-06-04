'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { STATES, DISTRICTS_BY_STATE, CITIES_BY_DISTRICT } from '@/lib/locationData'

const SESSION_KEY = 'loc_picker_dismissed'

export default function LocationPickerModal() {
  const { profile, refreshProfile } = useAuth()
  const [visible,   setVisible]   = useState(false)
  const [state,     setState]     = useState('')
  const [district,  setDistrict]  = useState('')
  const [city,      setCity]      = useState('')
  const [saving,    setSaving]    = useState(false)

  // Show modal once when user is logged in without a saved state,
  // unless they've already dismissed it this session.
  useEffect(() => {
    if (profile && !profile.state) {
      try {
        if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true)
      } catch {
        setVisible(true)
      }
    }
  }, [profile])

  const districts = state ? (DISTRICTS_BY_STATE[state] ?? []) : []
  const cities    = district ? (CITIES_BY_DISTRICT[district] ?? []) : []

  const dismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* */ }
    setVisible(false)
  }

  const handleSave = async () => {
    if (!state) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { dismiss(); return }
      const res = await fetch('/api/profile/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ state, district: district || null, city: city || null }),
      })
      if (res.ok) {
        await refreshProfile()
        setVisible(false)
      } else {
        dismiss()
      }
    } catch {
      dismiss()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && dismiss()}
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
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={17} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-brand-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Where are you from?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Helps us show relevant local offers</p>
              </div>
            </div>

            {/* State */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">State *</label>
              <div className="relative">
                <select
                  value={state}
                  onChange={e => { setState(e.target.value); setDistrict(''); setCity('') }}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent pr-8"
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
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent pr-8"
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
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent pr-8"
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
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSave}
                disabled={!state || saving}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
