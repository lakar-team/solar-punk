'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { gsap } from 'gsap';

/* ──────────────────────────────────────────────────────────────────────────
   Star field — calm, pure DOM (no canvas / no extra WebGL context).
   Each star is pre-rotated so its Y axis points radially outward from centre,
   so the final warp-exit can streak it straight out with a scaleY tween.
   ────────────────────────────────────────────────────────────────────────── */
interface StarDatum { id: number; x: number; y: number; size: number; op: number }

const STARS: StarDatum[] = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.5 + 0.3,
  op: Math.random() * 0.5 + 0.2,
}));

const STAR_ANGLES: number[] = STARS.map(s =>
  Math.atan2(s.y - 50, s.x - 50) * (180 / Math.PI) - 90,
);

/* ──────────────────────────────────────────────────────────────────────────
   Beats — one text item per scroll. scene -1 = name card, 0..12 = beats.
   ────────────────────────────────────────────────────────────────────────── */
interface BeatDef { text: string; cls: string }

const BEATS: BeatDef[] = [
  // Qualities
  { text: 'Visionary.', cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  { text: 'Innovator.', cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  { text: 'Designer.',  cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  { text: 'Builder.',   cls: 'text-6xl md:text-8xl font-bold text-white tracking-tight' },
  // Roles
  { text: 'Creator of New Possibilities.', cls: 'text-3xl md:text-5xl font-semibold text-white tracking-tight' },
  { text: 'Designer of Digital Systems.',  cls: 'text-3xl md:text-5xl font-semibold text-white tracking-tight' },
  { text: 'Shaper of Built Environments.', cls: 'text-3xl md:text-5xl font-semibold text-white tracking-tight' },
  // Proof
  { text: 'Master of Architecture, UK. PhD in Building Energy Science, Japan.', cls: 'text-xl md:text-3xl font-bold text-white tracking-tight leading-snug max-w-2xl' },
  { text: '10 years of business development and construction management.',      cls: 'text-lg md:text-2xl font-semibold text-white/85 tracking-tight leading-snug max-w-xl' },
  { text: '10 years in applied AI and IoT.',                                    cls: 'text-lg md:text-2xl font-semibold text-white/85 tracking-tight' },
  { text: 'Award winning architectural designer.',                              cls: 'text-lg md:text-2xl font-semibold text-white/85 tracking-tight' },
  // AIBO handoff
  { text: '“I am AIBO, created by Adam to be a guide through the vast universe of Adam’s Portfolio.”', cls: 'text-xl md:text-3xl font-semibold text-white/90 leading-relaxed max-w-2xl' },
  { text: '“Ask me anything.”', cls: 'text-3xl md:text-5xl font-semibold text-white/80' },
];

const SCENE_COUNT     = BEATS.length; // 13
const DELTA_THRESHOLD = 160;          // scroll distance per beat
const LOCK_MS         = 850;          // dwell between beats (text holds)
const LOCK_MS_AIBO    = 1300;         // AIBO beats linger longer

/* ──────────────────────────────────────────────────────────────────────────
   Line art — self-drawing SVG (framer-motion pathLength). White one-line
   sketches over the calm star field, one set per beat. viewBox 1000×600,
   centred; stroke kept crisp with non-scaling-stroke.
   ────────────────────────────────────────────────────────────────────────── */
function DrawPath({
  d, delay = 0, dur = 1.5, width = 1.6, opacity = 0.9,
}: { d: string; delay?: number; dur?: number; width?: number; opacity?: number }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="white"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{
        pathLength: { duration: dur, delay, ease: 'easeInOut' },
        opacity:    { duration: 0.3, delay },
      }}
    />
  );
}

// — Generators for the repetitive pieces —
function streaks() {
  const cx = 500, cy = 300;
  return Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 + 22) * Math.PI) / 180;
    const ox = cx + Math.cos(a) * 430, oy = cy + Math.sin(a) * 300;
    const mx = cx + Math.cos(a) * 280, my = cy + Math.sin(a) * 200;
    const ix = cx + Math.cos(a) * 150, iy = cy + Math.sin(a) * 110;
    const pa = a + Math.PI / 2;
    const fx = ix + Math.cos(pa) * 16, fy = iy + Math.sin(pa) * 16;
    const d = `M ${ox.toFixed(0)} ${oy.toFixed(0)} Q ${mx.toFixed(0)} ${my.toFixed(0)} ${ix.toFixed(0)} ${iy.toFixed(0)} M ${ix.toFixed(0)} ${iy.toFixed(0)} L ${fx.toFixed(0)} ${fy.toFixed(0)}`;
    return <DrawPath key={i} d={d} delay={i * 0.05} dur={0.6} />;
  });
}

