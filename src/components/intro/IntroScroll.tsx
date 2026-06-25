'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { gsap } from 'gsap';

// ── Stable module-level data (computed once) ──────────────────────────────────
interface StarDatum { id: number; x: number; y: number; size: number; op: number }
const STARS: StarDatum[] = Array.from({ length: 220 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.6 + 0.3,
  op: Math.random() * 0.5 + 0.2,
}));

interface GalaxyDatum { id: number; x: number; y: number; rx: number; ry: number; angle: number; blur: number; op: number; speed: number; color: string }
const GALAXIES: GalaxyDatum[] = [
  { id: 0, x: 72, y: 20, rx: 88, ry: 32, angle: 25,  blur: 22, op: 0.07,  speed: 0.9,  color: '#a78bfa' },
  { id: 1, x: 16, y: 68, rx: 63, ry: 23, angle: -18, blur: 16, op: 0.06,  speed: 0.55, color: '#818cf8' },
  { id: 2, x: 85, y: 57, rx: 47, ry: 16, angle: 42,  blur: 12, op: 0.045, speed: 0.32, color: '#c4b5fd' },
  { id: 3, x: 9,  y: 34, rx: 35, ry: 13, angle: -8,  blur: 9,  op: 0.035, speed: 0.18, color: '#7c3aed' },
];
const ORB_MIN = { size: 38,  op: 0.04 };
const ORB_MAX = { size: 340, op: 0.42 };

const DELTA_THRESHOLD = 180;
const LOCK_MS         = 700;
const SCENE_COUNT     = 6; // scenes 0-5; advancing from 5 triggers warp-exit

// ── Framer-motion variants ────────────────────────────────────────────────────
const fadeV: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit:    { opacity: 0, transition: { duration: 0.35 } },
};

const riseV: Variants = {
  hidden:  { opacity: 0, y: 34 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.16, duration: 0.65, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -16, transition: { duration: 0.28, ease: 'easeIn' } },
};

// Slower stagger — dramatic title-card beats for the stats scene
const statV: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: 0.25 + i * 0.65, duration: 0.55, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.22 } },
};

// ── Scene 0 — Deep space ──────────────────────────────────────────────────────
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

// ── Scene 1 — The journey begins ──────────────────────────────────────────────
function Scene1() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        custom={0}
        variants={riseV}
        initial="hidden" animate="visible" exit="exit"
        className="font-mono text-xs tracking-[0.4em] text-amber-400/60 uppercase"
      >
        — From Kuala Lumpur to Sendai —
      </motion.p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
        {['Architect.', 'Researcher.', 'Builder'].map((w, i) => (
          <motion.span
            key={w}
            custom={i + 1}
            variants={riseV}
            initial="hidden" animate="visible" exit="exit"
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-none"
          >
            {w}
          </motion.span>
        ))}
      </div>
      <motion.p
        custom={5}
        variants={riseV}
        initial="hidden" animate="visible" exit="exit"
        className="font-mono text-sm text-white/38 tracking-wide max-w-md"
      >
        {"of things that didn't exist yet."}
      </motion.p>
    </div>
  );
}

// ── Scene 2 — The work ────────────────────────────────────────────────────────
const STATS = [
  '40+ buildings designed.',
  'PhD research in thermal comfort.',
  'AI tools used by thousands.',
];

function Scene2() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-8 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="font-mono text-[10px] tracking-[0.5em] uppercase text-white/30"
      >
        — The work —
      </motion.p>
      {STATS.map((stat, i) => (
        <motion.p
          key={stat}
          custom={i}
          variants={statV}
          initial="hidden" animate="visible" exit="exit"
          className="text-2xl md:text-4xl font-bold text-white tracking-tight"
        >
          {stat}
        </motion.p>
      ))}
    </div>
  );
}

// ── Scene 3 — The philosophy ──────────────────────────────────────────────────
function Scene3() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-mono text-[10px] tracking-[0.5em] uppercase text-white/30 mb-8"
        >
          — The philosophy —
        </motion.p>
        <motion.h2
          custom={0}
          variants={riseV}
          initial="hidden" animate="visible" exit="exit"
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight"
        >
          Every problem
          <br />
          is a design problem.
        </motion.h2>
      </div>
    </div>
  );
}

