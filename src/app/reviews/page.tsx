'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft, MessageSquarePlus, X, Send } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLang } from '@/context/LangContext'
import toast from 'react-hot-toast'

type Review = {
  id: string
  user_name: string
  city: string | null
  rating: number
  text: string
  created_at: string
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-125 focus:outline-none"
        >
          <Star
            size={26}
            fill={i <= (hovered || value) ? '#fbbf24' : 'none'}
            className={`transition-colors ${i <= (hovered || value) ? 'text-amber-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  if (months < 12) return `${months} months ago`
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`
}

export default function ReviewsPage() {
  const { lang } = useLang()
  const gu = lang === 'gu'
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', rating: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<number | 'all'>('all')

  const fetchReviews = () => {
    fetch('/api/reviews?all=1')
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => setReviews([]))
  }

  useEffect(() => { fetchReviews() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || form.text.trim().length < 10) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: form.name,
          city: form.city,
          rating: form.rating,
          text: form.text,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Review submitted! Thank you.')
        setShowModal(false)
        setForm({ name: '', city: '', rating: 5, text: '' })
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setSubmitting(false)
  }

  const filtered = reviews === null ? null : (
    filter === 'all' ? reviews : reviews.filter(r => r.rating === filter)
  )

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const ratingCounts = reviews ? [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: reviews.filter(r => r.rating === n).length,
  })) : []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-4">
            <ArrowLeft size={14} />
            {gu ? 'હોમ' : 'Back to Home'}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="section-label">{gu ? 'સમીક્ષાઓ' : 'Reviews'}</p>
              <h1 className={`text-2xl md:text-3xl font-display font-bold text-gray-900 mt-1 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'વિદ્યાર્થીઓની સમીક્ષાઓ' : 'Student Reviews'}
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-5 py-2.5 flex items-center gap-2 shrink-0"
            >
              <MessageSquarePlus size={16} />
              <span className={gu ? 'font-gujarati' : ''}>{gu ? 'સમીક્ષા લખો' : 'Write a Review'}</span>
            </button>
          </div>
        </div>

        {/* Rating summary */}
        {reviews && reviews.length > 0 && avgRating && (
          <div className="bg-brand-50 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="text-center">
              <div className="text-5xl font-display font-bold text-gray-900">{avgRating}</div>
              <div className="flex justify-center text-amber-400 my-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={16} fill={i <= Math.round(parseFloat(avgRating)) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-sm text-gray-500">{reviews.length} {gu ? 'સમીક્ષા' : 'reviews'}</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {ratingCounts.map(({ stars, count }) => (
                <button
                  key={stars}
                  onClick={() => setFilter(filter === stars ? 'all' : stars)}
                  className={`w-full flex items-center gap-2 group transition-opacity ${filter !== 'all' && filter !== stars ? 'opacity-40' : ''}`}
                >
                  <span className="text-xs text-gray-500 w-4">{stars}</span>
                  <Star size={12} fill="#fbbf24" className="text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter chips */}
        {reviews && reviews.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {(['all', 5, 4, 3, 2, 1] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filter === v
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                {v === 'all' ? (gu ? 'બધા' : 'All') : `${v} ★`}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {filtered === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((__, j) => <div key={j} className="w-3 h-3 rounded-full bg-gray-100" />)}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-2.5 bg-gray-100 rounded w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {filtered !== null && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⭐</div>
            <p className={`text-gray-600 font-medium mb-1 ${gu ? 'font-gujarati' : ''}`}>
              {filter === 'all'
                ? (gu ? 'હજી સુધી કોઈ સમીક્ષા નથી' : 'No reviews yet')
                : (gu ? `${filter} ⭐ ની કોઈ સમીક્ષા નથી` : `No ${filter}-star reviews yet`)}
            </p>
            {filter === 'all' && (
              <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3 mt-4 flex items-center gap-2 mx-auto">
                <MessageSquarePlus size={16} />
                {gu ? 'પ્રથમ સમીક્ષા આપો' : 'Be the first to review'}
              </button>
            )}
          </div>
        )}

        {/* Reviews grid */}
        {filtered !== null && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="card p-5 bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} fill={j < r.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                    {r.user_name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.user_name}</p>
                    {r.city && <p className="text-xs text-gray-400">{r.city}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Write Review Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className={`text-lg font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                    {gu ? 'તમારો અનુભવ શેર કરો' : 'Share Your Experience'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {gu ? 'તમારી સમીક્ષા અન્ય વિદ્યાર્થીઓને મદદ કરે છે' : 'Your review helps other students choose wisely'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{gu ? 'નામ *' : 'Your Name *'}</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input"
                      placeholder={gu ? 'રાજ પટેલ' : 'Raj Patel'}
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">{gu ? 'શહેર' : 'City'}</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="input"
                      placeholder={gu ? 'અમદાવાદ' : 'Ahmedabad'}
                      maxLength={30}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{gu ? 'રેટિંગ *' : 'Rating *'}</label>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>

                <div>
                  <label className="label">{gu ? 'સમીક્ષા *' : 'Your Review *'}</label>
                  <textarea
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    className="input resize-none"
                    rows={4}
                    placeholder={gu ? 'Paplu Physics કેવી રીતે મદદ કરી...' : 'Share how Paplu Physics helped you...'}
                    minLength={10}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.text.length}/500
                    {form.text.length > 0 && form.text.length < 10 && (
                      <span className="text-rose-400 ml-2">{10 - form.text.length} more needed</span>
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.name.trim() || form.text.trim().length < 10}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {gu ? 'સબમિટ...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {gu ? 'સમીક્ષા સબમિટ કરો' : 'Submit Review'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
