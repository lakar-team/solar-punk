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

// Each star is pre-rotated so its Y axis aligns radially outward from center.
// rotation = atan2(y-50, x-50) × (180/π) − 90
const STAR_ANGLES: number[] = STARS.map(s =>
  Math.atan2(s.y - 50, s.x - 50) * (180 / Math.PI) - 90
);

// ── Config ────────────────────────────────────────────────────────────────────
const DELTA_THRESHOLD = 300; // "hold zone" — ~3 mousewheel ticks to advance
const LOCK_MS         = 600; // cooldown after each scene transition
const SCENE_COUNT     = 4;   // scenes 0–3; advancing from 3 → warp-exit

// ── Framer-motion variants ────────────────────────────────────────────────────
const fadeV: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55 } },
  exit:    { opacity: 0, transition: { duration: 0.38 } },
};

// Words float in from below with subtle scale — "from deep space" feel
const wordV: Variants = {
  hidden:  { opacity: 0, y: 50, scale: 0.82 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: 0.1 + i * 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -14, scale: 0.96, transition: { duration: 0.35 } },
};

// Lines slide in from slightly below, sequentially
const lineV: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.2 + i * 0.55, duration: 0.7, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.32 } },
};

// ── Scene 0 — Qualities ───────────────────────────────────────────────────────
const QUALITIES = ['Visionary.', 'Innovator.', 'Designer.', 'Builder.'];

