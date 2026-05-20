export type Category = 'pass' | '75' | '90' | 'jee' | 'neet' | 'gujcet' | 'board'
export type Subject = 'math' | 'physics' | 'general'
export type ClassLevel = '10' | '12'

export interface Paper {
  id: string
  title: string
  titleGu: string
  description: string
  descriptionGu: string
  category: Category
  subject: Subject
  classLevel: ClassLevel
  paperCount: number
  price: number
  popular?: boolean
}

export const PAPERS: Paper[] = [
  // Class 10
  {
    id: 'c10-pass',
    title: 'Board Pass Bundle',
    titleGu: 'બોર્ડ પાસ બંડલ',
    description: '4 full papers · Gujarat Board · Class 10',
    descriptionGu: '4 સંપૂર્ણ પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૦',
    category: 'pass',
    subject: 'general',
    classLevel: '10',
    paperCount: 4,
    price: 25,
  },
  {
    id: 'c10-75',
    title: 'Merit Score Bundle',
    titleGu: 'મેરિટ સ્કોર બંડલ',
    description: '5 full papers · Gujarat Board · Class 10',
    descriptionGu: '5 સંપૂર્ણ પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૦',
    category: '75',
    subject: 'general',
    classLevel: '10',
    paperCount: 5,
    price: 25,
    popular: true,
  },
  {
    id: 'c10-90',
    title: 'Distinction Bundle',
    titleGu: 'ડિસ્ટિંક્શન બંડલ',
    description: '6 full papers · Gujarat Board · Class 10',
    descriptionGu: '6 સંપૂર્ણ પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૦',
    category: '90',
    subject: 'general',
    classLevel: '10',
    paperCount: 6,
    price: 25,
  },
  // Class 12 Math
  {
    id: 'c12m-jee',
    title: 'JEE Mathematics Set',
    titleGu: 'JEE ગણિત સેટ',
    description: '8 advanced papers · JEE Main + Advanced pattern',
    descriptionGu: '8 ઉચ્ચ-સ્તરીય પ્રશ્નપત્રો · JEE Main + Advanced',
    category: 'jee',
    subject: 'math',
    classLevel: '12',
    paperCount: 8,
    price: 25,
    popular: true,
  },
  {
    id: 'c12m-gujcet',
    title: 'GUJCET Maths Pack',
    titleGu: 'GUJCET ગણિત પૅક',
    description: '5 papers · GUJCET pattern · Class 12',
    descriptionGu: '5 પ્રશ્નપત્રો · GUJCET પૅટર્ન · ધોરણ ૧૨',
    category: 'gujcet',
    subject: 'math',
    classLevel: '12',
    paperCount: 5,
    price: 25,
  },
  {
    id: 'c12m-pass',
    title: 'Board Maths Pass',
    titleGu: 'બોર્ડ ગણિત પાસ',
    description: '4 papers · Gujarat Board · Class 12',
    descriptionGu: '4 પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૨',
    category: 'pass',
    subject: 'math',
    classLevel: '12',
    paperCount: 4,
    price: 25,
  },
  {
    id: 'c12m-75',
    title: 'Board Maths 75+',
    titleGu: 'બોર્ડ ગણિત ૭૫+',
    description: '5 papers · Gujarat Board · Class 12',
    descriptionGu: '5 પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૨',
    category: '75',
    subject: 'math',
    classLevel: '12',
    paperCount: 5,
    price: 25,
  },
  {
    id: 'c12m-90',
    title: 'Board Maths 90+',
    titleGu: 'બોર્ડ ગણિત ૯૦+',
    description: '6 papers · Gujarat Board · Class 12',
    descriptionGu: '6 પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૨',
    category: '90',
    subject: 'math',
    classLevel: '12',
    paperCount: 6,
    price: 25,
  },
  // Class 12 Physics
  {
    id: 'c12p-jee',
    title: 'JEE Physics Set',
    titleGu: 'JEE ભૌતિક સેટ',
    description: '8 papers · JEE Main + Advanced pattern',
    descriptionGu: '8 પ્રશ્નપત્રો · JEE Main + Advanced',
    category: 'jee',
    subject: 'physics',
    classLevel: '12',
    paperCount: 8,
    price: 25,
    popular: true,
  },
  {
    id: 'c12p-neet',
    title: 'NEET Physics Set',
    titleGu: 'NEET ભૌતિક સેટ',
    description: '7 papers · NEET Biology-Physics pattern',
    descriptionGu: '7 પ્રશ્નપત્રો · NEET ભૌતિક',
    category: 'neet',
    subject: 'physics',
    classLevel: '12',
    paperCount: 7,
    price: 25,
  },
  {
    id: 'c12p-gujcet',
    title: 'GUJCET Physics Set',
    titleGu: 'GUJCET ભૌતિક સેટ',
    description: '5 papers · GUJCET pattern',
    descriptionGu: '5 પ્રશ્નપત્રો · GUJCET પૅટર્ન',
    category: 'gujcet',
    subject: 'physics',
    classLevel: '12',
    paperCount: 5,
    price: 25,
  },
  {
    id: 'c12p-pass',
    title: 'Board Physics Pass',
    titleGu: 'બોર્ડ ભૌતિક પાસ',
    description: '4 papers · Gujarat Board · Class 12',
    descriptionGu: '4 પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૨',
    category: 'pass',
    subject: 'physics',
    classLevel: '12',
    paperCount: 4,
    price: 25,
  },
  {
    id: 'c12p-75',
    title: 'Board Physics 75+',
    titleGu: 'બોર્ડ ભૌતિક ૭૫+',
    description: '5 papers · Gujarat Board · Class 12',
    descriptionGu: '5 પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૨',
    category: '75',
    subject: 'physics',
    classLevel: '12',
    paperCount: 5,
    price: 25,
  },
  {
    id: 'c12p-90',
    title: 'Board Physics 90+',
    titleGu: 'બોર્ડ ભૌતિક ૯૦+',
    description: '6 papers · Gujarat Board · Class 12',
    descriptionGu: '6 પ્રશ્નપત્રો · ગુજરાત બોર્ડ · ધોરણ ૧૨',
    category: '90',
    subject: 'physics',
    classLevel: '12',
    paperCount: 6,
    price: 25,
  },
]

export const CATEGORY_META: Record<Category, { label: string; labelGu: string; color: string; bg: string }> = {
  pass:   { label: 'To Get Pass',  labelGu: 'પાસ થવા',       color: 'text-green-700',   bg: 'bg-green-50 border-green-200' },
  '75':   { label: 'Above 75%',   labelGu: '૭૫% થી વધુ',    color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  '90':   { label: 'Above 90%',   labelGu: '૯૦% થી વધુ',    color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  jee:    { label: 'JEE',         labelGu: 'JEE',            color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
  neet:   { label: 'NEET',        labelGu: 'NEET',           color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200' },
  gujcet: { label: 'GUJCET',      labelGu: 'GUJCET',         color: 'text-cyan-700',    bg: 'bg-cyan-50 border-cyan-200' },
  board:  { label: 'Board',       labelGu: 'બોર્ડ',          color: 'text-slate-700',   bg: 'bg-slate-50 border-slate-200' },
}

export const COMBO_PRICE = 60
export const SINGLE_PRICE = 25
