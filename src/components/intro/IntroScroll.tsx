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
    case 0: { // Hyperspace streaks → Visionary
      const pts: [number, number][] = [
        [500,5],[915,67],[995,230],[995,300],[940,475],[737,595],
        [500,595],[245,595],[30,485],[5,300],[40,120],[205,10],
        [685,19],[865,144],[885,408],[630,581],[350,586],[105,461],[70,156],[300,12],
      ];
      const dim: [number, number][] = [
        [550,247],[580,283],[575,336],[540,360],[460,360],[425,331],[430,264],[462,240],
      ];
      return (
        <>
          {pts.map(([x, y], k) => (
            <DrawPath key={k} d={`M 500 300 L ${x} ${y}`} delay={k * 0.03} dur={0.65} />
          ))}
          {dim.map(([x, y], k) => (
            <DrawPath key={`d${k}`} d={`M 500 300 L ${x} ${y}`} delay={0.05} dur={0.4} width={1.1} opacity={0.3} />
          ))}
        </>
      );
    }

    case 1: // Continuous-line triangle → Innovator
      return (
        <>
          <DrawPath d="M 0 508 C 55 494 90 533 145 504" dur={0.5} />
          <DrawPath d="M 145 504 L 500 72 L 855 504" delay={0.4} dur={1.8} />
          <DrawPath d="M 855 504 L 500 101 L 180 499" delay={2.0} dur={1.3} />
          <DrawPath d="M 180 499 L 500 130 L 820 499" delay={3.1} dur={1.1} />
          <DrawPath d="M 855 504 C 910 533 960 494 1000 508" delay={4.0} dur={0.5} />
        </>
      );

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

    case 3: { // NYC one-line skyline → Builder
      const sky =
        "M 0 570 L 0 528 L 20 528 L 20 543 L 38 543 L 38 507 " +
        "L 52 507 L 52 520 L 64 520 L 64 498 " +
        "L 78 498 L 78 475 L 83 458 L 88 434 L 93 405 L 97 374 L 100 340 " +
        "L 103 304 L 106 268 L 108 230 L 106 204 L 106 178 L 108 150 " +
        "L 112 122 L 116 100 L 120 82 L 124 66 L 128 52 L 131 40 L 134 30 " +
        "L 137 40 L 140 56 L 144 78 L 148 106 L 151 270 " +
        "L 165 270 L 165 410 L 180 410 L 180 378 L 196 378 L 196 410 " +
        "L 210 410 L 210 376 L 230 360 L 232 262 L 234 232 L 237 202 " +
        "L 240 174 L 243 148 L 246 126 L 249 106 L 252 90 L 255 76 " +
        "L 258 64 L 261 54 L 264 46 L 266 40 L 268 46 L 270 58 " +
        "L 272 74 L 274 96 L 274 542 " +
        "L 298 542 L 298 435 L 318 435 L 318 506 " +
        "L 335 506 L 335 448 L 360 448 L 360 542 " +
        "L 388 542 L 388 503 L 408 503 L 408 528 " +
        "C 422 480 445 478 458 505 C 470 478 493 478 506 505 " +
        "L 525 505 L 525 530 L 545 530 L 545 490 L 564 490 L 564 530 " +
        "L 582 530 L 588 500 L 600 480 L 614 468 L 622 452 L 630 438 " +
        "L 638 424 L 644 412 L 650 404 L 656 402 L 662 412 L 668 424 " +
        "L 676 440 L 686 460 L 698 484 L 708 506 L 716 530 " +
        "L 742 530 L 742 506 L 762 506 L 762 520 L 784 520 L 784 506 " +
        "L 806 506 L 806 528 L 826 528 L 826 542 L 848 542 L 848 528 " +
        "L 870 528 L 870 542 L 895 542 L 895 558 L 1000 558";
      return <DrawPath d={sky} dur={2.8} />;
    }

    case 4: { // Fireworks doodle → Creator of New Possibilities
      type Pt = [number, number];
      const clusters: { cx: number; cy: number; delay: number; rays: Pt[] }[] = [
        { cx: 362, cy: 156, delay: 0,    rays: [[362,106],[390,110],[408,127],[412,154],[400,185],[380,202],[362,206],[338,199],[315,185],[310,156],[318,125],[340,108]] },
        { cx: 725, cy: 168, delay: 0.12, rays: [[725,125],[750,132],[768,152],[768,175],[750,205],[725,214],[700,205],[682,180],[682,168],[700,130]] },
        { cx: 570, cy: 336, delay: 0.24, rays: [[570,274],[608,283],[635,298],[645,336],[635,398],[608,398],[570,403],[532,398],[505,384],[495,336],[508,289],[538,271]] },
        { cx: 280, cy: 461, delay: 0.36, rays: [[280,419],[305,426],[325,443],[325,461],[305,498],[280,504],[255,498],[235,461],[235,443],[255,422],[265,416],[290,416]] },
        { cx: 830, cy: 444, delay: 0.48, rays: [[830,408],[845,415],[856,432],[856,450],[845,475],[830,486],[815,475],[804,450],[804,432],[819,415]] },
      ];
      return (
        <>
          {clusters.flatMap(({ cx, cy, rays, delay }, ci) =>
            rays.map(([x, y], ri) => (
              <DrawPath key={`${ci}-${ri}`} d={`M ${cx} ${cy} L ${x} ${y}`} delay={delay + ri * 0.025} dur={0.32} width={1.4} />
            ))
          )}
          <DrawPath d="M 400 182 L 520 317" delay={0.6} dur={0.5} width={1.1} opacity={0.4} />
          <DrawPath d="M 320 444 L 500 360" delay={0.7} dur={0.5} width={1.1} opacity={0.4} />
        </>
      );
    }

    case 5: { // Rain teardrops → Designer of Digital Systems
      const drops = [
        "M 188 115 C 192 144 218 168 218 223 C 218 278 207 310 188 310 C 169 310 158 278 158 223 C 158 168 184 144 188 115 Z",
        "M 490 139 C 494 168 518 192 518 245 C 518 298 509 326 490 326 C 471 326 463 298 463 245 C 463 192 487 168 490 139 Z",
        "M 795 103 C 799 132 822 156 822 206 C 822 256 817 278 795 278 C 773 278 769 256 769 206 C 769 156 791 132 795 103 Z",
        "M 340 206 C 343 230 360 247 360 283 C 360 318 353 334 340 334 C 327 334 320 318 320 283 C 320 247 337 230 340 206 Z",
        "M 645 192 C 648 216 668 233 668 269 C 668 305 660 317 645 317 C 630 317 622 305 622 269 C 622 233 642 216 645 192 Z",
        "M 100 48 C 102 70 118 84 118 115 C 118 142 112 156 100 156 C 88 156 82 142 82 115 C 82 84 98 70 100 48 Z",
        "M 900 67 C 903 89 918 106 918 137 C 918 168 910 175 900 175 C 890 175 882 168 882 137 C 882 106 897 89 900 67 Z",
        "M 270 38 C 272 58 283 67 283 91 C 283 115 277 125 270 125 C 263 125 257 115 257 91 C 257 67 268 58 270 38 Z",
        "M 420 19 C 422 38 433 46 433 67 C 433 89 427 98 420 98 C 413 98 407 89 407 67 C 407 46 418 38 420 19 Z",
        "M 595 14 C 597 34 608 41 608 62 C 608 84 602 94 595 94 C 588 94 582 84 582 62 C 582 41 593 34 595 14 Z",
        "M 720 86 C 722 108 735 118 735 144 C 735 168 729 168 720 168 C 711 168 705 168 705 144 C 705 118 718 108 720 86 Z",
        "M 50 355 C 52 374 65 389 65 418 C 65 446 58 456 50 456 C 42 456 35 446 35 418 C 35 389 48 374 50 355 Z",
        "M 438 384 C 440 403 453 413 453 437 C 453 461 445 466 438 466 C 431 466 423 461 423 437 C 423 413 436 403 438 384 Z",
        "M 845 384 C 847 406 860 418 860 446 C 860 474 852 474 845 474 C 838 474 830 474 830 446 C 830 418 843 406 845 384 Z",
      ];
      return (
        <>
          {drops.map((d, k) => <DrawPath key={k} d={d} delay={k * 0.06} dur={0.75} />)}
          <DrawPath d="M 543 121 L 549 127" delay={0.8} dur={0.2} width={5} opacity={0.9} />
          <DrawPath d="M 733 385 L 739 391" delay={0.9} dur={0.2} width={5} opacity={0.9} />
        </>
      );
    }

    case 6: // Trees growing → Shaper of Built Environments
      return (
        <>
          {tree(150, 250, 0.85, 0, 0)}
          {tree(330, 200, 1.1, 1, 0.35)}
          {tree(700, 175, 1.2, 2, 0.7)}
          {tree(865, 215, 0.95, 3, 1.05)}
        </>
      );

    case 7: // Graduate figure → Master of Architecture, PhD
      return (
        <>
          <DrawPath d="M 295 132 L 485 67 L 600 96 L 410 163 Z" dur={1.1} />
          <DrawPath d="M 485 67 L 495 84 L 505 130 L 500 173" delay={0.9} dur={0.5} />
          <DrawPath d="M 410 163 C 388 173 370 211 370 240 C 370 264 380 283 396 298" delay={1.2} dur={0.7} />
          <DrawPath d="M 396 298 C 404 314 404 330 396 346 C 388 362 388 378 396 394 C 406 410 403 424 393 434 L 384 445" delay={1.7} dur={0.8} />
          <DrawPath d="M 384 445 C 375 458 370 472 370 484 L 370 490" delay={2.3} dur={0.4} />
          <DrawPath d="M 370 490 C 344 509 315 538 300 571 L 644 571" delay={2.6} dur={1.0} />
          <DrawPath d="M 644 571 C 656 552 656 528 650 506" delay={3.4} dur={0.6} />
          <DrawPath d="M 650 506 C 612 355 588 352 574 356 L 524 356" delay={3.8} dur={0.8} />
          <DrawPath d="M 524 356 C 517 344 504 338 493 340 C 482 348 484 371 496 379 C 509 387 524 382 528 370 C 532 358 527 346 524 356" delay={4.4} dur={0.7} />
          <DrawPath d="M 650 506 C 624 344 620 302 622 283 C 625 264 634 246 638 228 C 632 208 618 186 600 176 C 595 168 596 163 600 163 L 410 163" delay={4.8} dur={1.2} />
        </>
      );

    case 8: // Construction crane → 10 yrs business + construction
      return (
        <>
          <DrawPath d="M 0 576 L 0 528 L 37 528 L 37 552 L 70 552 L 70 516 L 100 516 L 100 542 L 130 542 L 130 499 L 160 499 L 160 523 L 190 523 L 190 499 L 220 499" dur={1.0} />
          <DrawPath d="M 763 499 L 795 499 L 795 528 L 830 528 L 830 499 L 865 499 L 865 528 L 900 528 L 900 499 L 940 499 L 940 523 L 988 523 L 988 576 L 0 576" delay={0.2} dur={0.9} />
          <DrawPath d="M 705 576 L 705 34" delay={0.9} dur={1.4} />
          <DrawPath d="M 745 576 L 745 34" delay={1.0} dur={1.4} />
          {([86, 182, 278, 374, 470, 518] as number[]).map((y, k) => (
            <DrawPath key={`xa${k}`} d={`M 705 ${y} L 745 ${y + 48}`} delay={1.1 + k * 0.05} dur={0.3} width={1.1} opacity={0.35} />
          ))}
          {([86, 182, 278, 374, 470, 518] as number[]).map((y, k) => (
            <DrawPath key={`xb${k}`} d={`M 745 ${y} L 705 ${y + 48}`} delay={1.1 + k * 0.05} dur={0.3} width={1.1} opacity={0.35} />
          ))}
          <DrawPath d="M 105 192 L 705 34" delay={0.7} dur={1.5} />
          <DrawPath d="M 105 226 L 705 67" delay={0.8} dur={1.5} />
          <DrawPath d="M 105 192 C 92 199 90 211 100 221 L 105 226" delay={2.1} dur={0.3} />
          {([[220, 166], [330, 152], [440, 138], [550, 124], [660, 110]] as [number, number][]).map(([x, y], k) => (
            <DrawPath key={`tr${k}`} d={`M ${x} ${y} C ${x+8} ${y-18} ${x+38} ${y-20} ${x+48} ${y-8} C ${x+52} ${y+6} ${x+40} ${y+16} ${x+24} ${y+14}`} delay={1.7 + k * 0.08} dur={0.4} width={1.1} opacity={0.35} />
          ))}
          <DrawPath d="M 320 187 L 320 470" delay={2.3} dur={0.8} />
          <DrawPath d="M 300 463 C 290 485 290 509 305 518 C 320 526 335 518 340 504 C 345 487 335 466 320 463" delay={3.0} dur={0.5} />
          <DrawPath d="M 745 34 L 900 72" delay={1.5} dur={0.6} />
          <DrawPath d="M 745 67 L 900 101" delay={1.6} dur={0.6} />
          <DrawPath d="M 880 67 L 910 77 L 915 106 L 885 96 Z" delay={2.0} dur={0.4} />
        </>
      );

    case 9: // Open laptop → 10 yrs applied AI and IoT
      return (
        <>
          <DrawPath d="M 0 490 C 50 480 85 509 140 485" dur={0.5} />
          <DrawPath d="M 140 485 L 175 130" delay={0.4} dur={0.9} />
          <DrawPath d="M 175 130 L 745 130" delay={1.2} dur={1.0} />
          <DrawPath d="M 745 130 L 785 470" delay={2.1} dur={0.9} />
          <DrawPath d="M 205 161 L 220 439 L 755 439 L 740 161 Z" delay={2.8} dur={0.7} width={1.1} opacity={0.35} />
          <DrawPath d="M 140 485 L 105 514 L 100 538" delay={3.4} dur={0.5} />
          <DrawPath d="M 785 470 L 830 509 L 840 538" delay={3.4} dur={0.5} />
          <DrawPath d="M 100 538 L 840 538 L 845 566 L 95 566 Z" delay={3.8} dur={0.8} />
          <DrawPath d="M 130 552 L 620 552" delay={4.4} dur={0.4} width={1.1} opacity={0.35} />
          <DrawPath d="M 640 540 L 775 540 L 778 564 L 635 564 Z" delay={4.6} dur={0.3} width={1.1} opacity={0.35} />
          <DrawPath d="M 845 566 C 900 576 945 547 1000 557" delay={4.8} dur={0.4} />
        </>
      );

    case 10: // Award medal
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

    case 11: // AIBO close-up face → handoff
    case 12: // lingers through "Ask me anything."
      return (
        <>
          <DrawPath d="M 455 19 C 412 48 370 91 345 139 C 320 192 315 252 330 312 C 345 372 365 418 375 466 C 385 516 380 557 370 595" dur={1.8} />
          <DrawPath d="M 380 173 C 410 144 465 137 510 154" delay={0.5} dur={0.6} />
          <DrawPath d="M 360 211 C 400 175 470 170 520 197 C 540 211 550 240 535 264 C 515 293 460 302 400 283 C 360 266 345 240 360 211 Z" delay={0.8} dur={1.1} />
          <DrawPath d="M 375 216 C 415 185 470 182 515 206 C 530 221 535 245 520 264" delay={1.6} dur={0.5} width={1.1} opacity={0.35} />
          <DrawPath d="M 495 293 C 488 322 475 350 465 372 L 495 377 L 525 372 C 515 350 505 322 500 293" delay={1.9} dur={0.7} />
          <DrawPath d="M 445 379 C 432 398 435 422 455 418 C 475 413 480 389 468 377" delay={2.4} dur={0.5} />
          <DrawPath d="M 505 374 C 522 365 545 374 542 401 C 540 425 518 427 502 410 C 492 396 495 379 505 374" delay={2.7} dur={0.5} />
          <DrawPath d="M 400 446 C 430 420 460 410 495 415 C 530 410 560 420 590 446" delay={3.0} dur={0.7} />
          <DrawPath d="M 445 446 C 465 427 495 420 520 425" delay={3.4} dur={0.4} />
          <DrawPath d="M 400 446 C 420 480 445 504 495 511 C 545 504 570 480 590 446" delay={3.6} dur={0.7} />
          <DrawPath d="M 500 562 C 540 576 600 562 650 528" delay={4.1} dur={0.5} />
        </>
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