// ── Scene 4 — AIBO teaser ─────────────────────────────────────────────────────
function Scene4() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.div
        initial={{ scale: 0.55, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.75, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          animate={{ scale: [1, 1.13, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full mx-auto"
          style={{
            background: 'radial-gradient(circle at 38% 32%, #fcd34d 0%, #f59e0b 45%, rgba(217,119,6,0.25) 78%, transparent 100%)',
            boxShadow: '0 0 34px 9px rgba(245,158,11,0.28), 0 0 68px 22px rgba(217,119,6,0.11)',
          }}
        />
      </motion.div>

      <motion.h2
        custom={0}
        variants={riseV}
        initial="hidden" animate="visible" exit="exit"
        className="text-4xl md:text-6xl font-bold text-white tracking-tight"
      >
        Meet Web Witch.
      </motion.h2>

      <motion.p
        custom={1}
        variants={riseV}
        initial="hidden" animate="visible" exit="exit"
        className="font-mono text-sm text-white/45 max-w-sm leading-relaxed"
      >
        {"She knows every project and the story behind it."}
        <br />
        {"Ask her anything."}
      </motion.p>

      <motion.div
        custom={2}
        variants={riseV}
        initial="hidden" animate="visible" exit="exit"
        className="absolute bottom-14 left-10 flex items-center gap-2 text-amber-400/50"
      >
        <motion.span
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base leading-none"
        >
          {'←'}
        </motion.span>
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase">Ask Aibo</span>
      </motion.div>
    </div>
  );
}

// ── Scene 5 — Welcome / reveal setup ─────────────────────────────────────────
function Scene5() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-mono text-[10px] tracking-[0.5em] uppercase text-white/30 mb-8"
        >
          — Entering orbit —
        </motion.p>
        <motion.h2
          custom={0}
          variants={riseV}
          initial="hidden" animate="visible" exit="exit"
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
        >
          Welcome to his universe.
        </motion.h2>
        <motion.p
          custom={1}
          variants={riseV}
          initial="hidden" animate="visible" exit="exit"
          className="mt-8 font-mono text-xs tracking-[0.35em] uppercase text-white/25"
        >
          scroll to enter
        </motion.p>
      </div>
    </div>
  );
}

// ── Background: destination orb + galaxy clusters ─────────────────────────────
function BackgroundEffects({
  orbRef,
  galaxyRefs,
}: {
  orbRef: React.RefObject<HTMLDivElement | null>;
  galaxyRefs: { current: Array<HTMLDivElement | null> };
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Destination orb — grows toward viewer as journey progresses */}
      <div
        ref={orbRef}
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '48%',
          transform: 'translate(-50%, -50%)',
          width: `${ORB_MIN.size}px`,
          height: `${ORB_MIN.size}px`,
          opacity: ORB_MIN.op,
          background:
            'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9) 0%, #f59e0b 20%, rgba(245,158,11,0.12) 60%, transparent 100%)',
          filter: 'blur(5px)',
          willChange: 'width, height, opacity',
        }}
      />
      {/* Galaxy clusters — parallax drift at different depths */}
      {GALAXIES.map((g, i) => (
        <div
          key={g.id}
          ref={el => { galaxyRefs.current[i] = el; }}
          style={{
            position: 'absolute',
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: `${g.rx * 2}px`,
            height: `${g.ry * 2}px`,
            transform: `translate(-50%, -50%) rotate(${g.angle}deg)`,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${g.color} 0%, transparent 70%)`,
            filter: `blur(${g.blur}px)`,
            opacity: g.op,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}

// ── Star field — pure DOM, no extra canvas ────────────────────────────────────
function StarField({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map(s => (
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

// ── Main export ───────────────────────────────────────────────────────────────
export default function IntroScroll() {
  const [scene, setScene]     = useState(0);
  const [visible, setVisible] = useState(true);

  const wrapperRef    = useRef<HTMLDivElement>(null);
  const starsRef      = useRef<HTMLDivElement>(null);
  const orbRef        = useRef<HTMLDivElement>(null);
  const galaxyRefs    = useRef<Array<HTMLDivElement | null>>([]);
  const deltaRef      = useRef(0);         // signed: +ve = scroll-down
  const lockRef       = useRef(false);
  const completingRef = useRef(false);     // true once warp-exit has started
  const sceneRef      = useRef(0);
  const touchYRef     = useRef(0);
  const gsapTlRef     = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => { sceneRef.current = scene; }, [scene]);

  // ── Continuous background update (called on every wheel delta) ───────────
  const updateBackground = useCallback((rawProgress: number) => {
    const p = Math.min(1, Math.max(0, rawProgress));
    if (orbRef.current) {
      gsap.set(orbRef.current, {
        width:   ORB_MIN.size + p * (ORB_MAX.size - ORB_MIN.size),
        height:  ORB_MIN.size + p * (ORB_MAX.size - ORB_MIN.size),
        opacity: ORB_MIN.op  + p * (ORB_MAX.op  - ORB_MIN.op),
      });
    }
    galaxyRefs.current.forEach((el, i) => {
      if (!el) return;
      const g = GALAXIES[i];
      if (!g) return;
      gsap.set(el, { y: -p * 280 * g.speed });
    });
  }, []);

  // ── GSAP star animations ──────────────────────────────────────────────────
  const runStarAnim = useCallback((s: number) => {
    const container = starsRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-star]'));
    gsapTlRef.current?.kill();

    if (s === 0 || s === 3) {
      // Restore: static field
      gsap.to(els, {
        x: 0, y: 0, scaleX: 1, scaleY: 1,
        opacity: (i: number) => STARS[i]?.op ?? 0.4,
        duration: 0.75, ease: 'power2.out',
      });
    } else if (s === 1 || s === 4) {
      // Gentle parallax drift (scene 1 slightly more dramatic)
      const factor = s === 1 ? 0.06 : 0.04;
      els.forEach((el, i) => {
        const star = STARS[i];
        if (!star) return;
        gsap.to(el, {
          x: (star.x - 50) * factor,
          y: (star.y - 50) * factor,
          duration: 1.5, ease: 'power1.inOut', delay: i * 0.001,
        });
      });
    } else if (s === 2) {
      // Impact streaks: brief elongation to punctuate the stat reveals
      const tl = gsap.timeline();
      tl.to(els, {
        scaleY: 5, opacity: 0.9, duration: 0.22, ease: 'power3.in',
        stagger: { amount: 0.2, from: 'random' },
      }).to(els, {
        scaleY: 1, opacity: (i: number) => STARS[i]?.op ?? 0.4,
        duration: 0.45, ease: 'power2.out',
        stagger: { amount: 0.15, from: 'random' },
      });
      gsapTlRef.current = tl;
    } else if (s === 5) {
      // Pre-warp: subtle inward pull to build tension
      const W = window.innerWidth, H = window.innerHeight;
      const cx = W / 2, cy = H / 2;
      els.forEach((el, i) => {
        const star = STARS[i];
        if (!star) return;
        gsap.to(el, {
          x: -(star.x / 100 * W - cx) * 0.08,
          y: -(star.y / 100 * H - cy) * 0.08,
          duration: 1.8, ease: 'power1.inOut', delay: i * 0.001,
        });
      });
    } else if (s >= SCENE_COUNT) {
      // Warp exit: stars streak radially outward from centre
      const W = window.innerWidth, H = window.innerHeight;
      const cx = W / 2, cy = H / 2;
      const tl = gsap.timeline();
      tl.to(els, {
        duration: 0.65, ease: 'power3.in', stagger: { amount: 0.15 },
        opacity: 0, scaleY: 10,
        x: (i: number) => { const star = STARS[i]; return star ? (star.x / 100) * W - cx : 0; },
        y: (i: number) => { const star = STARS[i]; return star ? (star.y / 100) * H - cy : 0; },
      });
      gsapTlRef.current = tl;
    }
  }, []);

  // ── Complete intro: warp out then unmount ────────────────────────────────
  // Intentionally does NOT check lockRef — advance() sets the lock before calling this.
  const completeIntro = useCallback(() => {
    if (!visible || completingRef.current) return;
    completingRef.current = true;
    lockRef.current = true;
    runStarAnim(SCENE_COUNT);
    setScene(SCENE_COUNT);
    gsap.to(wrapperRef.current, {
      opacity: 0, duration: 0.9, delay: 0.5, ease: 'power2.inOut',
      onComplete: () => setVisible(false),
    });
  }, [visible, runStarAnim]);

  // ── Advance ───────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    lockRef.current = true;
    const next = sceneRef.current + 1;
    if (next >= SCENE_COUNT) {
      completeIntro();
      return;
    }
    sceneRef.current = next;
    setScene(next);
    runStarAnim(next);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible, completeIntro, runStarAnim]);

  // ── Retreat ───────────────────────────────────────────────────────────────
  const retreat = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    const prev = sceneRef.current - 1;
    if (prev < 0) return;
    lockRef.current = true;
    sceneRef.current = prev;
    setScene(prev);
    runStarAnim(prev);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible, runStarAnim]);

  // Stable refs so event listeners never need to rebind on callback change
  const advanceRef  = useRef(advance);
  const retreatRef  = useRef(retreat);
  const updateBgRef = useRef(updateBackground);
  useEffect(() => { advanceRef.current  = advance;          }, [advance]);
  useEffect(() => { retreatRef.current  = retreat;          }, [retreat]);
  useEffect(() => { updateBgRef.current = updateBackground; }, [updateBackground]);

  // ── Capture wheel + touch — blocks OrbitControls beneath ─────────────────
  useEffect(() => {
    if (!visible) return;

    const computeProgress = () => {
      const withinScene = deltaRef.current / DELTA_THRESHOLD; // -1 to +1
      return (sceneRef.current + withinScene) / SCENE_COUNT;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      deltaRef.current += e.deltaY; // signed: down = positive
      updateBgRef.current(computeProgress());
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
      const cy = e.touches[0]?.clientY ?? 0;
      deltaRef.current += touchYRef.current - cy; // swipe up = positive
      touchYRef.current = cy;
      updateBgRef.current(computeProgress());
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

  useEffect(() => { return () => { gsapTlRef.current?.kill(); }; }, []);

  if (!visible) return null;

  const sceneNode: Record<number, React.ReactNode> = {
    0: <Scene0 />,
    1: <Scene1 />,
    2: <Scene2 />,
    3: <Scene3 />,
    4: <Scene4 />,
    5: <Scene5 />,
    6: null,
  };

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-50 bg-[#02050a]">
      {/* Background: orb + galaxies — behind the stars */}
      <BackgroundEffects orbRef={orbRef} galaxyRefs={galaxyRefs} />

      {/* Star field */}
      <StarField containerRef={starsRef} />

      {/* Scene content */}
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
