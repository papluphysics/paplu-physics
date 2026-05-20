'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ShoppingCart, Zap, Globe, LogOut, User } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/lib/cartStore'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/papers', label: t.papers },
    { href: '/dashboard', label: t.dashboard },
    { href: '/wallet', label: t.wallet },
    { href: '/referral', label: t.referral },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const displayInitial = profile?.name?.[0]?.toUpperCase()
    || profile?.mobile?.replace('+91', '')[0]
    || profile?.email?.[0]?.toUpperCase()
    || 'U'

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 tracking-tight">
              Paplu<span className="text-brand-500">Physics</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link text-sm font-medium transition-colors ${
                  pathname === l.href ? 'text-brand-500 active' : 'text-gray-600 hover:text-gray-900'
                } ${lang === 'gu' ? 'font-gujarati' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Globe size={13} />
              {lang === 'en' ? 'ગુ' : 'EN'}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} className="text-gray-600" />
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            {/* Auth state */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm hover:bg-brand-200 transition-colors"
                  title={profile?.name || profile?.mobile || 'My Account'}
                >
                  {displayInitial}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={13} />
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block btn-primary">
                <span className={lang === 'gu' ? 'font-gujarati' : ''}>{t.loginRegister}</span>
              </Link>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${lang === 'gu' ? 'font-gujarati' : ''}`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false) }}
                className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={14} />
                {t.logout}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 btn-primary text-center block"
              >
                <span className={lang === 'gu' ? 'font-gujarati' : ''}>{t.loginRegister}</span>
              </Link>
            )}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
