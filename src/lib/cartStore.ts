import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COMBO_PRICE, SINGLE_PRICE } from '@/lib/papers'

interface CartItem {
  id: string
  title: string
  price: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: () => number
  hasCombo: () => boolean
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const exists = get().items.find(i => i.id === item.id)
        if (!exists) set(s => ({ items: [...s.items, item] }))
      },
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      total: () => {
        const count = get().items.length
        if (count >= 3) return COMBO_PRICE + Math.max(0, count - 3) * SINGLE_PRICE
        return count * SINGLE_PRICE
      },
      hasCombo: () => get().items.length >= 3,
    }),
    { name: 'pp-cart' }
  )
)
