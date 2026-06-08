'use client'
import { ShoppingCart, Check, FileText, ClipboardList } from 'lucide-react'
import { Paper, getCategoryMeta } from '@/lib/papers'
import { useCart } from '@/lib/cartStore'
import { useLang } from '@/context/LangContext'
import toast from 'react-hot-toast'

const SUBJECT_ICONS: Record<string, string> = {
  math: '📐',
  mathematics: '📐',
  physics: '⚛️',
  general: '📋',
  chemistry: '🧪',
  biology: '🌿',
}

function subjectIcon(subject: string): string {
  return SUBJECT_ICONS[subject.toLowerCase()] ?? '📄'
}

export default function PaperCard({ paper }: { paper: Paper }) {
  const { addItem, items } = useCart()
  const { t, lang } = useLang()
  const inCart = items.some(i => i.id === paper.id)
  const meta = getCategoryMeta(paper.category)
  const gu = lang === 'gu'

  const handleAdd = () => {
    addItem({ id: paper.id, title: gu ? paper.titleGu : paper.title, price: paper.price })
    toast.success(gu ? 'કાર્ટમાં ઉમેર્યું!' : 'Added to cart!')
  }

  return (
    <div className="card p-5 flex flex-col gap-3 relative overflow-hidden group">
      {paper.popular && (
        <div className="absolute top-3 right-3">
          <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Popular
          </span>
        </div>
      )}

      {paper.isDemo && (
        <div className="absolute top-3 right-3">
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {gu ? t.demoBadge : 'Free Demo'}
          </span>
        </div>
      )}

      {/* Icon + Category badge */}
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl">
          {subjectIcon(paper.subject)}
        </div>
        <span className={`badge ${meta.bg} ${meta.color} text-[11px]`}>
          {gu ? meta.labelGu : meta.label}
        </span>
      </div>

      {/* Title + desc */}
      <div>
        <h3 className={`font-display font-bold text-gray-900 text-[15px] leading-tight mb-1 ${gu ? 'font-gujarati' : ''}`}>
          {gu ? paper.titleGu : paper.title}
        </h3>
        <p className={`text-xs text-gray-500 leading-relaxed ${gu ? 'font-gujarati' : ''}`}>
          {gu ? paper.descriptionGu : paper.description}
        </p>
      </div>

      {/* Marking Scheme */}
      {paper.markingScheme && (
        <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <ClipboardList size={12} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className={`text-[10px] font-semibold text-amber-700 block mb-0.5 ${gu ? 'font-gujarati' : ''}`}>
              {gu ? t.markingSchemeLabel : 'Marking Scheme'}
            </span>
            <span className="text-[11px] text-amber-800 leading-snug">{paper.markingScheme}</span>
          </div>
        </div>
      )}

      {/* Paper count */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <FileText size={12} />
        <span>{paper.paperCount} papers included</span>
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div>
          {paper.isDemo ? (
            <span className="font-display font-bold text-xl text-green-600">Free</span>
          ) : (
            <>
              <span className="font-display font-bold text-xl text-gray-900">₹{paper.price}</span>
              <span className="text-xs text-gray-400 ml-1.5">/ 6 months</span>
            </>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={inCart}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            inCart
              ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
              : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95'
          }`}
        >
          {inCart ? (
            <><Check size={14} /> Added</>
          ) : (
            <><ShoppingCart size={14} /> {t.addToCart}</>
          )}
        </button>
      </div>
    </div>
  )
}
