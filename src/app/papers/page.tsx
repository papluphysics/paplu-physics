'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Atom, Cpu, Heart, GraduationCap, Star, FileText, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EarnWithPapluSection from '@/components/EarnWithPapluSection'
import { useLang } from '@/context/LangContext'
import type { Paper } from '@/lib/papers'

// ── Category icon mapping ────────────────────────────────────────────────────
function CategoryIcon({ label, className }: { label: string; className?: string }) {
  const l = label.toLowerCase()
  const cls = className ?? 'w-10 h-10'
  if (l.includes('10'))    return <BookOpen className={cls} />
  if (l.includes('12'))    return <Atom className={cls} />
  if (l.includes('jee'))   return <Cpu className={cls} />
  if (l.includes('neet'))  return <Heart className={cls} />
  if (l.includes('gate'))  return <GraduationCap className={cls} />
  if (l.includes('gujcet')) return <Star className={cls} />
  return <FileText className={cls} />
}

function categoryColor(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('10'))    return 'bg-blue-50 border-blue-100 text-blue-500'
  if (l.includes('12'))    return 'bg-purple-50 border-purple-100 text-purple-500'
  if (l.includes('jee'))   return 'bg-amber-50 border-amber-100 text-amber-500'
  if (l.includes('neet'))  return 'bg-rose-50 border-rose-100 text-rose-500'
  if (l.includes('gate'))  return 'bg-green-50 border-green-100 text-green-500'
  if (l.includes('gujcet')) return 'bg-cyan-50 border-cyan-100 text-cyan-500'
  return 'bg-gray-50 border-gray-200 text-gray-500'
}

export default function PapersPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const [papers, setPapers] = useState<Paper[] | null>(null)

  useEffect(() => {
    fetch('/api/papers')
      .then(r => r.json())
      .then(d => setPapers(d.data || []))
      .catch(() => setPapers([]))
  }, [])

  // Derive distinct categories from DB data — dynamic, never hardcoded
  const categories = useMemo(() => {
    if (!papers) return []
    const map = new Map<string, number>()
    for (const p of papers) {
      map.set(p.classLevel, (map.get(p.classLevel) || 0) + 1)
    }
    return [...map.entries()].map(([label, count]) => ({ label, count }))
  }, [papers])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          <p className="section-label">{gu ? 'ડિજિટલ' : 'Digital'}</p>
          <h1 className={`section-title text-2xl md:text-3xl mt-1 mb-2 ${gu ? 'font-gujarati' : ''}`}>
            {t.papersLandingTitle}
          </h1>
          <p className={`text-sm text-gray-500 mb-6 ${gu ? 'font-gujarati' : ''}`}>
            {t.papersLandingSub}
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

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Loading */}
        {papers === null && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {papers !== null && categories.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className={`text-gray-600 font-medium ${gu ? 'font-gujarati' : ''}`}>{t.noCategories}</p>
          </div>
        )}

        {/* Category grid */}
        {categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <Link
                  href={`/papers/${encodeURIComponent(cat.label)}`}
                  className="group flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
                >
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${categoryColor(cat.label)}`}>
                    <CategoryIcon label={cat.label} className="w-8 h-8" />
                  </div>
                  <div>
                    <p className={`font-display font-bold text-gray-900 text-base leading-tight mb-1 ${gu ? 'font-gujarati' : ''}`}>
                      {gu && cat.label.match(/^\d+$/) ? `ધોરણ ${cat.label}` : cat.label}
                    </p>
                    <p className={`text-xs text-gray-400 ${gu ? 'font-gujarati' : ''}`}>
                      {cat.count} {gu ? t.categoryPaperSets : 'paper sets'}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <EarnWithPapluSection />
      <Footer />
    </div>
  )
}
