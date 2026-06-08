'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, Link2, Share2, Wallet, PlayCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const STEPS = [
  { icon: UserPlus,  titleKey: 'earnStep1Title' as const, descKey: 'earnStep1Desc' as const, color: 'bg-brand-50 text-brand-500 border-brand-100' },
  { icon: Link2,     titleKey: 'earnStep2Title' as const, descKey: 'earnStep2Desc' as const, color: 'bg-purple-50 text-purple-500 border-purple-100' },
  { icon: Share2,    titleKey: 'earnStep3Title' as const, descKey: 'earnStep3Desc' as const, color: 'bg-green-50 text-green-500 border-green-100' },
  { icon: Wallet,    titleKey: 'earnStep4Title' as const, descKey: 'earnStep4Desc' as const, color: 'bg-amber-50 text-amber-500 border-amber-100' },
]

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
  } catch { /* invalid URL */ }
  return null
}

export default function EarnWithPapluSection() {
  const { t, lang } = useLang()
  const gu = lang === 'gu'
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setVideoUrl(d.data?.demo_video_url || null))
      .catch(() => {})
  }, [])

  const ytId = videoUrl ? youtubeId(videoUrl) : null
  const isYoutube = !!ytId

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <p className="section-label mb-2">{gu ? 'રેફરલ' : 'Referral'}</p>
            <h2 className={`section-title text-2xl md:text-3xl mb-3 ${gu ? 'font-gujarati' : ''}`}>
              {t.earnTitle}
            </h2>
            <p className={`text-sm text-gray-500 max-w-lg mx-auto leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
              {t.earnSub}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className={`text-sm font-bold text-gray-900 ${gu ? 'font-gujarati' : ''}`}>
                      {t[step.titleKey]}
                    </p>
                  </div>
                  <p className={`text-xs text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
                    {t[step.descKey]}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Video block — only shown when admin has set a URL */}
          {videoUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <PlayCircle size={16} className="text-brand-500" />
                <span className={`text-sm font-semibold text-gray-800 ${gu ? 'font-gujarati' : ''}`}>
                  {t.earnVideoTitle}
                </span>
              </div>
              {isYoutube ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={t.earnVideoTitle}
                  />
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center gap-3 bg-gray-50">
                  <PlayCircle size={40} className="text-brand-400" />
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors"
                  >
                    <span className={gu ? 'font-gujarati' : ''}>{t.earnVideoBtn}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/referral"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors shadow-sm"
            >
              <span className={gu ? 'font-gujarati' : ''}>{t.earnCta}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