function fireworks() {
  const bursts = [[300, 175], [705, 155], [825, 245], [320, 440], [765, 470]];
  const out: React.ReactNode[] = [];
  bursts.forEach(([bx, by], bi) => {
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + bi;
      const x0 = bx + Math.cos(a) * 12, y0 = by + Math.sin(a) * 12;
      const r1 = 50 + (k % 3) * 12;
      const x1 = bx + Math.cos(a) * r1, y1 = by + Math.sin(a) * r1;
      out.push(
        <DrawPath
          key={`${bi}-${k}`}
          d={`M ${x0.toFixed(0)} ${y0.toFixed(0)} L ${x1.toFixed(0)} ${y1.toFixed(0)}`}
          delay={bi * 0.13 + k * 0.03}
          dur={0.35}
          width={1.4}
        />,
      );
    }
  });
  return out;
}

function digitalRain() {
  const xs = [90, 180, 300, 410, 520, 600, 690, 780, 860, 930, 250, 470, 720, 360];
  return xs.map((x, i) => {
    const y0 = 60 + ((i * 53) % 110);
    const len = 130 + ((i * 71) % 170);
    const y1 = y0 + len;
    const d = `M ${x} ${y0} Q ${x + 6} ${(y0 + y1) / 2} ${x} ${y1}`;
    return <DrawPath key={i} d={d} delay={i * 0.05} dur={0.7} width={1.6} opacity={0.85} />;
  });
}

function tree(bx: number, topY: number, s: number, key: number, delay: number) {
  const d =
    `M ${bx} 545 L ${bx} ${topY + 95} ` +
    `C ${bx - 55 * s} ${topY + 60}, ${bx - 62 * s} ${topY - 12}, ${bx - 20 * s} ${topY} ` +
    `C ${bx - 42 * s} ${topY - 44}, ${bx + 12 * s} ${topY - 52}, ${bx + 22 * s} ${topY - 18} ` +
    `C ${bx + 64 * s} ${topY - 30}, ${bx + 58 * s} ${topY + 44}, ${bx + 12 * s} ${topY + 72} ` +
    `C ${bx + 24 * s} ${topY + 92}, ${bx + 6 * s} ${topY + 98}, ${bx} ${topY + 95}`;
  return <DrawPath key={key} d={d} delay={delay} dur={1.7} />;
}

