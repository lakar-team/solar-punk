'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import VrmViewer, { type VrmViewerHandle } from '@/components/ui/VrmViewer';
import { useKokoroTTS } from '@/hooks/useKokoroTTS';

// ── Canvas star field ─────────────────────────────────────────────────────────
function StarField({ count = 150, opacity = 0.5 }: { count?: number; opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Star = { x: number; y: number; r: number; phase: number; speed: number };
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let frame: number;
    let t = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const twinkle = 0.35 + 0.65 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = twinkle * opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();

    return () => { cancelAnimationFrame(frame); ro.disconnect(); };
  }, [count, opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── Word-by-word kinetic text ─────────────────────────────────────────────────
function KineticText({
  text,
  className = '',
  wordDelay = 0.1,
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  wordDelay?: number;
  baseDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(' ');

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: baseDelay + i * wordDelay,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block mr-[0.28em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ── Section 1 — Landing ───────────────────────────────────────────────────────
const GREETING =
  'Hello, wanderer. I have been expecting you. ' +
  'This solar system holds everything Adam has built — each planet, a story. ' +
  'Orbit a while. Or skip ahead if you already know what you are looking for.';

function LandingSection() {
  const vrmRef = useRef<VrmViewerHandle>(null);
  const { speak, loading: ttsLoading, progress: ttsProgress, isSpeaking } = useKokoroTTS();
  const [ttsReady, setTtsReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const hasSpoken = useRef(false);
  const prevLoading = useRef(false);

  // Detect when model finishes loading: loading true → false at progress 100
  useEffect(() => {
    if (ttsLoading) { prevLoading.current = true; return; }
    if (prevLoading.current && !ttsLoading && ttsProgress >= 100) {
      setTtsReady(true);
    }
  }, [ttsLoading, ttsProgress]);

  const handleSpeak = useCallback(async () => {
    if (hasSpoken.current || speaking) return;
    hasSpoken.current = true;
    setSpeaking(true);
    vrmRef.current?.speakWithLipSync(GREETING);
    await speak(GREETING);
    setSpeaking(false);
  }, [speak, speaking]);

  const handleSkip = useCallback(() => {
    document.getElementById('solar-system')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-[#02050a]">
      <StarField count={140} opacity={0.42} />

      {/* Amber radial glow behind avatar side */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 75% 55%, rgba(245,158,11,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 gap-10">
        {/* ── Left: copy ── */}
        <div className="flex-1 max-w-lg space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/60 font-mono mb-3">
              — a solar system portfolio —
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white/90">
              Adam M. Raman
            </h1>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 1 }}
            className="text-lg md:text-xl text-white/55 leading-relaxed border-l-2 border-amber-500/35 pl-5 italic"
          >
            &ldquo;{GREETING}&rdquo;
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap"
          >
            {ttsLoading && (
              <span className="text-[11px] font-mono text-amber-500/40 flex items-center gap-2">
                <motion.span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                Loading voice&hellip;
              </span>
            )}

            {ttsReady && !speaking && !hasSpoken.current && (
              <button
                onClick={handleSpeak}
                className="flex items-center gap-2.5 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full hover:border-amber-500/60 hover:bg-amber-500/5 transition-all"
              >
                <span
                  className="inline-block w-0 h-0 ml-0.5"
                  style={{
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: '8px solid currentColor',
                  }}
                />
                Hear her speak
              </button>
            )}

            {isSpeaking && (
              <span className="text-[11px] font-mono text-amber-400/60 flex items-center gap-2">
                {[0, 0.15, 0.3].map((d) => (
                  <motion.span
                    key={d}
                    className="inline-block w-1 h-1 bg-amber-400 rounded-full"
                    animate={{ scaleY: [1, 2.8, 1] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: d }}
                  />
                ))}
                Speaking&hellip;
              </span>
            )}

            <button
              onClick={handleSkip}
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/35 hover:text-white/65 transition-colors"
            >
              Skip to solar system
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                &#8595;
              </motion.span>
            </button>
          </motion.div>
        </div>

        {/* ── Right: VRM avatar ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
          className="relative flex-shrink-0 w-56 h-72 md:w-72 md:h-[480px]"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)',
            }}
          />
          <VrmViewer ref={vrmRef} isEmbedded />
        </motion.div>
      </div>

      {/* Scroll nudge */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-px h-8 bg-white/50" />
        <div className="w-1 h-1 rounded-full bg-white/60" />
      </motion.div>
    </section>
  );
}

// ── Section 2 — Identity ──────────────────────────────────────────────────────
function IdentityPanel() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #02050a 0%, #010308 100%)' }}
    >
      <StarField count={70} opacity={0.32} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(245,158,11,0.025) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center px-8 max-w-4xl space-y-7 py-20">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-[10px] font-mono uppercase tracking-[0.4em] text-amber-500/45"
        >
          The architect
        </motion.p>

        <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-white">
          <KineticText
            text="Buildings. Products. Digital worlds."
            wordDelay={0.13}
          />
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="text-xl md:text-2xl text-white/42 leading-relaxed max-w-2xl mx-auto"
        >
          I design things that exist in the real world &mdash; and ones that do not yet.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.25, duration: 0.9 }}
          className="text-sm text-amber-500/35 font-mono tracking-wide pt-1"
        >
          Architecture &middot; Research &middot; Technology
        </motion.p>

        {/* Soft CTA woven naturally into copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.6, duration: 0.9 }}
          className="text-sm text-white/22 font-mono tracking-wide"
        >
          Open to the right conversations &mdash; architecture, tech, or something in between.
        </motion.p>
      </div>
    </section>
  );
}

// ── Section 3 — AIBO Teaser ───────────────────────────────────────────────────
function AiboTeaser() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] w-full flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #010308 0%, #020408 100%)' }}
    >
      <StarField count={55} opacity={0.22} />

      {/* Amber atmosphere emanating from bottom-left — where Ask Aibo lives */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 45% 55% at 12% 92%, rgba(245,158,11,0.08) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center gap-14 px-8 md:px-20 py-20">
        {/* ── Orb / avatar sigil ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative flex-shrink-0 flex items-center justify-center w-40 h-40 md:w-52 md:h-52"
        >
          {[1, 1.35, 1.7].map((scale, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(245,158,11,0.18)' }}
              animate={{ scale: [scale, scale * 1.12, scale], opacity: [0.5, 0.12, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' }}
            />
          ))}
          <div
            className="w-24 h-24 md:w-32 md:h-32 rounded-full absolute"
            style={{
              background:
                'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.04) 60%, transparent 100%)',
            }}
          />
          <span
            className="relative text-6xl md:text-7xl select-none"
            style={{ filter: 'drop-shadow(0 0 16px rgba(245,158,11,0.55))' }}
          >
            &#10022;
          </span>
        </motion.div>

        {/* ── Copy ── */}
        <div className="max-w-lg space-y-6 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-[10px] font-mono uppercase tracking-[0.4em] text-amber-500/45"
          >
            Meet the Web Witch
          </motion.p>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="block text-white/88">
              <KineticText text="She knows every project." baseDelay={0.3} wordDelay={0.11} />
            </span>
            <span className="block text-amber-400/75 mt-1">
              <KineticText text="Every story behind it." baseDelay={0.75} wordDelay={0.11} />
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.15, duration: 0.7 }}
            className="text-lg text-white/45 leading-relaxed"
          >
            Ask her about the research behind a building, how AIBO was made,
            or whether Adam&rsquo;s work might overlap with yours.
          </motion.p>

          {/* Visual arrow pointing toward Ask Aibo button (bottom-left) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 1.55, duration: 0.8 }}
            className="flex items-center gap-3 justify-center md:justify-start"
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span className="text-sm font-mono text-amber-400/60 leading-snug">
              Find her in the bottom left once you are in orbit &#8601;
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function IntroScroll() {
  return (
    <>
      <LandingSection />
      <IdentityPanel />
      <AiboTeaser />
    </>
  );
}
