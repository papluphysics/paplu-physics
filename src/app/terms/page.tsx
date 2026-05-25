'use client'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText size={20} className="text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Terms of Use</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: May 2025</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Please read these Terms of Use carefully before accessing or using the Paplu Physics platform. By registering an account or making a purchase, you agree to be bound by these terms.
        </p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. About the Service</h2>
            <p className="text-sm">
              Paplu Physics (operated by Wide Future Classes) is an online platform that provides digital practice paper sets for students preparing for Gujarat Board (Class 10 &amp; 12 Science), JEE, NEET, and GUJCET examinations. All products are delivered digitally as PDF files.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Eligibility</h2>
            <p className="text-sm">
              You must be at least 13 years of age to create an account. By registering, you confirm that the information you provide is accurate and that you are authorised to use the contact details provided (mobile number or email).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Account Responsibility</h2>
            <ul className="space-y-1.5 text-sm">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>Each account is for personal use only. Sharing accounts with others is not permitted.</li>
              <li>A maximum of <strong>2 devices</strong> may be used to access your account concurrently. Access from additional devices may be blocked automatically.</li>
              <li>You must notify us immediately if you suspect unauthorised use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Purchases and Access</h2>
            <ul className="space-y-1.5 text-sm">
              <li>Purchased paper sets grant you personal, non-transferable access for <strong>6 months</strong> from the date of purchase.</li>
              <li>After expiry, access is revoked automatically. You may re-purchase at the current listed price.</li>
              <li>Download links are time-limited and signed. Attempting to share or redistribute links is a violation of these terms.</li>
              <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Intellectual Property &amp; Content Usage</h2>
            <p className="text-sm">
              All paper sets, questions, solutions, and associated content are the intellectual property of Wide Future Classes. You are granted a limited, personal, non-commercial licence to access and download the content for your own study purposes only.
            </p>
            <p className="text-sm mt-2 font-medium text-gray-800">You may NOT:</p>
            <ul className="space-y-1 text-sm mt-1">
              <li>Reproduce, copy, or redistribute any paper content in any form.</li>
              <li>Share downloaded PDFs with others, upload to any platform, or sell the content.</li>
              <li>Remove or attempt to remove any watermark or identifying information from PDFs.</li>
              <li>Use the content for commercial purposes, tuitions, or coaching centres without written permission.</li>
            </ul>
            <p className="text-sm mt-2">
              Every downloaded PDF contains a unique invisible watermark identifying your account. Detected misuse will result in immediate account suspension and may lead to legal action.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Referral Programme</h2>
            <ul className="space-y-1.5 text-sm">
              <li>You earn 20% of the net purchase value (after Razorpay processing fees) for each purchase made through your referral link.</li>
              <li>Commissions are credited to your Paplu Physics wallet, not to a bank account directly.</li>
              <li>Minimum withdrawal is ₹15 via UPI. Requests are processed within 3 business days.</li>
              <li>Fraudulent referrals (self-referrals, fake accounts, etc.) will result in forfeiture of all commissions and account suspension.</li>
              <li>We reserve the right to modify commission rates with 7 days&apos; notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Prohibited Conduct</h2>
            <p className="text-sm">You agree not to:</p>
            <ul className="space-y-1 text-sm mt-1">
              <li>Attempt to hack, scrape, or reverse-engineer any part of the platform.</li>
              <li>Create multiple accounts for the purpose of abusing referral or coupon systems.</li>
              <li>Post abusive, misleading, or defamatory reviews.</li>
              <li>Use automated tools (bots, scripts) to interact with the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Disclaimers</h2>
            <p className="text-sm">
              Paper sets are created by experienced educators based on Gujarat Board exam patterns. However, Paplu Physics does not guarantee any specific exam score or result. Use the papers as a study aid alongside your regular curriculum.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Termination</h2>
            <p className="text-sm">
              We reserve the right to suspend or terminate your account at any time if you violate these terms, without prior notice and without any obligation to refund unused purchases.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">10. Governing Law</h2>
            <p className="text-sm">
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Gujarat, India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">11. Changes to Terms</h2>
            <p className="text-sm">
              We may update these terms periodically. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <div className="bg-brand-50 rounded-2xl p-4 mt-8">
            <p className="text-sm text-gray-600">
              Questions about these terms? Contact us at{' '}
              <a href="mailto:widefutureclasses@gmail.com" className="text-brand-500 font-medium hover:underline">
                widefutureclasses@gmail.com
              </a>
              {' '}or visit our{' '}
              <Link href="/contact" className="text-brand-500 font-medium hover:underline">Contact page</Link>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
