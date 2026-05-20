'use client'
import { X, ShoppingCart, Trash2, Zap } from 'lucide-react'
import { useCart } from '@/lib/cartStore'
import { useLang } from '@/context/LangContext'
import { useRouter } from 'next/navigation'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, total, hasCombo } = useCart()
  const { t, lang } = useLang()
  const router = useRouter()

  if (!open) return null

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-brand-500" />
            <span className="font-display font-bold text-gray-900">Cart ({items.length})</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Combo banner */}
        {items.length > 0 && items.length < 3 && (
          <div className="mx-4 mt-4 p-3 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-700">
            <span className="font-semibold">Add {3 - items.length} more</span> to unlock ₹60 combo deal!
          </div>
        )}
        {hasCombo() && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
            <Zap size={14} className="fill-green-500 text-green-500" />
            <span><span className="font-semibold">Combo activated!</span> Saving ₹{items.length * 25 - total()}</span>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
              <ShoppingCart size={40} strokeWidth={1.5} />
              <p className="mt-3 text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">₹{item.price}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <div className="text-right">
                <span className="text-xl font-display font-bold text-gray-900">₹{total()}</span>
                {hasCombo() && (
                  <span className="ml-2 text-xs text-gray-400 line-through">₹{items.length * 25}</span>
                )}
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full btn-primary py-3 text-base">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
