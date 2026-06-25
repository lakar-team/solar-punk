'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { gsap } from 'gsap';

// ── Stable star data (module-level: computed once, never changes) ────────────
interface StarDatum {
  id: number;
  x: number;
  y: number;
  size: number;
  op: number;
}

const STARS: StarDatum[] = Array.from({ length: 220 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.6 + 0.3,
  op: Math.random() * 0.5 + 0.2,
}));

const DELTA_THRESHOLD = 180;
const LOCK_MS = 750;
const SCENE_COUNT = 5;

const fadeV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit:   { opacity: 0, transition: { duration: 0.35 } },
};

const riseV: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.16, duration: 0.65, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -16, transition: { duration: 0.28, ease: 'easeIn' } },
};

// ── Scene 0 — Deep space ─────────────────────────────────────────────────────
function Scene0() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-12">
      <motion.p
        animate={{ opacity: [0, 0.45, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="font-mono text-[10px] tracking-[0.45em] uppercase text-white/40"
      >
        scroll to begin
      </motion.p>
    </div>
  );
}

// ── Scene 1 — Identity ───────────────────────────────────────────────────────
function Scene1() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-8 text-center">
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
        {['Architect.', 'Researcher.', 'Builder.'].map((word, i) => (
          <motion.span
            key={word}
            custom={i}
            variants={riseV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-none"
          >
            {word}
          </motion.span>
        ))}
      </div>
      <motion.p
        custom={3}
        variants={riseV}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="font-mono text-sm md:text-base text-white/45 tracking-widest"
      >
        Based in Sendai.{' '}Building across disciplines.
      </motion.p>
    </div>
  );
}

// ── Scene 2 — The universe ───────────────────────────────────────────────────
function Scene2() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
      <motion.h2
        custom={0}
        variants={riseV}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-4xl md:text-6xl font-bold text-white tracking-tight"
      >
        {"This is Adam’s universe."}
      </motion.h2>
      <motion.p
        custom={1}
        variants={riseV}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="font-mono text-sm md:text-base text-white/45"
      >
        Every planet is something real he made.
      </motion.p>
    </div>
  );
}

// ── Scene 3 — AIBO teaser ────────────────────────────────────────────────────
function Scene3() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.div
        initial={{ scale: 0.55, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.75, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.13, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 38% 32%, #fcd34d 0%, #f59e0b 45%, rgba(217,119,6,0.25) 78%, transparent 100%)',
            boxShadow:
              '0 0 34px 9px rgba(245,158,11,0.28), 0 0 68px 22px rgba(217,119,6,0.11)',
          }}
        />
      </motion.div>

      <motion.h2
        custom={0}
        variants={riseV}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-4xl md:text-6xl font-bold text-white tracking-tight"
      >
        Meet Web Witch.
      </motion.h2>

      <motion.p
        custom={1}
        variants={riseV}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="font-mono text-sm md:text-base text-white/45 max-w-sm leading-relaxed"
      >
        {"She knows every project and the story behind it. Use the "}
        <span className="text-amber-400 font-semibold">Ask Aibo</span>
        {" button — she’s waiting."}
      </motion.p>

      <motion.div
        custom={2}
        variants={riseV}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute bottom-14 left-10 flex items-center gap-2 text-amber-400/50"
      >
        <motion.span
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base leading-none"
        >
          {'←'}
        </motion.span>
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase">
          Ask Aibo
        </span>
      </motion.div>
    </div>
  );
}

