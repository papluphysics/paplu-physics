'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const CONTACT_ITEMS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 98984 79432',
    desc: 'Chat with us on WhatsApp — fastest response',
    href: 'https://wa.me/919898479432',
    gradient: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50 border-green-100',
    iconBg: 'bg-green-500',
    badge: 'Fastest',
    badgeColor: 'bg-green-100 text-green-700',
    cta: 'Open WhatsApp',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 98984 79432',
    desc: 'Talk to us directly — available Monday to Saturday',
    href: 'tel:+919898479432',
    gradient: 'from-blue-400 to-brand-500',
    bg: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-brand-500',
    badge: 'Mon – Sat',
    badgeColor: 'bg-blue-100 text-blue-700',
    cta: 'Call Now',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'widefutureclasses@gmail.com',
    desc: 'Send us an email — we reply within 24 hours',
    href: 'mailto:widefutureclasses@gmail.com',
    gradient: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-500',
    badge: '24h reply',
    badgeColor: 'bg-purple-100 text-purple-700',
    cta: 'Send Email',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <p className="section-label">Support</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
            We&apos;re here to help
          </h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm leading-relaxed">
            Have a question, need help with a purchase, or just want to say hello? Pick any channel below — we&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {CONTACT_ITEMS.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.label !== 'Call Us' ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`block rounded-2xl border p-6 ${item.bg} transition-shadow hover:shadow-xl cursor-pointer group relative overflow-hidden`}
            >
              {/* Background gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

              <div className="relative">
                {/* Icon + badge row */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center shadow-sm`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <item.icon size={22} className="text-white" />
                  </motion.div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">{item.label}</h3>
                <p className="text-sm font-medium text-gray-700 mb-2 break-all">{item.value}</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.desc}</p>

                {/* CTA row */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  <span>{item.cta}</span>
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: i * 0.3 }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Hours banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-center"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Support Hours</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Monday to Saturday, <strong className="text-gray-700">9:00 AM – 8:00 PM IST</strong>.
              For urgent issues outside these hours, WhatsApp us — we monitor messages and will respond as soon as possible.
            </p>
          </div>
        </motion.div>

        {/* FAQ link */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 mb-2">Before reaching out, your answer might already be in our</p>
          <Link href="/#faq" className="text-brand-500 font-semibold text-sm hover:underline">
            Frequently Asked Questions →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
