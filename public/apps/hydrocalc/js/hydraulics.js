// =============================================================================
// hydraulics.js
// Pure hydraulic math — no DOM access, no state mutations.
// All functions take explicit arguments and return values.
//
// Key formulas:
//   Hazen-Williams:  Q = 4.87 · C · d^2.63 · i^0.54 × 10³  [L/min]
//   Velocity:        v = Q/60000 / (π/4 · d²)               [m/s]
//   Fitting equiv-lengths from JIS 表7-4~7-9
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
   §5  HYDRAULICS  (pure functions — no DOM access)
   ─────────────────────────────────────────────────
   All functions here take explicit arguments and return values.
   None of them read from or write to the DOM or to S directly.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Pipe chart interpolation ──────────────────────────────────────────────────

// Given a pipe size record s and friction gradient R [kPa/m],
// returns Q [L/min] by log-log interpolation on the two chart endpoints.
function pipeQatR(s, R) {
  const lx1 = Math.log10(s.x1), ly1 = Math.log10(s.y1);
  const lx2 = Math.log10(s.x2), ly2 = Math.log10(s.y2);
  const slope = (ly2 - ly1) / (lx2 - lx1);
  const intercept = ly1 - slope * lx1;
  return Math.pow(10, slope * Math.log10(Math.max(R, 1e-6)) + intercept);
}

// Find the smallest nominal diameter [mm] that satisfies BOTH:
//   1. Friction: chart capacity at R_allow ≥ demand Q
//   2. Velocity: v < 2.0 m/s  (JIS maximum)
// Returns { A, id, lineQ, v, source }
function selectDiamFromChart(chartKey, Q, R) {
  const pipe = PIPES[chartKey];
  if (!pipe) return { A: null, source: 'no chart' };
  if (Q <= 0) return { A: pipe.sizes[0].A, source: 'zero flow' };
  const V_MAX = 2.0;
  const sorted = [...pipe.sizes].sort((a, b) => a.A - b.A);
  for (const s of sorted) {
    if (pipeQatR(s, R) >= Q && velocity(Q, s.id) < V_MAX)
      return { A: s.A, id: s.id, lineQ: pipeQatR(s, R), v: velocity(Q, s.id), source: 'chart' };
  }
  // All sizes insufficient — return largest with a flag
  const largest = sorted[sorted.length - 1];
  return { A: largest.A, id: largest.id, source: 'chart-max', oversized: true };
}

// ── Hazen-Williams formula ────────────────────────────────────────────────────

// Friction gradient R [kPa/m] from Hazen-Williams (inverse):
//   Q = 4.87 · C · d^2.63 · i^0.54 × 10³   (L/min, d in m, i in kPa/m)
function R_fromHW(C, d_mm, Q_lpm) {
  if (Q_lpm <= 0 || d_mm <= 0) return 0;
  const ratio = Q_lpm / (4.87 * C * Math.pow(d_mm / 1000, 2.63) * 1000);
  return Math.pow(Math.max(ratio, 0), 1 / 0.54);
}

// Flow velocity [m/s]
function velocity(Q_lpm, d_mm) {
  if (Q_lpm <= 0 || d_mm <= 0) return 0;
  return (Q_lpm / 60000) / (Math.PI / 4 * Math.pow(d_mm / 1000, 2));
}

// Look up the actual inner diameter [mm] for a nominal size in a pipe chart.
// The JIS charts are plotted using inner diameters, so R_fromHW and velocity
// should use inner dia rather than nominal bore for accurate results.
// Falls back to nominal if not found.
function getInnerDia(pipe, nominalA) {
  if (!pipe) return nominalA;
  const s = pipe.sizes.find(s => s.A === nominalA);
  return s ? s.id : nominalA;
}

// Colour for velocity display:  blue → yellow → orange → red
function velColor(v) {
  if (v <= 2) return '#4d9de0'; // blue   0–2 m/s  ✓ acceptable
  if (v <= 3) return '#e0c44d'; // yellow 2–3 m/s  ⚠ high
  if (v <= 4) return '#e08a2a'; // orange 3–4 m/s  ⚠ very high
  return           '#e05c5c';   // red    4+  m/s  ⚠ excessive
}

// ── Fitting equivalent lengths ────────────────────────────────────────────────

// Equivalent straight-pipe length [m] for one fitting at a given diameter.
// Looks up the nearest diameter row in the pipe's eqLen table.
function getEqLen(chartKey, dia_mm, fittingKey) {
  const pipe = PIPES[chartKey];
  if (!pipe || !pipe.eqLen) return 0;
  const { fittingKeys, rows } = pipe.eqLen;
  const colIdx = (fittingKeys || []).indexOf(fittingKey);
  if (colIdx < 0) return 0;
  let best = null, bestDiff = Infinity;
  for (const row of rows) {
    const diff = Math.abs(row[0] - dia_mm);
    if (diff < bestDiff) { bestDiff = diff; best = row; }
  }
  return best ? (best[colIdx + 1] || 0) : 0; // col 0 = dia; col 1+ = fittings
}

// Total equivalent length [m] for all fittings on an edge
function calcEqLen(edge) {
  const mat = S.materials[edge.material];
  if (!mat) return 0;
  const chartKey = mat.chartKey || 'sgpw';
  const dia = edge.diameter || 25;
  let total = 0;
  for (const [key, qty] of Object.entries(edge.fittings || {})) {
    if (qty > 0) total += getEqLen(chartKey, dia, key) * qty;
  }
  return +total.toFixed(3);
}


