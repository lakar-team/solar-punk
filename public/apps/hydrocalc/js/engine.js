// =============================================================================
// engine.js
// Graph traversal engine and auto-sizer.
//
// calcAllSegments()  — BFS from sources, computes hydraulics for every edge.
//                      Returns array of result objects (read-only, no mutations).
// autoSizeAllEdges() — Iterative diameter selection with pressure propagation.
//                      Writes e.diameter back to S.edges.
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
   §6  GRAPH ENGINE
   ────────────────
   Network traversal utilities and the full segment calculation pass.
   ═══════════════════════════════════════════════════════════════════════════════ */

// Build adjacency lists from S.edges.
//   adj[nodeId]  = [{eid, to}]   — outgoing edges (downstream)
//   radj[nodeId] = [{eid, from}] — incoming edges (upstream)
function buildAdj() {
  const adj = {}, radj = {};
  Object.values(S.nodes).forEach(n => { adj[n.id] = []; radj[n.id] = []; });
  Object.values(S.edges).forEach(e => {
    if (adj[e.from])  adj[e.from].push({ eid: e.id, to:   e.to   });
    if (radj[e.to])  radj[e.to].push({ eid: e.id, from: e.from });
  });
  return { adj, radj };
}

// Helper: get the effective FU for a fixture node, respecting project mode and hot-water rule.
// mode = S.settings.mode ('public' | 'private')
// hotWater flag on the node → FU × 3/4  (注: 給湯栓併用)
function effectiveFU(node) {
  const f    = S.fixtures[node.fixtureType] || { units: 1 };
  const mode = (S.settings && S.settings.mode) || 'public';
  const base = (mode === 'private' && f.unitsPrivate != null) ? f.unitsPrivate : f.units;
  const qty  = node.fixtureQty || 1;
  const hw   = node.hotWater ? 0.75 : 1;
  return base * qty * hw;
}

// Sum all fixture demand units downstream of startId.
// Uses iterative BFS — no recursion, cycle-safe.
// Returns { units, hasValve } — hasValve selects FLOW_VALVE curve.
function downstreamUnits(startId, adj) {
  let units = 0, hasValve = false;
  const visited = new Set();
  const queue = [startId];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const n = S.nodes[id];
    if (!n) continue;
    if (n.type === 'fixture') {
      const f = S.fixtures[n.fixtureType] || { units: 1, flush: 'none' };
      units += effectiveFU(n);
      if (f.flush === 'valve') hasValve = true;
    } else {
      (adj[id] || []).forEach(({ to }) => queue.push(to));
    }
  }
  return { units, hasValve };
}

// Linear interpolation on a [units, Q] lookup table
function interpolate(table, x) {
  if (x <= table[0][0])                return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    if (x >= table[i][0] && x <= table[i + 1][0]) {
      const t = (x - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i][1] + t * (table[i + 1][1] - table[i][1]);
    }
  }
}

// Convert demand units → design flow Q [L/min] using 図7-1 curves
function simFlow(units, hasValve) {
  if (units <= 0) return 0;
  return interpolate(hasValve ? FLOW_VALVE : FLOW_TANK, units);
}