function Scene0() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 md:gap-4">
      {QUALITIES.map((word, i) => (
        <motion.span
          key={word}
          custom={i}
          variants={wordV}
          initial="hidden" animate="visible" exit="exit"
          className="text-5xl md:text-7xl font-bold tracking-tight text-white"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// ── Scene 1 — Roles ───────────────────────────────────────────────────────────
const ROLES = [
  'Creator of New Possibilities.',
  'Designer of Digital Systems.',
  'Shaper of Built Environments.',
];

function Scene1() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
      {ROLES.map((line, i) => (
        <motion.p
          key={line}
          custom={i}
          variants={lineV}
          initial="hidden" animate="visible" exit="exit"
          className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-snug"
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

// ── Scene 2 — Proof ───────────────────────────────────────────────────────────
const PROOF = [
  'Master of Architecture, UK. PhD in Building Energy Science, Japan.',
  '10 years of business development and construction management.',
  '10 years in applied AI and IoT.',
  'Award winning architectural designer.',
];

function Scene2() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-8 md:px-24 text-center">
      {PROOF.map((line, i) => (
        <motion.p
          key={line}
          custom={i}
          variants={lineV}
          initial="hidden" animate="visible" exit="exit"
          className={
            i === 0
              ? 'text-xl md:text-3xl font-bold text-white tracking-tight leading-snug'
              : 'text-lg md:text-2xl font-semibold text-white/80 tracking-tight leading-snug'
          }
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

// ── Scene 3 — AIBO handoff ────────────────────────────────────────────────────
function Scene3({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.p
        custom={0}
        variants={wordV}
        initial="hidden" animate="visible" exit="exit"
        className="text-xl md:text-3xl font-semibold text-white/90 max-w-2xl leading-relaxed"
      >
        {'“I am AIBO, created by Adam to be a guide through the vast universe of Adam’s Portfolio.”'}
      </motion.p>

      <motion.p
        custom={1}
        variants={wordV}
        initial="hidden" animate="visible" exit="exit"
        className="text-2xl md:text-4xl font-semibold text-white/75"
      >
        {'“Ask me anything.”'}
      </motion.p>

      {/* Pulsing Ask Aibo button — positioned to match where the real HUD button will appear */}
      <motion.div
        custom={2}
        variants={wordV}
        initial="hidden" animate="visible" exit="exit"
        className="absolute bottom-8 left-8"
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
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          className="rounded-full bg-amber-500/15 border border-amber-500/45 px-5 py-2.5 font-mono text-xs tracking-[0.25em] uppercase text-amber-300 transition-colors hover:bg-amber-500/25"
        >
          Ask Aibo ✦
        </motion.button>
      </motion.div>
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
            // Pre-rotated so scaleY stretches radially outward from centre
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

  // quickSetter per-star — initialized once after first render
  const warpSettersRef = useRef<Array<(v: number) => void>>([]);

  useEffect(() => { sceneRef.current = scene; }, [scene]);

  // Set up per-star quickSetters for high-frequency scaleY updates
  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-star]'));
    warpSettersRef.current = els.map(
      el => gsap.quickSetter(el, 'scaleY') as unknown as (v: number) => void
    );
  }, []); // runs once on mount

  // ── Warp: apply scaleY instantly via quickSetters ─────────────────────────
  const applyWarp = useCallback((factor: number) => {
    warpSettersRef.current.forEach(fn => fn(factor));
  }, []);

  // Ease stars back to normal dots when scroll stops
  const resetWarp = useCallback(() => {
    const container = starsRef.current;
    if (!container) return;
    const els = container.querySelectorAll<HTMLElement>('[data-star]');
    gsap.to(els, { scaleY: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
  }, []);

  // Map raw deltaY to warp factor and debounce the reset
  const updateWarpFromVelocity = useCallback((deltaY: number) => {
    const vel    = Math.abs(deltaY);
    const factor = 1 + Math.min(vel / 25, 9); // 1× still → 10× max warp
    applyWarp(factor);
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
    warpTimerRef.current = setTimeout(resetWarp, 140);
  }, [applyWarp, resetWarp]);

  // ── Warp-exit: full radial streak + translate to edges ───────────────────
  const runWarpExit = useCallback(() => {
    const container = starsRef.current;
    if (!container) return;
    gsapTlRef.current?.kill();
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-star]'));
    gsap.killTweensOf(els);
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const tl = gsap.timeline();
    tl.to(els, {
      duration: 0.7, ease: 'power3.in', stagger: { amount: 0.12 },
      opacity: 0, scaleY: 14,
      x: (i: number) => { const s = STARS[i]; return s ? (s.x / 100) * W - cx : 0; },
      y: (i: number) => { const s = STARS[i]; return s ? (s.y / 100) * H - cy : 0; },
    });
    gsapTlRef.current = tl;
  }, []);

  // ── Complete intro — warp out then reveal solar system ───────────────────
  // Does NOT check lockRef — advance() already sets it before calling here.
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

  // ── Advance ───────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    lockRef.current = true;
    const next = sceneRef.current + 1;
    if (next >= SCENE_COUNT) { completeIntro(); return; }
    sceneRef.current = next;
    setScene(next);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible, completeIntro]);

  // ── Retreat ───────────────────────────────────────────────────────────────
  const retreat = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    const prev = sceneRef.current - 1;
    if (prev < 0) return;
    lockRef.current = true;
    sceneRef.current = prev;
    setScene(prev);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible]);

  // Stable refs — event handlers capture these, not closures
  const advanceRef = useRef(advance);
  const retreatRef = useRef(retreat);
  const warpRef    = useRef(updateWarpFromVelocity);
  useEffect(() => { advanceRef.current = advance;               }, [advance]);
  useEffect(() => { retreatRef.current = retreat;               }, [retreat]);
  useEffect(() => { warpRef.current    = updateWarpFromVelocity; }, [updateWarpFromVelocity]);

  // ── Capture wheel + touch — blocks OrbitControls beneath ─────────────────
  useEffect(() => {
    if (!visible) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (completingRef.current) return; // let warp-exit play uninterrupted
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
      const dy = touchYRef.current - cy; // swipe up = positive
      touchYRef.current = cy;
      warpRef.current(dy * 4); // scale up so touch triggers visible warp
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

  const sceneNode: Record<number, React.ReactNode> = {
    0: <Scene0 />,
    1: <Scene1 />,
    2: <Scene2 />,
    3: <Scene3 onSkip={completeIntro} />,
    4: null,
  };

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
          {sceneNode[scene] ?? null}
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
