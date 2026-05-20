'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'en' | 'gu'

const translations = {
  en: {
    // Nav
    home: 'Home',
    papers: 'Papers',
    dashboard: 'Dashboard',
    wallet: 'Wallet',
    referral: 'Referral',
    login: 'Login',
    logout: 'Logout',
    loginRegister: 'Login / Register',
    // Hero
    heroTitle: 'Crack Your Exam with Smart Paper Sets',
    heroSub: 'Premium practice papers for Gujarat Board, JEE, NEET & GUJCET. Instant secure digital access.',
    browsePapers: 'Browse Papers',
    watchDemo: 'Watch Demo',
    // Stats
    studentsEnrolled: 'Students enrolled',
    passRate: 'Pass rate',
    paperSets: 'Paper sets',
    comboDeal: 'Any 3 combo deal',
    // Papers
    class10: 'Class 10',
    class12Maths: 'Class 12 — Maths',
    class12Physics: 'Class 12 — Physics',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now ₹',
    comboOffer: '🎯 Combo Offer — Save ₹15',
    comboDesc: 'Add any 3 sections to cart — discount applies automatically',
    // Categories
    toGetPass: 'To Get Pass',
    above75: 'Above 75%',
    above90: 'Above 90%',
    jee: 'JEE',
    neet: 'NEET',
    gujcet: 'GUJCET',
    board: 'Board',
    // Dashboard
    myPapers: 'My Papers',
    download: 'Download',
    accessExpires: 'Access expires in',
    days: 'days',
    expired: 'Expired',
    renew: 'Renew',
    // Wallet
    walletBalance: 'Wallet Balance',
    withdrawToUPI: 'Withdraw to UPI',
    useToBuy: 'Use to Buy',
    transactionHistory: 'Transaction History',
    minWithdrawal: 'Minimum withdrawal: ₹15',
    // Referral
    referralProgram: 'Referral Program',
    yourCode: 'Your Referral Code',
    earnInfo: 'Earn 20% commission on every purchase via your link',
    shareWhatsApp: 'Share on WhatsApp',
    copyLink: 'Copy Link',
    totalReferred: 'Total Referred',
    totalEarned: 'Total Earned',
    // Auth
    mobileLogin: 'Login with Mobile',
    enterMobile: 'Enter your mobile number',
    sendOTP: 'Send OTP',
    verifyOTP: 'Verify OTP',
    orLoginWith: 'or login with',
    googleLogin: 'Continue with Google',
    // FAQ
    faqTitle: 'Frequently Asked Questions',
    // Footer
    privacyPolicy: 'Privacy Policy',
    refundPolicy: 'Refund Policy',
    contact: 'Contact Us',
    terms: 'Terms of Use',
    allRights: 'All rights reserved',
    // Misc
    loading: 'Loading...',
    success: 'Success!',
    error: 'Something went wrong',
    search: 'Search papers...',
    filterBy: 'Filter by',
    trending: 'Trending Papers',
    viewAll: 'View All',
  },
  gu: {
    // Nav
    home: 'હોમ',
    papers: 'પ્રશ્નપત્રો',
    dashboard: 'ડૅશબોર્ડ',
    wallet: 'વૉલેટ',
    referral: 'રેફરલ',
    login: 'લૉગિન',
    logout: 'લૉગ આઉટ',
    loginRegister: 'લૉગિન / નોંધણી',
    // Hero
    heroTitle: 'સ્માર્ટ પ્રશ્નપત્રો સાથે પરીક્ષામાં સફળ થાઓ',
    heroSub: 'ગુજરાત બોર્ડ, JEE, NEET અને GUJCET માટે પ્રીમિયમ પ્રેક્ટિસ પ્રશ્નપત્રો. તાત્કાલિક ડિજિટલ ઍક્સેસ.',
    browsePapers: 'પ્રશ્નપત્રો જુઓ',
    watchDemo: 'ડેમો જુઓ',
    // Stats
    studentsEnrolled: 'વિદ્યાર્થીઓ',
    passRate: 'ઉત્તીર્ણ દર',
    paperSets: 'પ્રશ્નપત્ર સેટ',
    comboDeal: 'કોઈ પણ ૩ નો કૉમ્બો',
    // Papers
    class10: 'ધોરણ ૧૦',
    class12Maths: 'ધોરણ ૧૨ — ગણિત',
    class12Physics: 'ધોરણ ૧૨ — ભૌતિક',
    addToCart: 'કાર્ટમાં ઉમેરો',
    buyNow: 'હમણાં ખરીદો ₹',
    comboOffer: '🎯 કૉમ્બો ઑફર — ₹15 બચાવો',
    comboDesc: 'કોઈ પણ ૩ વિભાગ ઉમેરો — ડિસ્કાઉન્ટ આપોઆપ મળશે',
    // Categories
    toGetPass: 'પાસ થવા માટે',
    above75: '૭૫% થી વધુ',
    above90: '૯૦% થી વધુ',
    jee: 'JEE',
    neet: 'NEET',
    gujcet: 'GUJCET',
    board: 'બોર્ડ',
    // Dashboard
    myPapers: 'મારા પ્રશ્નપત્રો',
    download: 'ડાઉનલોડ',
    accessExpires: 'ઍક્સેસ સમાપ્ત થાય',
    days: 'દિવસ',
    expired: 'સમાપ્ત',
    renew: 'નવીકરણ',
    // Wallet
    walletBalance: 'વૉલેટ બૅલેન્સ',
    withdrawToUPI: 'UPI માં ઉપાડો',
    useToBuy: 'ખરીદવા વાપરો',
    transactionHistory: 'વ્યવહારોનો ઇતિહાસ',
    minWithdrawal: 'ન્યૂનતમ ઉપાડ: ₹15',
    // Referral
    referralProgram: 'રેફરલ પ્રોગ્રામ',
    yourCode: 'તમારો રેફરલ કોડ',
    earnInfo: 'તમારી લિંક દ્વારા દરેક ખરીદી પર ૨૦% કમિશન',
    shareWhatsApp: 'WhatsApp પર શેર કરો',
    copyLink: 'લિંક કૉપિ કરો',
    totalReferred: 'કુલ રેફર',
    totalEarned: 'કુલ કમાણી',
    // Auth
    mobileLogin: 'મોબાઇલ દ્વારા લૉગિન',
    enterMobile: 'તમારો મોબાઇલ નંબર દાખલ કરો',
    sendOTP: 'OTP મોકલો',
    verifyOTP: 'OTP ચકાસો',
    orLoginWith: 'અથવા આ સાથે',
    googleLogin: 'Google સાથે ચાલુ રાખો',
    // FAQ
    faqTitle: 'વારંવાર પૂછાતા પ્રશ્નો',
    // Footer
    privacyPolicy: 'ગોપનીયતા નીતિ',
    refundPolicy: 'રિફંડ નીતિ',
    contact: 'અમારો સંપર્ક',
    terms: 'ઉપયોગની શરતો',
    allRights: 'સર્વ હકો સુરક્ષિત',
    // Misc
    loading: 'લોડ થઈ રહ્યું છે...',
    success: 'સફળ!',
    error: 'કંઇક ખોટું થયું',
    search: 'પ્રશ્નપત્ર શોધો...',
    filterBy: 'ફિલ્ટર',
    trending: 'ટ્રેન્ડિંગ પ્રશ્નપત્રો',
    viewAll: 'બધા જુઓ',
  }
}

type Translations = typeof translations.en
const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}>({ lang: 'en', setLang: () => {}, t: translations.en })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  useEffect(() => {
    const saved = localStorage.getItem('pp_lang') as Lang
    if (saved === 'en' || saved === 'gu') setLangState(saved)
  }, [])
  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('pp_lang', l)
  }
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
