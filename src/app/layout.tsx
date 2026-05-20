import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/context/LangContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Paplu Physics — Gujarat Board Exam Paper Sets',
  description: 'Premium practice papers for Gujarat Board Class 10 & 12 Science, JEE, NEET, GUJCET. Instant digital access.',
  keywords: 'gujarat board papers, class 10 papers, class 12 science, JEE papers, NEET papers, GUJCET, paplu physics',
  openGraph: {
    title: 'Paplu Physics',
    description: 'Crack your Gujarat Board exams with smart paper sets',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>
        <LangProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { fontFamily: 'var(--font-dm-sans)', borderRadius: '10px', fontSize: '14px' },
              success: { iconTheme: { primary: '#1264F0', secondary: '#fff' } },
            }}
          />
        </LangProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
