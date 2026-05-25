'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, FileText, BookOpen, Beaker } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLang } from '@/context/LangContext'

type DemoPaper = {
  id: string
  title: string
  title_gu: string | null
  description: string | null
  description_gu: string | null
  subject: string
  class_level: string
  pdf_url: string
  created_at: string
}

const SUBJECT_ICONS: Record<string, { icon: string; label: string; labelGu: string; color: string }> = {
  math:    { icon: '📐', label: 'Mathematics', labelGu: 'ગણિત',         color: 'bg-blue-50 border-blue-100 text-blue-700' },
  physics: { icon: '⚛️', label: 'Physics',      labelGu: 'ભૌતિક વિજ્ઞાન', color: 'bg-purple-50 border-purple-100 text-purple-700' },
  general: { icon: '📋', label: 'General',      labelGu: 'સામાન્ય',       color: 'bg-green-50 border-green-100 text-green-700' },
}

export default function DemoPage() {
  const { lang } = useLang()
  const gu = lang === 'gu'
  const [papers, setPapers] = useState<DemoPaper[] | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/demo-papers')
      .then(r => r.json())
      .then(d => setPapers(d.data || []))
      .catch(() => setPapers([]))
  }, [])

  const filtered = papers === null ? null : (
    filter === 'all' ? papers : papers.filter(p => p.subject === filter)
  )

  const filters = [
    { id: 'all', label: 'All', labelGu: 'બધા' },
    { id: '10',  label: 'Class 10', labelGu: 'ધોરણ ૧૦',     isClass: true },
    { id: '12',  label: 'Class 12', labelGu: 'ધોરણ ૧૨',     isClass: true },
    { id: 'math',    label: 'Maths',   labelGu: 'ગણિત' },
    { id: 'physics', label: 'Physics', labelGu: 'ભૌતિક' },
  ]

  const filteredByClass = (items: DemoPaper[]) => {
    if (filter === '10') return items.filter(p => p.class_level === '10')
    if (filter === '12') return items.filter(p => p.class_level === '12')
    if (filter === 'math' || filter === 'physics') return items.filter(p => p.subject === filter)
    return items
  }

  const displayPapers = papers === null ? null : filteredByClass(papers)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-5">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="section-label">{gu ? 'ફ્રી' : 'Free'}</p>
              <h1 className={`text-2xl md:text-3xl font-display font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'ડૅમો પ્રશ્નપત્રો' : 'Demo Papers'}
              </h1>
            </div>
          </div>
          <p className={`text-sm text-gray-500 max-w-lg leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
            {gu
              ? 'ખરીદી પહેલા ચકાસો — આ ડૅમો પ્રશ્નપત્રો સંપૂર્ણ ફ્રી છે. ડાઉનલોડ કરો અને ગુણવત્તા ચકાસો.'
              : 'Try before you buy — these demo papers are completely free. Download and check quality before purchasing any set.'}
          </p>

          {/* Free badge */}
          <div className="mt-5 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {gu ? 'સંપૂર્ણ ફ્રી — કોઈ ચૂકવણી નહીં, કોઈ નોંધણી નહીં' : 'Completely Free — No payment, no signup required'}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filter === f.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
              } ${gu ? 'font-gujarati' : ''}`}
            >
              {gu ? f.labelGu : f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {displayPapers === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {displayPapers !== null && displayPapers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className={`text-gray-600 font-medium mb-1 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'હજી સુધી કોઈ ડૅમો પ્રશ્નપત્ર ઉમેર્યા નથી' : 'No demo papers added yet'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {gu ? 'ટૂંક સમયમાં ઉપલબ્ધ થશે' : 'Check back soon — coming shortly'}
            </p>
          </div>
        )}

        {/* Papers grid */}
        {displayPapers !== null && displayPapers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayPapers.map((paper, i) => {
              const subj = SUBJECT_ICONS[paper.subject] || SUBJECT_ICONS.general
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="card p-5 flex flex-col gap-3 relative overflow-hidden group"
                >
                  {/* Free tag */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
                  </div>

                  {/* Icon + badges */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">
                      {subj.icon}
                    </div>
                    <div className="flex flex-col gap-1 pt-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border w-fit ${subj.color}`}>
                        {gu ? subj.labelGu : subj.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {paper.class_level === '10' ? (gu ? 'ધોરણ ૧૦' : 'Class 10') : (gu ? 'ધોરણ ૧૨' : 'Class 12')}
                      </span>
                    </div>
                  </div>

                  {/* Title + desc */}
                  <div>
                    <h3 className={`font-display font-bold text-gray-900 text-[15px] leading-tight mb-1 pr-10 ${gu ? 'font-gujarati' : ''}`}>
                      {gu && paper.title_gu ? paper.title_gu : paper.title}
                    </h3>
                    {(gu ? paper.description_gu : paper.description) && (
                      <p className={`text-xs text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                        {gu && paper.description_gu ? paper.description_gu : paper.description}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-display font-bold text-green-600">Free</span>
                      <span className="text-xs text-gray-400 line-through">₹25</span>
                    </div>
                    <a
                      href={paper.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all active:scale-95"
                    >
                      <Download size={14} />
                      <span className={gu ? 'font-gujarati' : ''}>{gu ? 'ડાઉનલોડ' : 'Download'}</span>
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* CTA to buy full sets */}
        {displayPapers !== null && displayPapers.length > 0 && (
          <div className="mt-12 bg-brand-500 rounded-3xl p-8 text-center text-white">
            <h2 className={`text-xl font-display font-bold mb-2 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'ડૅમો ગમ્યો? સંપૂર્ણ સેટ ₹25 માં!' : 'Liked the demo? Get the full set for ₹25!'}
            </h2>
            <p className={`text-brand-100 text-sm mb-5 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'માત્ર ₹25 / ₹60 (કૉમ્બો) — ૬ મહિના ઍક્સેસ' : 'Just ₹25 per set / ₹60 combo deal — 6 months access'}
            </p>
            <Link href="/papers" className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-7 py-3 rounded-xl hover:bg-brand-50 transition-colors">
              <span className={gu ? 'font-gujarati' : ''}>{gu ? 'બધા પ્રશ્નપત્રો જુઓ' : 'Browse All Papers'}</span>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
