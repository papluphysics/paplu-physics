'use client'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, ShieldCheck, HeartHandshake } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <RefreshCw size={20} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Refund Policy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: May 2025</p>
          </div>
        </div>

        {/* Promise cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3">
            <ShieldCheck size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Secure Digital Access</p>
              <p className="text-xs text-green-700 mt-0.5 leading-relaxed">Your papers are available instantly and accessible for the full 6 months after purchase.</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <HeartHandshake size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">We&apos;re Here to Help</p>
              <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">If you face any technical issue with access, we will resolve it personally and promptly.</p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">Our Refund Policy</h2>
            <p className="text-sm leading-relaxed">
              Paplu Physics provides <strong>fully digital products</strong> — downloadable PDF paper sets. Because digital content is delivered instantly upon payment and cannot be &ldquo;returned&rdquo; once accessed, <strong>all sales are final and non-refundable</strong>.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              This is standard practice across all digital education platforms. We want to be transparent about this upfront so there are no surprises.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">Why We Cannot Offer Refunds</h2>
            <ul className="space-y-2 text-sm">
              <li>Once a paper set is accessed or downloaded, the content has been delivered in full.</li>
              <li>Unlike physical products, digital files cannot be &ldquo;returned&rdquo; after access.</li>
              <li>Our pricing is kept extremely affordable (₹25 per set, ₹60 for any 3) specifically so that students can purchase without financial risk.</li>
              <li>Each purchase is logged and tied to your account, which helps prevent duplicate charges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">What We Will Help You With</h2>
            <p className="text-sm mb-2">
              Even though we do not process refunds, we are committed to making sure you get full value from your purchase. Please reach out to us if:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>You cannot access your paper after payment</strong> — We will investigate immediately and restore access or resend the link within 24 hours.
              </li>
              <li>
                <strong>You were charged twice for the same order</strong> — Duplicate payments are extremely rare due to Razorpay&apos;s safeguards, but if it happens we will refund the extra charge fully.
              </li>
              <li>
                <strong>There is a technical error in the paper content</strong> — We will replace the paper set with a corrected version at no additional charge.
              </li>
              <li>
                <strong>You accidentally purchased the wrong set</strong> — Contact us within 24 hours of purchase. While we cannot guarantee a swap in all cases, we will do our best to help.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">Payment Disputes</h2>
            <p className="text-sm">
              If you believe an unauthorised charge has occurred on your account, contact us immediately at{' '}
              <a href="mailto:widefutureclasses@gmail.com" className="text-brand-500 hover:underline">widefutureclasses@gmail.com</a>.
              Do not raise a chargeback without first contacting us — most issues can be resolved quickly and amicably. Unjustified chargebacks may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">Our Commitment to You</h2>
            <p className="text-sm leading-relaxed">
              We genuinely care about every student who uses Paplu Physics. If you are unhappy for any reason, please talk to us. Our goal is to help you succeed in your exams — not to hold on to your money. While our refund policy is firm on digital content, our customer support is not. We will always try to find a fair solution.
            </p>
          </section>

          <div className="bg-brand-50 rounded-2xl p-4 mt-8">
            <p className="text-sm font-semibold text-gray-800 mb-1">Need help with a purchase?</p>
            <p className="text-sm text-gray-600">
              Contact us at{' '}
              <a href="mailto:widefutureclasses@gmail.com" className="text-brand-500 font-medium hover:underline">
                widefutureclasses@gmail.com
              </a>
              {' '}or{' '}
              <Link href="/contact" className="text-brand-500 font-medium hover:underline">
                Contact Us
              </Link>
              . We respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