// Compute hydraulic results for every segment (read-only — no mutations to S).
// Walks edges in topological order (trunk-first), propagating pressure forward.
// Returns an array of result objects in display order (one per edge).
function calcAllSegments() {
  const { adj } = buildAdj();

  // Step 1: BFS from all sources to get trunk-first node order
  const topoNodes = [];
  const seen = new Set();
  const queue = [];
  Object.values(S.nodes).filter(n => n.type === 'source').forEach(n => {
    queue.push(n.id); seen.add(n.id);
  });
  while (queue.length) {
    const nid = queue.shift();
    topoNodes.push(nid);
    (adj[nid] || []).forEach(({ to }) => { if (!seen.has(to)) { seen.add(to); queue.push(to); } });
  }
  Object.keys(S.nodes).forEach(id => { if (!seen.has(id)) topoNodes.push(id); }); // disconnected

  // Step 2: Seed source pressures
  const nodeP = {};
  Object.values(S.nodes).filter(n => n.type === 'source').forEach(n => {
    nodeP[n.id] = (n.pressure || 300) + (n.pump ? (n.pumpHead || 0) : 0);
  });

  // Step 3: Build edge list in trunk-first order
  const edgesTF = [];
  const seenE = new Set();
  topoNodes.forEach(nid => {
    (adj[nid] || []).forEach(({ eid }) => { if (!seenE.has(eid)) { seenE.add(eid); edgesTF.push(eid); } });
  });
  Object.keys(S.edges).forEach(eid => { if (!seenE.has(eid)) edgesTF.push(eid); }); // disconnected

  // Step 4: Walk each edge, compute results, propagate pressure forward
  const results = {};
  edgesTF.forEach(eid => {
    const e  = S.edges[eid];   if (!e)          return;
    const fn = S.nodes[e.from], tn = S.nodes[e.to]; if (!fn || !tn) return;

    const mat      = S.materials[e.material];
    const chartKey = mat ? mat.chartKey : 'sgpw';
    const pipe     = PIPES[chartKey];
    const C        = pipe ? pipe.C : 130;
    const dia      = e.diameter || 25;

    const { units, hasValve } = downstreamUnits(e.to, adj);
    const Q       = simFlow(units, hasValve);
    const L_act   = e.length || 0;
    const L_bend  = calcEqLen(e);
    const L_tot   = L_act + L_bend;
    const dZ      = (tn.elev || 0) - (fn.elev || 0);
    const P_up    = nodeP[e.from] ?? 0;

    // Required pressure at the downstream end
    // Junctions: 0 (each downstream fixture declares its own minimum)
    const P_req   = (tn.type === 'fixture')
      ? ((S.fixtures[tn.fixtureType] || {}).minPressure || 30)
      : 0;

    // Use inner diameter for HW formula and velocity (JIS charts use inner dia)
    const innerDia = getInnerDia(pipe, dia);
    const P_net   = P_up - dZ * 9.81 - P_req;
    const R_allow = L_tot > 0 ? P_net / L_tot : 0;
    const R_act   = R_fromHW(C, innerDia, Q);
    const rec     = selectDiamFromChart(chartKey, Q, Math.max(R_allow, 0.001));
    const v       = velocity(Q, innerDia);
    
    // Total failure if pressure goes negative
    // Warnings if pressure is below fixture requirement or velocity > 2m/s
    const P_down  = P_up - R_act * L_tot - dZ * 9.81;
    let status    = 'ok';
    if (P_down < -0.1) {
      status = 'err'; 
    } else if (P_down < P_req - 0.1 || v > 2.01) {
      status = 'warn';
    }

    results[eid] = {
      eid,
      from: fn.label, to: tn.label,
      matName: mat ? mat.name : '?', chartKey, C,
      dia, L_act,
      L_bend:  +L_bend.toFixed(3),
      L_tot:   +L_tot.toFixed(3),
      dZ:      +dZ.toFixed(2),
      units:   +units.toFixed(1),
      Q:       +Q.toFixed(1),
      R_allow: +R_allow.toFixed(4),
      R_act:   +R_act.toFixed(4),
      v:       +v.toFixed(2),
      rec:     rec.A,
      P_down:  +P_down.toFixed(2),
      P_req:   +P_req.toFixed(2),
      status, 
      ok:      status === 'ok',
      hasValve,
    };

    // Propagate to downstream node (keep the highest pressure if multiple paths)
    if (nodeP[e.to] === undefined || P_down > nodeP[e.to]) nodeP[e.to] = P_down;
  });

  return edgesTF.map(eid => results[eid]).filter(Boolean);
}


/* ═══════════════════════════════════════════════════════════════════════════════
   §7  AUTO-SIZER
   ──────────────
   Selects pipe diameters for every edge by iterative pressure-budget sizing.
   Called automatically after topology changes, length/material edits, or
   fitting quantity changes.
   ═══════════════════════════════════════════════════════════════════════════════ */

// Guard flag to prevent re-entrant calls (e.g. input → autoSize → render → input)
let _autosizing = false;

function autoSizeAllEdges(force = false) {
  if (_autosizing) return;
  if (!force && S.settings && S.settings.autoSize === false) return;
  _autosizing = true;
  try { _runAutoSize(); } finally { _autosizing = false; }
}