function star5(cx: number, cy: number, r: number) {
  let d = '';
  for (let i = 0; i < 11; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d + 'Z';
}

// — Per-beat art —
function renderArt(i: number): React.ReactNode {
  switch (i) {
    case 0: // Forward motion streaks → Visionary
      return streaks();

    case 1: { // Drawing a box → Innovator
      const cx = 500, cy = 300, hw = 300, hh = 150, t = (-8 * Math.PI) / 180;
      const rot = (x: number, y: number) =>
        [cx + x * Math.cos(t) - y * Math.sin(t), cy + x * Math.sin(t) + y * Math.cos(t)];
      const [ax, ay] = rot(-hw, -hh), [bx, by] = rot(hw, -hh);
      const [dx, dy] = rot(hw, hh),  [ex, ey] = rot(-hw, hh);
      const box = `M ${ax.toFixed(0)} ${ay.toFixed(0)} L ${bx.toFixed(0)} ${by.toFixed(0)} L ${dx.toFixed(0)} ${dy.toFixed(0)} L ${ex.toFixed(0)} ${ey.toFixed(0)} Z`;
      return <DrawPath d={box} dur={2.0} />;
    }

    case 2: // Picasso-ish face → Designer
      return (
        <>
          <DrawPath
            d="M 545 110 C 660 95, 705 190, 690 305 C 680 405, 632 470, 555 468 C 500 466, 470 425, 480 378 C 488 340, 470 305, 502 280 C 538 300, 590 312, 560 366"
            dur={2.1}
          />
          <DrawPath
            d="M 478 250 C 470 215, 500 198, 528 212 C 548 222, 545 250, 518 256 C 498 260, 484 258, 478 250"
            delay={0.6}
            dur={1.0}
          />
        </>
      );

    case 3: // City skyline → Builder
      return (
        <DrawPath
          d="M 60 360 L 200 360 L 200 252 L 252 252 L 252 360 L 300 360 L 300 182 L 360 182 L 360 360 L 430 360 L 430 222 L 472 222 L 472 360 L 540 360 L 540 150 L 602 150 L 602 360 L 680 360 L 680 240 L 722 240 L 722 360 L 800 360 L 800 200 L 842 200 L 842 360 L 940 360"
          dur={2.4}
        />
      );

    case 4: // Fireworks → Creator of New Possibilities
      return fireworks();

    case 5: // Digital rain → Designer of Digital Systems
      return digitalRain();

    case 6: // Trees growing → Shaper of Built Environments
      return (
        <>
          {tree(150, 250, 0.85, 0, 0)}
          {tree(330, 200, 1.1, 1, 0.35)}
          {tree(700, 175, 1.2, 2, 0.7)}
          {tree(865, 215, 0.95, 3, 1.05)}
        </>
      );

    case 7: // Paper certificate → Master / PhD
      return (
        <DrawPath
          d="M 400 200 L 592 194 L 700 530 L 300 536 Z"
          dur={1.8}
        />
      );

    case 8: // Construction crane → 10 yrs business / construction
      return (
        <>
          <DrawPath d="M 555 545 L 555 175" dur={1.2} />
          <DrawPath d="M 468 360 L 1010 175" delay={0.5} dur={1.4} />
          <DrawPath d="M 555 200 L 470 358" delay={1.1} dur={0.7} />
          <DrawPath d="M 1002 180 L 1002 298" delay={1.4} dur={0.6} />
        </>
      );

    case 9: // Computer + figure → 10 yrs applied AI and IoT
      return (
        <>
          {/* monitor */}
          <DrawPath d="M 205 248 L 402 232 L 412 360 L 212 376 Z" dur={1.4} />
          <DrawPath d="M 306 376 L 306 404" delay={0.6} dur={0.4} />
          <DrawPath d="M 232 420 Q 320 400 410 420 Q 320 446 232 420" delay={0.8} dur={1.0} />
          {/* walking figure */}
          <DrawPath d="M 778 178 C 752 176, 740 208, 762 224 C 784 236, 808 222, 800 200 C 796 182, 786 176, 778 178" delay={0.4} dur={1.0} />
          <DrawPath d="M 770 226 L 760 360 L 722 470 M 760 360 L 802 360 L 822 470" delay={1.0} dur={1.2} />
          <DrawPath d="M 764 268 L 720 332 M 764 268 L 818 300" delay={1.4} dur={0.9} />
        </>
      );

    case 10: // Award medal (no sketch provided — one-line medal + star + ribbons)
      return (
        <>
          <DrawPath
            d="M 500 128 C 562 128, 592 174, 592 202 C 592 252, 552 286, 500 286 C 448 286, 408 252, 408 202 C 408 174, 438 128, 500 128 Z"
            dur={1.6}
          />
          <DrawPath d={star5(500, 204, 30)} delay={0.7} dur={1.1} />
          <DrawPath d="M 470 280 L 452 350 L 482 330 L 498 360" delay={1.0} dur={0.7} />
          <DrawPath d="M 530 280 L 548 350 L 518 330 L 502 360" delay={1.0} dur={0.7} />
        </>
      );

    case 11: // AIBO robed outline → handoff
    case 12: // lingers through "Ask me anything."
      return (
        <DrawPath
          d="M 778 92 C 752 150, 735 202, 750 236 C 720 250, 705 254, 722 270 C 700 302, 690 362, 700 432 C 695 502, 706 562, 732 600 L 818 600 C 838 540, 840 470, 847 420 C 854 360, 850 300, 836 270 C 856 252, 850 236, 832 236 C 840 200, 824 150, 800 110 C 793 98, 784 90, 778 92 Z"
          dur={2.4}
        />
      );

    default:
      return null;
  }
}

function LineArtLayer({ scene }: { scene: number }) {
  // AIBO art (11 & 12) shares a key so it stays drawn instead of redrawing.
  const artKey = scene === 12 ? 11 : scene;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.svg
          key={artKey}
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* gentle, mysterious drift of the whole drawing */}
          <motion.g
            animate={{ y: [0, -10, 0], rotate: [0, 0.4, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '500px 300px' }}
          >
            {renderArt(artKey)}
          </motion.g>
        </motion.svg>
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Name card — the opening screen, shown before the scroll sequence.
   ────────────────────────────────────────────────────────────────────────── */
function NameCard() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 30, letterSpacing: '0.3em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0.02em' }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-7xl md:text-9xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_40px_rgba(245,158,11,0.25)]"
      >
        Adam Raman
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="font-mono text-[10px] tracking-[0.45em] uppercase text-white/40"
      >
        scroll to begin
      </motion.p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Beat text + (on AIBO beats) the pulsing Ask Aibo button.
   ────────────────────────────────────────────────────────────────────────── */