// ── Star field — pure DOM, no canvas ────────────────────────────────────────
function StarField({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {STARS.map((s) => (
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
            transformOrigin: 'center center',
          }}
        />
      ))}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function IntroScroll() {
  const [scene, setScene] = useState(0);
  const [visible, setVisible] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const starsRef   = useRef<HTMLDivElement>(null);
  const deltaRef   = useRef(0);
  const lockRef    = useRef(false);
  const sceneRef   = useRef(0);
  const touchYRef  = useRef(0);
  const gsapTlRef  = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => { sceneRef.current = scene; }, [scene]);

  // ── GSAP star animations per scene ──────────────────────────────────────
  const runStarAnim = useCallback((s: number) => {
    const container = starsRef.current;
    if (!container) return;
    const els = Array.from(
      container.querySelectorAll<HTMLElement>('[data-star]'),
    );
    gsapTlRef.current?.kill();

    if (s === 0 || s === 3) {
      // Restore stars to normal
      gsap.to(els, {
        x: 0, y: 0, scaleX: 1, scaleY: 1,
        opacity: (i: number) => STARS[i]?.op ?? 0.4,
        duration: 0.75,
        ease: 'power2.out',
      });
    } else if (s === 1) {
      // Slow parallax drift toward/away from center
      els.forEach((el, i) => {
        const star = STARS[i];
        if (!star) return;
        gsap.to(el, {
          x: (star.x - 50) * 0.06,
          y: (star.y - 50) * 0.06,
          duration: 1.5,
          ease: 'power1.inOut',
          delay: i * 0.001,
        });
      });
    } else if (s === 2) {
      // Warp streaks: elongate then snap back
      const tl = gsap.timeline();
      tl.to(els, {
        scaleY: 7,
        opacity: 0.9,
        duration: 0.32,
        ease: 'power3.in',
        stagger: { amount: 0.25, from: 'random' },
      }).to(els, {
        scaleY: 1,
        opacity: (i: number) => STARS[i]?.op ?? 0.4,
        duration: 0.5,
        ease: 'power2.out',
        stagger: { amount: 0.2, from: 'random' },
      });
      gsapTlRef.current = tl;
    } else if (s === 4) {
      // Final warp: stars streak radially outward from screen centre
      const W  = window.innerWidth;
      const H  = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;
      const tl = gsap.timeline();
      tl.to(els, {
        duration: 0.65,
        ease: 'power3.in',
        stagger: { amount: 0.15 },
        opacity: 0,
        scaleY: 10,
        x: (i: number) => {
          const star = STARS[i];
          return star ? (star.x / 100) * W - cx : 0;
        },
        y: (i: number) => {
          const star = STARS[i];
          return star ? (star.y / 100) * H - cy : 0;
        },
      });
      gsapTlRef.current = tl;
    }
  }, []);

  // ── Complete intro: warp out then unmount ────────────────────────────────
  const completeIntro = useCallback(() => {
    if (!visible || lockRef.current) return;
    lockRef.current = true;
    runStarAnim(4);
    setScene(4);
    gsap.to(wrapperRef.current, {
      opacity: 0,
      duration: 0.9,
      delay: 0.5,
      ease: 'power2.inOut',
      onComplete: () => setVisible(false),
    });
  }, [visible, runStarAnim]);

  // ── Advance to next scene ────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (lockRef.current || !visible) return;
    lockRef.current = true;
    const next = sceneRef.current + 1;
    if (next >= SCENE_COUNT) {
      completeIntro();
      return;
    }
    setScene(next);
    runStarAnim(next);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible, completeIntro, runStarAnim]);

  // Stable ref so event listener never rebinds on every advance change
  const advanceRef = useRef(advance);
  useEffect(() => { advanceRef.current = advance; }, [advance]);

  // ── Capture wheel + touch, preventDefault to block solar-system canvas ──
  useEffect(() => {
    if (!visible) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      deltaRef.current += Math.abs(e.deltaY);
      if (deltaRef.current >= DELTA_THRESHOLD) {
        deltaRef.current = 0;
        advanceRef.current();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const cy = e.touches[0]?.clientY ?? 0;
      deltaRef.current += Math.abs(touchYRef.current - cy);
      touchYRef.current = cy;
      if (deltaRef.current >= DELTA_THRESHOLD) {
        deltaRef.current = 0;
        advanceRef.current();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [visible]);

  useEffect(() => {
    return () => { gsapTlRef.current?.kill(); };
  }, []);

  if (!visible) return null;

  const sceneNode: Record<number, React.ReactNode> = {
    0: <Scene0 />,
    1: <Scene1 />,
    2: <Scene2 />,
    3: <Scene3 />,
    4: null,
  };

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-50 bg-[#02050a]">
      <StarField containerRef={starsRef} />

      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          variants={fadeV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0"
        >
          {sceneNode[scene]}
        </motion.div>
      </AnimatePresence>

      {scene < 4 && (
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
