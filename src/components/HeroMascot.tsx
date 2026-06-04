'use client'
/**
 * HeroMascot — self-contained, swappable student character component.
 *
 * Props:
 *   state   — 'idle' | 'sad' | 'happy'
 *   bubble  — string shown in thought bubble, or null to hide
 *   small   — render at 160px width instead of 210px (mobile)
 *
 * To swap internals for a Rive / Spline scene later, replace the SVG block
 * inside the inner <motion.div> while keeping the outer wrapper, AnimatePresence
 * for the bubble, and the Confetti component intact.
 */
import { useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export type MascotState = 'idle' | 'sad' | 'happy'

interface HeroMascotProps {
  state: MascotState
  bubble: string | null
  small?: boolean
}

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  skin:      '#FDDCB5',
  skinDark:  '#F4B896',
  hair:      '#1F2937',
  shirt:     '#1264F0',
  shirtDark: '#0D4EC7',
  pants:     '#334155',
  shoe:      '#0F172A',
  pack:      '#7C3AED',
  packDark:  '#6D28D9',
  tear:      '#93C5FD',
  blush:     '#FB7185',
} as const

// ── Confetti ───────────────────────────────────────────────────────────────
function Confetti() {
  const COLOURS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C']
  // Seeded with index so no hydration mismatch (ssr:false, but belt-and-suspenders)
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => {
      const seed = (i * 137.508) % 1          // golden-angle pseudo-random
      const seed2 = ((i + 7) * 97.3) % 1
      return {
        id: i,
        x: (seed - 0.5) * 260,
        y: -(50 + seed2 * 170),
        color: COLOURS[i % COLOURS.length],
        w: 6 + seed * 10,
        h: 6 + seed2 * 12,
        rotate: seed * 360,
        delay: seed2 * 0.28,
      }
    }), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 1 }}
          transition={{ duration: 0.75, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-sm"
          style={{ width: p.w, height: p.h, background: p.color, left: '50%', top: '28%' }}
        />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export function HeroMascot({ state, bubble, small = false }: HeroMascotProps) {
  const prefersReduced = useReducedMotion()

  const svgW = small ? 160 : 210
  const svgH = small ? 255 : 335

  // Spring used for body-level motions
  const spring = prefersReduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 170, damping: 18 }

  // Fast ease used for facial/arm expression swaps
  const snap = prefersReduced
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }

  // Idle breathing: only animate when not in reduced-motion mode
  const breathe = (!prefersReduced && state !== 'happy')
    ? { scale: [1, 1.018, 1] }
    : { scale: 1 }
  const breatheTrans = (!prefersReduced && state !== 'happy')
    ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const }
    : {}

  return (
    <div className={`relative select-none ${small ? 'w-40' : 'w-[210px]'}`} aria-hidden="true">

      {/* ── Entry slide-in ── */}
      <motion.div
        initial={prefersReduced ? false : { x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={prefersReduced
          ? { duration: 0 }
          : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Body lift for happy state ── */}
        <motion.div
          animate={{ y: prefersReduced ? 0 : state === 'happy' ? -18 : 0 }}
          transition={spring}
          className="relative"
        >
          {/* ─────────────────────── SVG CHARACTER ─────────────────────── */}
          {/* SWAP POINT: replace everything inside this svg with a Rive/Spline embed */}
          <svg viewBox="0 0 200 315" width={svgW} height={svgH}>

            {/* ── Backpack (behind body) ── */}
            <rect x="131" y="122" width="28" height="54" rx="10" fill={C.pack} />
            <rect x="134" y="138" width="22" height="20" rx="5" fill={C.packDark} />
            {/* strap */}
            <rect x="157" y="130" width="5" height="40" rx="2.5" fill={C.packDark} opacity="0.65" />

            {/* ── Legs ── */}
            <rect x="75" y="200" width="22" height="54" rx="11" fill={C.pants} />
            <rect x="103" y="200" width="22" height="54" rx="11" fill={C.pants} />

            {/* ── Shoes ── */}
            <ellipse cx="86" cy="254" rx="21" ry="13" fill={C.shoe} />
            <ellipse cx="114" cy="254" rx="21" ry="13" fill={C.shoe} />
            {/* toe highlights */}
            <ellipse cx="80" cy="248" rx="8" ry="5" fill="#1E293B" opacity="0.45" />
            <ellipse cx="108" cy="248" rx="8" ry="5" fill="#1E293B" opacity="0.45" />

            {/* ── Body / shirt ── */}
            <rect x="62" y="128" width="77" height="80" rx="20" fill={C.shirt} />
            {/* collar V */}
            <path d="M88 128 L100 148 L112 128" fill={C.shirtDark} />
            {/* bottom band */}
            <path d="M62 196 Q62 208 82 208 L118 208 Q138 208 138 196 Z" fill={C.shirtDark} />

            {/* ── LEFT ARM ── */}
            {/* idle / sad arm (down) */}
            <AnimatePresence initial={false}>
              {state !== 'happy' && (
                <motion.g
                  key="left-arm-down"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={snap}
                >
                  <line
                    x1="63" y1="150"
                    x2={state === 'sad' ? '41' : '40'}
                    y2={state === 'sad' ? '206' : '196'}
                    stroke={C.skin} strokeWidth="19" strokeLinecap="round"
                  />
                  <circle cx={state === 'sad' ? 41 : 40} cy={state === 'sad' ? 206 : 196} r="12" fill={C.skin} />
                </motion.g>
              )}
            </AnimatePresence>
            {/* happy arm (raised) */}
            <AnimatePresence initial={false}>
              {state === 'happy' && (
                <motion.g
                  key="left-arm-up"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={snap}
                >
                  <line x1="63" y1="148" x2="28" y2="102" stroke={C.skin} strokeWidth="19" strokeLinecap="round" />
                  <circle cx="28" cy="102" r="12" fill={C.skin} />
                </motion.g>
              )}
            </AnimatePresence>

            {/* ── RIGHT ARM ── */}
            <AnimatePresence initial={false}>
              {state !== 'happy' && (
                <motion.g
                  key="right-arm-down"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={snap}
                >
                  <line
                    x1="137" y1="150"
                    x2={state === 'sad' ? '159' : '160'}
                    y2={state === 'sad' ? '206' : '196'}
                    stroke={C.skin} strokeWidth="19" strokeLinecap="round"
                  />
                  <circle cx={state === 'sad' ? 159 : 160} cy={state === 'sad' ? 206 : 196} r="12" fill={C.skin} />
                </motion.g>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {state === 'happy' && (
                <motion.g
                  key="right-arm-up"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={snap}
                >
                  <line x1="137" y1="148" x2="172" y2="102" stroke={C.skin} strokeWidth="19" strokeLinecap="round" />
                  <circle cx="172" cy="102" r="12" fill={C.skin} />
                </motion.g>
              )}
            </AnimatePresence>

            {/* ── Neck ── */}
            <rect x="89" y="114" width="22" height="22" rx="8" fill={C.skin} />

            {/* ── Head — breathes gently ── */}
            <motion.circle
              cx="100" cy="80" r="44"
              fill={C.skin}
              animate={breathe}
              transition={breatheTrans}
              style={{ transformOrigin: '100px 80px' }}
            />

            {/* ── Hair cap ── */}
            <path
              d="M57 80 Q59 34 100 31 Q141 34 143 80 Q130 100 100 93 Q70 100 57 80Z"
              fill={C.hair}
            />
            {/* Hair tuft */}
            <path d="M100 31 Q108 18 116 27" stroke={C.hair} strokeWidth="9" strokeLinecap="round" fill="none" />

            {/* ── Ears ── */}
            <ellipse cx="56" cy="83" rx="7" ry="10" fill={C.skin} />
            <ellipse cx="144" cy="83" rx="7" ry="10" fill={C.skin} />
            <ellipse cx="56" cy="84" rx="4" ry="6" fill={C.skinDark} />
            <ellipse cx="144" cy="84" rx="4" ry="6" fill={C.skinDark} />

            {/* ── Eyes (whites) ── */}
            <circle cx="83" cy="79" r="9.5" fill="white" />
            <circle cx="117" cy="79" r="9.5" fill="white" />

            {/* Pupils — shift slightly for sad state */}
            <motion.circle
              r="5.5" fill={C.hair}
              animate={prefersReduced
                ? { cx: 85, cy: 80 }
                : { cx: state === 'sad' ? 85 : 83, cy: state === 'sad' ? 81 : 79 }}
              transition={snap}
            />
            <motion.circle
              r="5.5" fill={C.hair}
              animate={prefersReduced
                ? { cx: 115, cy: 80 }
                : { cx: state === 'sad' ? 115 : 117, cy: state === 'sad' ? 81 : 79 }}
              transition={snap}
            />

            {/* Eye shine (static — stays on top of pupils) */}
            <circle cx="86" cy="76" r="2.2" fill="white" />
            <circle cx="120" cy="76" r="2.2" fill="white" />

            {/* ── Eyebrows ── */}
            {/* Sad brows: angled down toward nose */}
            <AnimatePresence initial={false}>
              {state === 'sad' && (
                <motion.g key="brow-sad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snap}>
                  <path d="M75 63 Q83 60 91 66" stroke={C.hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M109 66 Q117 60 125 63" stroke={C.hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                </motion.g>
              )}
            </AnimatePresence>
            {/* Happy brows: raised arches */}
            <AnimatePresence initial={false}>
              {state === 'happy' && (
                <motion.g key="brow-happy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snap}>
                  <path d="M75 61 Q83 55 91 61" stroke={C.hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M109 61 Q117 55 125 61" stroke={C.hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                </motion.g>
              )}
            </AnimatePresence>
            {/* Idle / neutral brows */}
            <AnimatePresence initial={false}>
              {state === 'idle' && (
                <motion.g key="brow-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snap}>
                  <path d="M76 64 Q83 62 91 64" stroke={C.hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M109 64 Q117 62 125 64" stroke={C.hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* ── Mouth ── */}
            {/* Sad: downward arc (frown) */}
            <AnimatePresence initial={false}>
              {state === 'sad' && (
                <motion.g key="mouth-sad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snap}>
                  <path d="M86 100 Q100 92 114 100" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </motion.g>
              )}
            </AnimatePresence>
            {/* Happy: big wide smile */}
            <AnimatePresence initial={false}>
              {state === 'happy' && (
                <motion.g key="mouth-happy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snap}>
                  <path d="M83 95 Q100 113 117 95" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  {/* Teeth fill */}
                  <path d="M85 96 Q100 110 115 96 L115 101 Q100 113 85 101 Z" fill="white" />
                </motion.g>
              )}
            </AnimatePresence>
            {/* Idle: gentle hint of smile */}
            <AnimatePresence initial={false}>
              {state === 'idle' && (
                <motion.g key="mouth-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snap}>
                  <path d="M88 97 Q100 102 112 97" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* ── Tear (sad only) ── */}
            <AnimatePresence>
              {state === 'sad' && !prefersReduced && (
                <motion.ellipse
                  key="tear"
                  cx="79" cy="92" rx="4" ry="7"
                  fill={C.tear}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  style={{ transformOrigin: '79px 89px' }}
                />
              )}
            </AnimatePresence>

            {/* ── Rosy cheeks (happy only) ── */}
            <AnimatePresence>
              {state === 'happy' && (
                <>
                  <motion.ellipse key="blush-l" cx="70" cy="92" rx="13" ry="8" fill={C.blush}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} transition={snap} />
                  <motion.ellipse key="blush-r" cx="130" cy="92" rx="13" ry="8" fill={C.blush}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} transition={snap} />
                </>
              )}
            </AnimatePresence>

            {/* ── Stars near raised hands (happy only) ── */}
            {!prefersReduced && (
              <AnimatePresence>
                {state === 'happy' && (
                  <>
                    <motion.text key="star-l" x="22" y="95" fontSize="18" textAnchor="middle"
                      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }} transition={{ delay: 0.15 }}
                      style={{ transformOrigin: '22px 95px' }}>⭐</motion.text>
                    <motion.text key="star-r" x="175" y="88" fontSize="15" textAnchor="middle"
                      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }} transition={{ delay: 0.25 }}
                      style={{ transformOrigin: '175px 88px' }}>✨</motion.text>
                  </>
                )}
              </AnimatePresence>
            )}

          </svg>
          {/* ─────────────── END SVG CHARACTER (swap point above) ─────────── */}
        </motion.div>
      </motion.div>

      {/* ── Thought / speech bubble ── */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            key="bubble"
            initial={{ scale: 0, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: prefersReduced ? 0 : 0.55 }}
            className="absolute -top-[88px] left-1/2 -translate-x-1/2 w-52 z-10"
            style={{ transformOrigin: 'bottom center' }}
          >
            {/* Bubble tail — two escalating dots */}
            <div className="flex justify-center items-end gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-white border border-gray-200 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-white border border-gray-200 shadow-sm" />
            </div>
            {/* Bubble body */}
            <div
              className="bg-white rounded-2xl px-4 py-3 text-center border border-gray-100"
              style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.13)' }}
            >
              <p className="text-sm font-semibold text-gray-700 leading-snug">{bubble}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confetti burst (happy only, respects reduced-motion) ── */}
      {!prefersReduced && (
        <AnimatePresence>
          {state === 'happy' && <Confetti key="confetti" />}
        </AnimatePresence>
      )}
    </div>
  )
}