const beatV: Variants = {
  hidden:  { opacity: 0, y: 36, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.34 } },
};

function BeatText({ beat }: { beat: BeatDef }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 md:px-20 text-center">
      <motion.p variants={beatV} initial="hidden" animate="visible" exit="exit" className={beat.cls}>
        {beat.text}
      </motion.p>
    </div>
  );
}

function AskAiboButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      className="absolute bottom-8 left-8 z-20"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <motion.button
        onClick={onClick}
        animate={{
          boxShadow: [
            '0 0 0px 0px rgba(245,158,11,0)',
            '0 0 22px 9px rgba(245,158,11,0.5)',
            '0 0 0px 0px rgba(245,158,11,0)',
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="rounded-full border border-amber-500/45 bg-amber-500/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.25em] text-amber-300 transition-colors hover:bg-amber-500/25"
      >
        Ask Aibo ✦
      </motion.button>
    </motion.div>
  );
}

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

/* ──────────────────────────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────────────────────────── */
export default function IntroScroll() {
  const [scene, setScene]     = useState(-1); // -1 = name card
  const [visible, setVisible] = useState(true);

  const wrapperRef    = useRef<HTMLDivElement>(null);
  const starsRef      = useRef<HTMLDivElement>(null);
  const deltaRef      = useRef(0);
  const lockRef       = useRef(false);
  const completingRef = useRef(false);
  const sceneRef      = useRef(-1);
  const touchYRef     = useRef(0);
  const gsapTlRef     = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => { sceneRef.current = scene; }, [scene]);

  // Gentle, continuous drift of the whole star field — alive but calm.
  useEffect(() => {
    if (!starsRef.current) return;
    const tween = gsap.to(starsRef.current, {
      x: 14, y: -10, duration: 16, ease: 'sine.inOut', repeat: -1, yoyo: true,
    });
    return () => { tween.kill(); };
  }, []);

  // ── Final warp-exit: stars streak radially out, then reveal solar system ──
  const runWarpExit = useCallback(() => {
    const container = starsRef.current;
    if (!container) return;
    gsapTlRef.current?.kill();
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-star]'));
    gsap.killTweensOf(els);
    gsap.killTweensOf(container);
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    gsapTlRef.current = gsap.timeline().to(els, {
      duration: 0.75, ease: 'power3.in', stagger: { amount: 0.12 },
      opacity: 0, scaleY: 16,
      x: (i: number) => { const s = STARS[i]; return s ? (s.x / 100) * W - cx : 0; },
      y: (i: number) => { const s = STARS[i]; return s ? (s.y / 100) * H - cy : 0; },
    });
  }, []);

  const completeIntro = useCallback(() => {
    if (!visible || completingRef.current) return;
    completingRef.current = true;
    lockRef.current = true;
    runWarpExit();
    setScene(SCENE_COUNT);
    gsap.to(wrapperRef.current, {
      opacity: 0, duration: 1.0, delay: 0.5, ease: 'power2.inOut',
      onComplete: () => setVisible(false),
    });
  }, [visible, runWarpExit]);

  const advance = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    lockRef.current = true;
    const next = sceneRef.current + 1;
    if (next >= SCENE_COUNT) { completeIntro(); return; }
    sceneRef.current = next;
    setScene(next);
    setTimeout(() => { lockRef.current = false; }, next >= 11 ? LOCK_MS_AIBO : LOCK_MS);
  }, [visible, completeIntro]);

  const retreat = useCallback(() => {
    if (lockRef.current || !visible || completingRef.current) return;
    const prev = sceneRef.current - 1;
    if (prev < -1) return; // -1 (name card) is the floor
    lockRef.current = true;
    sceneRef.current = prev;
    setScene(prev);
    setTimeout(() => { lockRef.current = false; }, LOCK_MS);
  }, [visible]);

  const advanceRef = useRef(advance);
  const retreatRef = useRef(retreat);
  useEffect(() => { advanceRef.current = advance; }, [advance]);
  useEffect(() => { retreatRef.current = retreat; }, [retreat]);

  // ── Capture wheel + touch — blocks OrbitControls beneath ─────────────────
  useEffect(() => {
    if (!visible) return;

    const step = (signedDelta: number) => {
      deltaRef.current += signedDelta;
      if (deltaRef.current >= DELTA_THRESHOLD) {
        deltaRef.current = 0;
        advanceRef.current();
      } else if (deltaRef.current <= -DELTA_THRESHOLD) {
        deltaRef.current = 0;
        retreatRef.current();
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (completingRef.current) return;
      step(e.deltaY);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? 0;
      deltaRef.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (completingRef.current) return;
      const cy = e.touches[0]?.clientY ?? 0;
      step(touchYRef.current - cy); // swipe up = positive = advance
      touchYRef.current = cy;
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

  const currentBeat = scene >= 0 && scene < SCENE_COUNT ? BEATS[scene] : undefined;
  const showAibo    = scene === 11 || scene === 12;

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-50 bg-[#02050a]">
      <StarField containerRef={starsRef} />

      {scene >= 0 && scene < SCENE_COUNT && <LineArtLayer scene={scene} />}

      {/* Text layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          {scene === -1 ? <NameCard /> : currentBeat ? <BeatText beat={currentBeat} /> : null}
        </motion.div>
      </AnimatePresence>

      {/* Ask Aibo button — appears with the AIBO intro and stays */}
      <AnimatePresence>
        {showAibo && <AskAiboButton key="aibo-btn" onClick={completeIntro} />}
      </AnimatePresence>

      {!completingRef.current && (
        <button
          onClick={completeIntro}
          className="absolute top-5 right-6 z-20 font-mono text-[10px] uppercase tracking-[0.3em] text-white/25 transition-colors duration-200 hover:text-white/55"
        >
          Skip {'→'}
        </button>
      )}
    </div>
  );
}