function _runAutoSize() {
  const { adj } = buildAdj();

  // Step 1: Topological order via BFS from all sources
  const topoNodes = [];
  const seen = new Set();
  const queue = [];
  Object.values(S.nodes).filter(n => n.type === 'source').forEach(n => {
    queue.push(n.id); seen.add(n.id);
  });
  while (queue.length) {
    const nid = queue.shift();
    topoNodes.push(nid);
    (adj[nid] || []).forEach(({ to }) => { if (!seen.has(to)) { seen.add(to); queue.push(to); } });
  }
  Object.keys(S.nodes).forEach(id => { if (!seen.has(id)) topoNodes.push(id); });

  // Step 2: Pre-compute design flow for every edge
  const edgeQ = {};
  Object.values(S.edges).forEach(e => {
    const { units, hasValve } = downstreamUnits(e.to, adj);
    edgeQ[e.id] = simFlow(units, hasValve);
  });

  // Step 3: Seed source pressures
  const nodeP = {};
  Object.values(S.nodes).filter(n => n.type === 'source').forEach(n => {
    nodeP[n.id] = (n.pressure || 300) + (n.pump ? (n.pumpHead || 0) : 0);
  });

  // Step 4: Build edges in trunk-first order
  const edgesTF = [];
  const seenE = new Set();
  topoNodes.forEach(nid => {
    (adj[nid] || []).forEach(({ eid }) => { if (!seenE.has(eid)) { seenE.add(eid); edgesTF.push(eid); } });
  });
  Object.keys(S.edges).forEach(eid => { if (!seenE.has(eid)) edgesTF.push(eid); });

  // Step 5: Size each edge, then propagate pressure to its downstream node
  edgesTF.forEach(eid => {
    const e        = S.edges[eid];   if (!e) return;
    const mat      = S.materials[e.material];
    const chartKey = mat ? mat.chartKey : 'sgpw';
    const pipe     = PIPES[chartKey]; if (!pipe) return;
    const fromNode = S.nodes[e.from], toNode = S.nodes[e.to];
    if (!fromNode || !toNode) return;

    const Q   = edgeQ[eid] || 0;
    const P_up = nodeP[e.from];
    if (P_up === undefined) return; // not reachable from any source

    const dZ    = (toNode.elev || 0) - (fromNode.elev || 0);
    const P_req = (toNode.type === 'fixture')
      ? ((S.fixtures[toNode.fixtureType] || {}).minPressure || 30)
      : 0;
    const P_budget = P_up - dZ * 9.81 - P_req;

    // Diameter selection with iterative convergence.
    // Fitting equiv-lengths depend on diameter, so we iterate until stable (max 4 passes).
    // Exception: if the downstream node is a fixture, honour its connDia specification.
    let newDia;
    const fixConnDia = (toNode.type === 'fixture')
      ? ((S.fixtures[toNode.fixtureType] || {}).connDia || null)
      : null;

    if (fixConnDia) {
      // Last segment to a fixture — use the connection diameter specified in the fixture library
      newDia = fixConnDia;
    } else if (Q <= 0) {
      newDia = pipe.sizes[0].A;
    } else if (P_budget <= 0) {
      newDia = pipe.sizes[pipe.sizes.length - 1].A;
    } else {
      const L_act = e.length || 1;
      let triaDia = pipe.sizes[Math.floor(pipe.sizes.length / 2)].A; // start at mid-range
      for (let iter = 0; iter < 4; iter++) {
        const L_fit   = calcEqLen({ ...e, diameter: triaDia });
        const R_allow = Math.max(0.01, P_budget / (L_act + L_fit));
        const rec     = selectDiamFromChart(chartKey, Q, R_allow);
        const nextDia = rec.A || pipe.sizes[pipe.sizes.length - 1].A;
        if (nextDia === triaDia) break; // converged
        triaDia = nextDia;
      }
      newDia = triaDia;
    }
    e.diameter = newDia;

    // Propagate actual pressure loss to downstream node
    // Use inner diameter for HW formula accuracy (JIS charts are based on inner dia)
    const L_fit_final  = calcEqLen(e);
    const L_tot_final  = (e.length || 1) + L_fit_final;
    const innerDiaFin  = getInnerDia(pipe, newDia);
    const R_actual     = R_fromHW(pipe.C || 130, innerDiaFin, Q);
    const P_down       = P_up - R_actual * L_tot_final - dZ * 9.81;

    // Fixtures inherit elevation from their supply node (no separate Z field)
    if (toNode.type === 'fixture') toNode.elev = fromNode.elev || 0;

    // At multi-path junctions, keep the best (highest) available pressure
    if (nodeP[e.to] === undefined || P_down > nodeP[e.to]) nodeP[e.to] = P_down;
  });
}

// Remove any branch/tap node directly downstream of a source and re-wire its
// children straight to the source. Prevents accidental taps on the water main.
function cleanupSourceTaps() {
  const { adj, radj } = buildAdj();
  let changed = false;
  Object.values(S.nodes).filter(n => n.type === 'branch').forEach(n => {
    const parents = radj[n.id] || [];
    if (parents.length !== 1) return;
    const parentNode = S.nodes[parents[0].from];
    if (!parentNode || parentNode.type !== 'source') return;
    (adj[n.id] || []).forEach(({ eid }) => { if (S.edges[eid]) S.edges[eid].from = parentNode.id; });
    delete S.edges[parents[0].eid];
    delete S.nodes[n.id];
    if (selId === n.id) selId = null;
    changed = true;
  });
  return changed;
}


