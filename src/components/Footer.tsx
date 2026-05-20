'use client'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { useLang } from '@/context/LangContext'

export default function Footer() {
  const { t, lang } = useLang()
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap size={13} className="text-white fill-white" />
              </div>
              <span className="font-display font-bold text-gray-900">PapluPhysics</span>
            </div>
            <p className={`text-sm text-gray-500 leading-relaxed max-w-xs ${lang === 'gu' ? 'font-gujarati' : ''}`}>
              {lang === 'gu'
                ? 'ગુજરાત બોર્ડ, JEE, NEET અને GUJCET માટે પ્રીમિયમ ડિજિટલ પ્રશ્નપત્ર સેટ.'
                : 'Premium digital paper sets for Gujarat Board, JEE, NEET & GUJCET students.'}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-3">Quick Links</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/papers', label: t.papers },
                { href: '/dashboard', label: t.dashboard },
                { href: '/wallet', label: t.wallet },
                { href: '/referral', label: t.referral },
              ].map(l => (
                <Link key={l.href} href={l.href} className={`text-sm text-gray-500 hover:text-brand-500 transition-colors ${lang === 'gu' ? 'font-gujarati' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-3">Legal</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/privacy', label: t.privacyPolicy },
                { href: '/refund', label: t.refundPolicy },
                { href: '/terms', label: t.terms },
                { href: '/contact', label: t.contact },
              ].map(l => (
                <Link key={l.href} href={l.href} className={`text-sm text-gray-500 hover:text-brand-500 transition-colors ${lang === 'gu' ? 'font-gujarati' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Paplu Physics. {t.allRights}.</p>
          <p className="text-xs text-gray-400">Made with ❤️ for Gujarat students</p>
        </div>
      </div>
    </footer>
  )
}
