'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { gsap } from 'gsap';

// ── Stable data — module-level, client-only (loaded with { ssr: false }) ──────
interface StarDatum { id: number; x: number; y: number; size: number; op: number }

const STARS: StarDatum[] = Array.from({ length: 220 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.6 + 0.3,
  op: Math.random() * 0.5 + 0.2,
}));

// Each star pre-rotated so scaleY stretches it radially outward from centre.
// rotation = atan2(y-50, x-50) × (180/π) − 90
const STAR_ANGLES: number[] = STARS.map(s =>
  Math.atan2(s.y - 50, s.x - 50) * (180 / Math.PI) - 90
);

// ── Beat definitions — one scroll threshold per item ─────────────────────────
interface BeatDef {
  text: string;
  cls: string;          // Tailwind classes for this text
  showButton?: boolean; // render the pulsing Ask Aibo button beneath
}

const BEATS: BeatDef[] = [
  // — Qualities —
  { text: 'Visionary.',  cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  { text: 'Innovator.',  cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  { text: 'Designer.',   cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  { text: 'Builder.',    cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  // — Roles —
  { text: 'Creator of New Possibilities.',  cls: 'text-3xl md:text-5xl font-semibold text-white tracking-tight leading-snug' },
  { text: 'Designer of Digital Systems.',   cls: 'text-3xl md:text-5xl font-semibold text-white tracking-tight leading-snug' },
  { text: 'Shaper of Built Environments.', cls: 'text-3xl md:text-5xl font-semibold text-white tracking-tight leading-snug' },
  // — Proof —
  { text: 'Master of Architecture, UK. PhD in Building Energy Science, Japan.', cls: 'text-xl md:text-3xl font-bold text-white tracking-tight leading-snug max-w-2xl' },
  { text: '10 years of business development and construction management.',      cls: 'text-lg md:text-2xl font-semibold text-white/80 tracking-tight leading-snug max-w-xl' },
  { text: '10 years in applied AI and IoT.',                                    cls: 'text-lg md:text-2xl font-semibold text-white/80 tracking-tight leading-snug' },
  { text: 'Award winning architectural designer.',                               cls: 'text-lg md:text-2xl font-semibold text-white/80 tracking-tight leading-snug' },
  // — AIBO —
  { text: '“I am AIBO, created by Adam to be a guide through the vast universe of Adam’s Portfolio.”', cls: 'text-xl md:text-3xl font-semibold text-white/90 leading-relaxed max-w-2xl' },
  { text: '“Ask me anything.”', cls: 'text-2xl md:text-4xl font-semibold text-white/75', showButton: true },
];

const SCENE_COUNT = BEATS.length; // 13

// ── Config ────────────────────────────────────────────────────────────────────
const DELTA_THRESHOLD = 150; // one deliberate scroll per beat
const LOCK_MS         = 550;

// ── Framer-motion variants ────────────────────────────────────────────────────
const fadeV: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55 } },
  exit:    { opacity: 0, transition: { duration: 0.38 } },
};

const beatV: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.88 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -16, scale: 0.96, transition: { duration: 0.34 } },
};

