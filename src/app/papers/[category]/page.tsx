'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
import EarnWithPapluSection from '@/components/EarnWithPapluSection'
import { useLang } from '@/context/LangContext'
import type { Paper } from '@/lib/papers'

export default function PapersCategoryPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const params = useParams()
  const categorySlug = decodeURIComponent(params.category as string)

  const [papers, setPapers] = useState<Paper[] | null>(null)

  useEffect(() => {
    fetch('/api/papers')
      .then(r => r.json())
      .then(d => setPapers(d.data || []))
      .catch(() => setPapers([]))
  }, [])

  const filtered = useMemo(() => {
    if (!papers) return null
    return papers.filter(p => p.classLevel.toLowerCase() === categorySlug.toLowerCase())
  }, [papers, categorySlug])

  const displayLabel = gu && categorySlug.match(/^\d+$/)
    ? `ધોરણ ${categorySlug}`
    : categorySlug

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-10">
          <Link
            href="/papers"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            <span className={gu ? 'font-gujarati' : ''}>{t.categoryBackLink}</span>
          </Link>

          <h1 className={`section-title text-2xl md:text-3xl mb-2 ${gu ? 'font-gujarati' : ''}`}>
            {displayLabel}
          </h1>
          <p className={`text-sm text-gray-500 ${gu ? 'font-gujarati' : ''}`}>
            {t.papersLandingSub}
          </p>

          {/* Combo banner */}
          <div className="mt-5 flex items-center gap-3 p-4 bg-white border border-brand-100 rounded-2xl shadow-sm max-w-xl">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <p className={`text-sm font-semibold text-gray-800 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? '🎯 ₹15 બચાવો — કોઈ પણ ૩ સેટ ₹60 માં' : '🎯 Save ₹15 — Any 3 sets for ₹60'}
            </p>
            <span className="ml-auto font-display font-bold text-brand-500 text-lg shrink-0">₹60</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Loading */}
        {filtered === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {filtered !== null && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className={`text-gray-600 font-medium mb-1 ${gu ? 'font-gujarati' : ''}`}>
              {t.noPapersInCategory}
            </p>
            <Link href="/papers" className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-500 hover:underline">
              <ArrowLeft size={13} />
              <span className={gu ? 'font-gujarati' : ''}>{t.categoryBackLink}</span>
            </Link>
          </div>
        )}

        {/* Papers grid */}
        {filtered !== null && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-5">
              {filtered.length} {gu ? t.categoryPaperSets : 'paper sets'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <PaperCard paper={p} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <EarnWithPapluSection />
      <Footer />
    </div>
  )
}
