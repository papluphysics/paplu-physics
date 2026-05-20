'use client'
import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
import { useLang } from '@/context/LangContext'
import { CATEGORY_META, type Paper, type ClassLevel } from '@/lib/papers'

const CLASS_TABS: { id: ClassLevel | 'all'; label: string; labelGu: string }[] = [
  { id: 'all', label: 'All Papers', labelGu: 'બધા' },
  { id: '10',  label: 'Class 10',   labelGu: 'ધોરણ ૧૦' },
  { id: '12',  label: 'Class 12',   labelGu: 'ધોરણ ૧૨' },
]

const SUBJECT_TABS = [
  { id: 'all',     label: 'All Subjects', labelGu: 'બધા વિષય' },
  { id: 'math',    label: 'Mathematics',  labelGu: 'ગણિત' },
  { id: 'physics', label: 'Physics',      labelGu: 'ભૌતિક' },
  { id: 'general', label: 'General',      labelGu: 'સામાન્ય' },
]

export default function PapersPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [classFilter, setClassFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/papers')
      .then(r => r.json())
      .then(d => setPapers(d.data || []))
      .catch(() => setPapers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return papers.filter(p => {
      if (classFilter !== 'all' && p.classLevel !== classFilter) return false
      if (subjectFilter !== 'all' && p.subject !== subjectFilter) return false
      if (catFilter !== 'all' && p.category !== catFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const title = (gu ? p.titleGu : p.title).toLowerCase()
        if (!title.includes(q)) return false
      }
      return true
    })
  }, [papers, classFilter, subjectFilter, catFilter, search, gu])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="section-label">{gu ? 'ડિજિટલ' : 'Digital'}</p>
          <h1 className={`section-title text-3xl mt-1 mb-2 ${gu ? 'font-gujarati' : ''}`}>
            {gu ? 'પ્રશ્નપત્ર સેટ' : 'Paper Sets'}
          </h1>
          <p className={`text-sm text-gray-500 mb-6 ${gu ? 'font-gujarati' : ''}`}>
            {gu ? 'Gujarat Board, JEE, NEET અને GUJCET માટે' : 'For Gujarat Board, JEE, NEET & GUJCET'}
          </p>

          {/* Combo Banner */}
          <div className="flex items-center gap-3 p-4 bg-white border border-brand-100 rounded-2xl shadow-sm max-w-xl">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? '🎯 ₹15 બચાવો — કોઈ પણ ૩ સેટ ₹60 માં' : '🎯 Save ₹15 — Any 3 sets for ₹60'}
              </p>
              <p className={`text-xs text-gray-500 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'ત્રણ આઇટમ કાર્ટમાં ઉમેરો, ડિસ્કાઉન્ટ આપોઆપ' : 'Add 3 items to cart, discount applies automatically'}
              </p>
            </div>
            <span className="font-display font-bold text-xl text-brand-500">₹60</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className={`w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all ${gu ? 'font-gujarati' : ''}`}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={15} className="text-gray-400" />
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setCatFilter(catFilter === key ? 'all' : key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  catFilter === key ? `${meta.bg} ${meta.color}` : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {gu ? meta.labelGu : meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Class tabs */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {CLASS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setClassFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                classFilter === tab.id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              } ${gu ? 'font-gujarati' : ''}`}
            >
              {gu ? tab.labelGu : tab.label}
            </button>
          ))}
        </div>

        {/* Subject tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {SUBJECT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubjectFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                subjectFilter === tab.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              } ${gu ? 'font-gujarati' : ''}`}
            >
              {gu ? tab.labelGu : tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className={`text-sm ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'કોઈ પ્રશ્નપત્ર મળ્યા નહીં' : 'No papers found'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{filtered.length} paper sets found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => <PaperCard key={p.id} paper={p} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
