'use client'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Shield size={20} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: May 2025</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p className="text-base text-gray-700 leading-relaxed">
            At <strong>Paplu Physics</strong> (operated by Wide Future Classes), your privacy is important to us. This policy explains what information we collect, how we use it, and the steps we take to keep it safe.
          </p>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Information We Collect</h2>
            <ul className="space-y-1.5 text-sm">
              <li><strong>Account information:</strong> Your name, mobile number, and/or email address when you register or log in.</li>
              <li><strong>Payment information:</strong> We do not store card or UPI details. Payments are processed securely by Razorpay and we only receive transaction status and order IDs.</li>
              <li><strong>Usage data:</strong> Which papers you purchase, download, and access. This helps us personalise your experience and detect misuse.</li>
              <li><strong>Device information:</strong> Device type and browser used, to enforce our two-device limit and for security purposes.</li>
              <li><strong>Referral data:</strong> Who referred you and who you referred, to calculate and credit commissions accurately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <ul className="space-y-1.5 text-sm">
              <li>To create and manage your account.</li>
              <li>To process purchases and deliver digital paper sets.</li>
              <li>To calculate and credit referral commissions to your wallet.</li>
              <li>To send you important account notifications (purchase confirmations, OTP, wallet updates).</li>
              <li>To detect and prevent fraud, piracy, or terms violations.</li>
              <li>To improve our products based on usage patterns (always anonymised for analytics).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. PDF Watermarking</h2>
            <p className="text-sm">
              Every PDF you download contains an invisible watermark uniquely tied to your account. This watermark is used solely to identify the source in the event that a PDF is illegally shared or distributed. It does not affect the content, quality, or readability of the paper.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Data Sharing</h2>
            <p className="text-sm">
              We do not sell, rent, or trade your personal information to any third party. We share data only with:
            </p>
            <ul className="space-y-1 text-sm mt-2">
              <li><strong>Razorpay</strong> — solely for processing your payment.</li>
              <li><strong>Supabase</strong> — our secure cloud database provider that stores your account data.</li>
              <li><strong>Law enforcement</strong> — only when legally required to do so.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Data Security</h2>
            <p className="text-sm">
              Your data is stored in Supabase&apos;s encrypted cloud infrastructure. Access is restricted to essential personnel only. Download links for PDFs are time-limited and signed — they cannot be shared with others. Passwords (if applicable) are hashed using industry-standard algorithms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Data Retention</h2>
            <p className="text-sm">
              We retain your account data as long as your account is active. If you wish to delete your account, contact us at the address below and we will erase your data within 30 days, except where retention is required by law (e.g., transaction records).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Cookies</h2>
            <p className="text-sm">
              We use minimal, essential cookies to keep you logged in. We do not use advertising or tracking cookies. Your language preference is stored in your browser&apos;s local storage.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Children&apos;s Privacy</h2>
            <p className="text-sm">
              Our services are intended for students aged 14 and above. We do not knowingly collect data from children under 13. If you believe we have inadvertently collected such data, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Your Rights</h2>
            <ul className="space-y-1 text-sm">
              <li>Request a copy of the data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and data.</li>
            </ul>
            <p className="text-sm mt-2">To exercise these rights, contact us at <a href="mailto:widefutureclasses@gmail.com" className="text-brand-500 hover:underline">widefutureclasses@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p className="text-sm">
              We may update this policy occasionally. Significant changes will be notified via your registered contact. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <div className="bg-brand-50 rounded-2xl p-4 mt-8">
            <p className="text-sm text-gray-600">
              Questions about this policy? Reach us at{' '}
              <a href="mailto:widefutureclasses@gmail.com" className="text-brand-500 font-medium hover:underline">
                widefutureclasses@gmail.com
              </a>{' '}
              or{' '}
              <Link href="/contact" className="text-brand-500 font-medium hover:underline">Contact Us</Link>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
