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
    // Mascot + How It Works (home page only — appended, no existing keys changed)
    mascotWorry: "I don't understand anything… what do I do?",
    mascotHappy: 'Paplu Physics saved me!',
    howItWorksLabel: 'How It Works',
    howStep1Label: 'Browse Papers',
    howStep1Desc: 'Pick from Class 10, 12, JEE, NEET & GUJCET sets',
    howStep2Label: 'Buy Securely',
    howStep2Desc: '₹25 per set — or grab any 3 for ₹60 via UPI / card',
    howStep3Label: 'Instant PDF Access',
    howStep3Desc: 'Download your watermarked PDF right away, valid 6 months',
    howStep4Label: 'Crack Your Exam',
    howStep4Desc: 'Practice with expert papers and walk in confident',
    // Choose Your Class section (home page only — appended, no existing keys changed)
    chooseClassTitle: 'Choose Your Class',
    chooseClassSub: 'Gujarat Board & competitive exams — pick your path',
    class10CardTitle: 'Class 10 Science',
    class10CardDesc: 'Pass · 75% · 90% paper packages',
    class12MathCardTitle: 'Class 12 Mathematics',
    class12MathCardDesc: 'Board · JEE · GUJCET prep',
    class12PhysCardTitle: 'Class 12 Physics',
    class12PhysCardDesc: 'Board · JEE · NEET · GUJCET',
    gujcetCardTitle: 'GUJCET Prep',
    gujcetCardDesc: 'Maths & Physics for GUJCET entrance',
    // Demo Paper card (home page only — appended, no existing keys changed)
    demoPaperCardTitle: 'Try Free Demo Papers',
    demoPaperCardSub: 'Sample papers to try before you buy.',
    demoPaperCardCta: 'Try Free Demo',
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
    // Mascot + How It Works (home page only — appended, no existing keys changed)
    mascotWorry: 'કઈ સમજ નથી... શું કરું?',
    mascotHappy: 'Paplu Physics ઉગારી લીધો!',
    howItWorksLabel: 'કેવી રીતે કામ કરે છે',
    howStep1Label: 'પ્રશ્નપત્ર જુઓ',
    howStep1Desc: 'ધોરણ ૧૦, ૧૨, JEE, NEET, GUJCET ના સેટ',
    howStep2Label: 'સુરક્ષિત ખરીદી',
    howStep2Desc: '₹25/સેટ — અથવા ૩ ₹60 — UPI, કાર્ડ, વૉલેટ',
    howStep3Label: 'તાત્કાલિક PDF ઍક્સેસ',
    howStep3Desc: 'PDF તુરંત ડાઉનલોડ, ૬ મહિના ઍક્સેસ',
    howStep4Label: 'પરીક્ષામાં સફળ',
    howStep4Desc: 'નિષ્ણાત પ્રશ્નપત્રો સાથે આત્મવિશ્વાસ સાથે જાઓ',
    // Choose Your Class section (home page only — appended)
    chooseClassTitle: 'તમારો વર્ગ પસંદ કરો',
    chooseClassSub: 'ગુજરાત બોર્ડ અને સ્પર્ધાત્મક — તમારો માર્ગ પસંદ કરો',
    class10CardTitle: 'ધોરણ ૧૦ વિજ્ઞાન',
    class10CardDesc: 'પાસ · ૭૫% · ૯૦% પૅકેજ',
    class12MathCardTitle: 'ધોરણ ૧૨ ગણિત',
    class12MathCardDesc: 'બોર્ડ · JEE · GUJCET',
    class12PhysCardTitle: 'ધોરણ ૧૨ ભૌતિક',
    class12PhysCardDesc: 'બોર્ડ · JEE · NEET · GUJCET',
    gujcetCardTitle: 'GUJCET પ્રવેશ',
    gujcetCardDesc: 'GUJCET માટે ગણિત & ભૌતિક',
    // Demo Paper card (home page only — appended, no existing keys changed)
    demoPaperCardTitle: 'ફ્રી ડૅમો પ્રશ્નપત્ર અજમાવો',
    demoPaperCardSub: 'ખરીદી પહેલા ગુણવત્તા ચકાસો.',
    demoPaperCardCta: 'ફ્રી ડૅમો',
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
