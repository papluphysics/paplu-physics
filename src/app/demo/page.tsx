'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Atom, Cpu, Heart, GraduationCap, Star, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EarnWithPapluSection from '@/components/EarnWithPapluSection'
import { useLang } from '@/context/LangContext'
import type { Paper } from '@/lib/papers'

// ── Category icon helpers (same as /papers) ──────────────────────────────────
function CategoryIcon({ label, className }: { label: string; className?: string }) {
  const l = label.toLowerCase()
  const cls = className ?? 'w-10 h-10'
  if (l.includes('10'))     return <BookOpen className={cls} />
  if (l.includes('12'))     return <Atom className={cls} />
  if (l.includes('jee'))    return <Cpu className={cls} />
  if (l.includes('neet'))   return <Heart className={cls} />
  if (l.includes('gate'))   return <GraduationCap className={cls} />
  if (l.includes('gujcet')) return <Star className={cls} />
  return <FileText className={cls} />
}

function categoryColor(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('10'))     return 'bg-blue-50 border-blue-100 text-blue-500'
  if (l.includes('12'))     return 'bg-purple-50 border-purple-100 text-purple-500'
  if (l.includes('jee'))    return 'bg-amber-50 border-amber-100 text-amber-500'
  if (l.includes('neet'))   return 'bg-rose-50 border-rose-100 text-rose-500'
  if (l.includes('gate'))   return 'bg-green-50 border-green-100 text-green-500'
  if (l.includes('gujcet')) return 'bg-cyan-50 border-cyan-100 text-cyan-500'
  return 'bg-gray-50 border-gray-200 text-gray-500'
}

export default function DemoPage() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const [papers, setPapers] = useState<Paper[] | null>(null)

  useEffect(() => {
    fetch('/api/demo-papers')
      .then(r => r.json())
      .then(d => setPapers(d.data || []))
      .catch(() => setPapers([]))
  }, [])

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

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-5">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="section-label">{gu ? 'ફ્રી' : 'Free'}</p>
              <h1 className={`text-2xl md:text-3xl font-display font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                {t.demoLandingTitle}
              </h1>
            </div>
          </div>
          <p className={`text-sm text-gray-500 max-w-lg leading-relaxed mb-5 ${gu ? 'font-gujarati' : ''}`}>
            {t.demoLandingSub}
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {gu ? 'સંપૂર્ણ ફ્રી — કોઈ ચૂકવણી નહીં' : 'Completely Free — No payment required'}
          </div>
        </div>
      </section>

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
            <p className={`text-gray-600 font-medium mb-1 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'હજી સુધી કોઈ ડૅમો પ્રશ્નપત્ર ઉમેર્યા નથી' : 'No demo papers added yet'}
            </p>
            <p className={`text-sm text-gray-400 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? 'ટૂંક સમયમાં ઉપલબ્ધ' : 'Check back soon — coming shortly'}
            </p>
            <Link href="/papers" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
              {gu ? 'બધા પ્રશ્નપત્ર જુઓ' : 'Browse All Papers'}
            </Link>
          </div>
        )}

        {/* Category grid */}
        {categories.length > 0 && (
          <>
            <p className={`text-xs text-gray-400 mb-6 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? t.papersLandingSub : 'Choose a category to view free demo papers'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <Link
                    href={`/demo/${encodeURIComponent(cat.label)}`}
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
                        {cat.count} {gu ? t.categoryPaperSets : 'free paper sets'}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA to paid papers */}
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
          </>
        )}
      </div>

      <EarnWithPapluSection />
      <Footer />
    </div>
  )
}