// ── Single beat renderer ──────────────────────────────────────────────────────
function BeatScene({ beat, onSkip }: { beat: BeatDef; onSkip: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 md:px-20 text-center">
      <motion.p variants={beatV} initial="hidden" animate="visible" exit="exit" className={beat.cls}>
        {beat.text}
      </motion.p>

      {beat.showButton && (
        <motion.div
          className="absolute bottom-8 left-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.button
            onClick={onSkip}
            animate={{
              boxShadow: [
                '0 0 0px 0px rgba(245,158,11,0)',
                '0 0 20px 8px rgba(245,158,11,0.55)',
                '0 0 0px 0px rgba(245,158,11,0)',
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
            className="rounded-full bg-amber-500/15 border border-amber-500/45 px-5 py-2.5 font-mono text-xs tracking-[0.25em] uppercase text-amber-300 hover:bg-amber-500/25 transition-colors"
          >
            Ask Aibo ✦
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ── Star field — pure DOM, no canvas ─────────────────────────────────────────
function StarField({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((s, i) => (
        <div
          key={s.id}
          data-star=""
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.op,
            transform: `rotate(${STAR_ANGLES[i] ?? 0}deg)`,
            transformOrigin: 'center center',
          }}
        />
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function IntroScroll() {
  const [scene, setScene]     = useState(0);
  const [visible, setVisible] = useState(true);

  const wrapperRef    = useRef<HTMLDivElement>(null);
  const starsRef      = useRef<HTMLDivElement>(null);
  const deltaRef      = useRef(0);
  const lockRef       = useRef(false);
  const completingRef = useRef(false);
  const sceneRef      = useRef(0);
  const touchYRef     = useRef(0);
  const warpTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gsapTlRef     = useRef<gsap.core.Timeline | null>(null);

  const warpSettersRef = useRef<Array<(v: number) => void>>([]);

  useEffect(() => { sceneRef.current = scene; }, [scene]);

  // Set up per-star quickSetters once after first render
  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-star]'));
    warpSettersRef.current = els.map(
      el => gsap.quickSetter(el, 'scaleY') as unknown as (v: number) => void
    );
  }, []);

  // ── Warp effect ───────────────────────────────────────────────────────────
  const applyWarp = useCallback((factor: number) => {
    warpSettersRef.current.forEach(fn => fn(factor));
  }, []);

  const resetWarp = useCallback(() => {
    const container = starsRef.current;
    if (!container) return;
    gsap.to(container.querySelectorAll<HTMLElement>('[data-star]'), {
      scaleY: 1, duration: 0.4, ease: 'power2.out', overwrite: true,
    });
  }, []);

  const updateWarpFromVelocity = useCallback((deltaY: number) => {
    const factor = 1 + Math.min(Math.abs(deltaY) / 25, 9);
    applyWarp(factor);
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
    warpTimerRef.current = setTimeout(resetWarp, 140);
  }, [applyWarp, resetWarp]);

  // ── Warp-exit: radial streak then fade ───────────────────────────────────
  const runWarpExit = useCallback(() => {
    const container = starsRef.current;
    if (!container) return;
    gsapTlRef.current?.kill();
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-star]'));
    gsap.killTweensOf(els);
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    gsapTlRef.current = gsap.timeline().to(els, {
      duration: 0.7, ease: 'power3.in', stagger: { amount: 0.12 },
      opacity: 0, scaleY: 14,
      x: (i: number) => { const s = STARS[i]; return s ? (s.x / 100) * W - cx : 0; },
      y: (i: number) => { const s = STARS[i]; return s ? (s.y / 100) * H - cy : 0; },
    });
  }, []);

  // ── Complete intro ────────────────────────────────────────────────────────
  const completeIntro = useCallback(() => {
    if (!visible || completingRef.current) return;
    completingRef.current = true;
    lockRef.current = true;
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
    runWarpExit();
    setScene(SCENE_COUNT);
    gsap.to(wrapperRef.current, {
      opacity: 0, duration: 1.0, delay: 0.45, ease: 'power2.inOut',
      onComplete: () => setVisible(false),
    });
  }, [visible, runWarpExit]);

  // ── Advance / retreat ─────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    lockRef.current = true;
    const next = sceneRef.current + 1;
    if (next >= SCENE_COUNT) { completeIntro(); return; }
    sceneRef.current = next;
    setScene(next);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible, completeIntro]);

  const retreat = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    const prev = sceneRef.current - 1;
    if (prev < 0) return;
    lockRef.current = true;
    sceneRef.current = prev;
    setScene(prev);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible]);

  const advanceRef = useRef(advance);
  const retreatRef = useRef(retreat);
  const warpRef    = useRef(updateWarpFromVelocity);
  useEffect(() => { advanceRef.current = advance;               }, [advance]);
  useEffect(() => { retreatRef.current = retreat;               }, [retreat]);
  useEffect(() => { warpRef.current    = updateWarpFromVelocity; }, [updateWarpFromVelocity]);

  // ── Event listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (completingRef.current) return;
      warpRef.current(e.deltaY);
      deltaRef.current += e.deltaY;
      if (deltaRef.current >= DELTA_THRESHOLD) {
        deltaRef.current = 0;
        advanceRef.current();
      } else if (deltaRef.current <= -DELTA_THRESHOLD) {
        deltaRef.current = 0;
        retreatRef.current();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? 0;
      deltaRef.current  = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (completingRef.current) return;
      const cy = e.touches[0]?.clientY ?? 0;
      const dy = touchYRef.current - cy;
      touchYRef.current = cy;
      warpRef.current(dy * 4);
      deltaRef.current += dy;
      if (deltaRef.current >= DELTA_THRESHOLD) {
        deltaRef.current = 0;
        advanceRef.current();
      } else if (deltaRef.current <= -DELTA_THRESHOLD) {
        deltaRef.current = 0;
        retreatRef.current();
      }
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });

    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      gsapTlRef.current?.kill();
      if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  const currentBeat = BEATS[scene]; // undefined once scene === SCENE_COUNT (warp exit)

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-50 bg-[#02050a]">
      <StarField containerRef={starsRef} />

      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          variants={fadeV}
          initial="hidden" animate="visible" exit="exit"
          className="absolute inset-0"
        >
          {currentBeat ? (
            <BeatScene beat={currentBeat} onSkip={completeIntro} />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {!completingRef.current && (
        <button
          onClick={completeIntro}
          className="absolute top-5 right-6 z-10 font-mono text-[10px] tracking-[0.3em] uppercase text-white/25 hover:text-white/55 transition-colors duration-200"
        >
          Skip {'→'}
        </button>
      )}
    </div>
  );
}
