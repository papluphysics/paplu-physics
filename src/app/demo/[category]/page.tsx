'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaperCard from '@/components/PaperCard'
import EarnWithPapluSection from '@/components/EarnWithPapluSection'
import { useLang } from '@/context/LangContext'
import type { Paper } from '@/lib/papers'

export default function DemoCategoryPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const params = useParams()
  const categorySlug = decodeURIComponent(params.category as string)

  const [papers, setPapers] = useState<Paper[] | null>(null)

  useEffect(() => {
    fetch('/api/demo-papers')
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
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            <span className={gu ? 'font-gujarati' : ''}>{t.categoryBackLink}</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="section-label">{gu ? 'ફ્રી ડૅમો' : 'Free Demo'}</p>
              <h1 className={`text-2xl md:text-3xl font-display font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                {displayLabel}
              </h1>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {gu ? 'સંપૂર્ણ ફ્રી' : 'Completely Free'}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Loading */}
        {filtered === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
            <Link href="/demo" className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-500 hover:underline">
              <ArrowLeft size={13} />
              <span className={gu ? 'font-gujarati' : ''}>{t.categoryBackLink}</span>
            </Link>
          </div>
        )}

        {/* Papers grid */}
        {filtered !== null && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-5">
              {filtered.length} {gu ? t.categoryPaperSets : 'free paper sets'}
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

            {/* Upsell to paid */}
            <div className="mt-12 bg-brand-500 rounded-3xl p-8 text-center text-white">
              <h2 className={`text-xl font-display font-bold mb-2 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'ડૅમો ગમ્યો? સંપૂર્ણ સેટ ₹25 માં!' : 'Liked the demo? Get the full set for ₹25!'}
              </h2>
              <p className={`text-brand-100 text-sm mb-5 ${gu ? 'font-gujarati' : ''}`}>
                {gu ? 'માત્ર ₹25 / ₹60 (કૉમ્બો) — ૬ મહિના ઍક્સેસ' : 'Just ₹25 per set / ₹60 combo — 6 months access'}
              </p>
              <Link href="/papers" className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-7 py-3 rounded-xl hover:bg-brand-50 transition-colors">
                <span className={gu ? 'font-gujarati' : ''}>{gu ? 'બધા પ્રશ્નપત્રો જુઓ' : 'Browse All Papers'}</span>
              </Link>
            </div>
          </>
        )}
      </div>

      <EarnWithPapluSection />
      <Footer />
    </div>
  )
}
