// =============================================================================
// ui.js
// UI interactions: selection, property updates, canvas drag/pan/connect tool,
// context menu, zoom, fit view, tooltips, and view switching.
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
   §9  UI INTERACTIONS
   ───────────────────
   Selection, property mutations, drag/pan/connect, context menu, modals.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Project mode (public / private) ──────────────────────────────────────────

function setProjectMode(mode) {
  if (!S.settings) S.settings = {};
  S.settings.mode = mode;
  document.getElementById('mode-pub').classList.toggle('active', mode === 'public');
  document.getElementById('mode-prv').classList.toggle('active', mode === 'private');
  // Update status bar badge
  const sb = document.getElementById('mode-badge');
  if (sb) sb.textContent = mode === 'public' ? '公共 Public' : '私室 Private';
  autoSizeAllEdges();
  render();
  if (document.getElementById('view-library').classList.contains('open')) renderLibrary();
}

function toggleAutoSize(enabled) {
  if (!S.settings) S.settings = {};
  S.settings.autoSize = enabled;
  // Sync the checkbox in case it's changed programmatically
  const tog = document.getElementById('auto-size-tog');
  if (tog) tog.checked = enabled;
  
  if (enabled) {
    autoSizeAllEdges();
    render();
  }
}

// ── Selection and property updates ───────────────────────────────────────────

function selectItem(id) {
  selId = id;
  // Close any open overlay tabs so the network is visible
  ['reference','library','materials'].forEach(n => {
    const el = document.getElementById('view-' + n);
    if (el) el.classList.remove('open');
  });
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  render();
  // Scroll matching tree row into view
  setTimeout(() => {
    const el = document.querySelector(`.tn[data-nid="${id}"],.pipe-row[data-eid="${id}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, 30);
}
function selectNode(id) { selectItem(id); }
function selectEdge(id) { selectItem(id); }

// Update a node property and re-render (auto-sizes if a hydraulic property changed)
function upN(id, k, v) {
  if (S.nodes[id]) S.nodes[id][k] = v;
  if (['elev','pressure','pumpHead','pump','fixtureType','fixtureQty','hotWater'].includes(k)) autoSizeAllEdges();
  render();
}

// Update an edge property and re-render
function upE(id, k, v) {
  if (S.edges[id]) S.edges[id][k] = v;
  if (['length','material'].includes(k)) autoSizeAllEdges();
  render();
}

// Update fitting quantity on an edge and re-auto-size
function upFitting(eid, fk, qty) {
  if (S.edges[eid]) {
    if (!S.edges[eid].fittings) S.edges[eid].fittings = {};
    S.edges[eid].fittings[fk] = qty;
  }
  autoSizeAllEdges();
  render();
}

// Change material and reset diameter to a sensible default for the new chart
function upEMat(id, matId) {
  if (!S.edges[id]) return;
  S.edges[id].material = matId;
  const mat  = S.materials[matId];
  const pipe = mat ? PIPES[mat.chartKey] : null;
  if (pipe) {
    const curDia = S.edges[id].diameter;
    const sizes  = pipe.sizes.map(s => s.A);
    if (!sizes.includes(curDia)) S.edges[id].diameter = sizes[Math.floor(sizes.length / 2)];
  }
  autoSizeAllEdges();
  render();
}

function delNode(id) {
  delete S.nodes[id];
  Object.keys(S.edges).forEach(eid => {
    if (S.edges[eid].from === id || S.edges[eid].to === id) delete S.edges[eid];
  });
  if (selId === id) selId = null;
  autoSizeAllEdges();
  render();
}

function delEdge(id) {
  delete S.edges[id];
  if (selId === id) selId = null;
  autoSizeAllEdges();
  render();
}

// ── Context menu ──────────────────────────────────────────────────────────────

let ctxTarget = null, ctxType = null;

function ctxNode(e, id) {
  e.preventDefault(); e.stopPropagation();
  ctxTarget = id; ctxType = 'node';
  const n = S.nodes[id];
  const label = n ? n.label : 'Node';
  const mergeBtn = document.getElementById('ctx-merge');
  if (mergeBtn) mergeBtn.style.display = (n && n.type === 'branch') ? '' : 'none';
  showCtx(e.clientX, e.clientY, label);
}

function ctxMerge() {
  const id = ctxTarget; hideCtx();
  const { adj, radj } = buildAdj();
  const parents  = radj[id] || [];
  const children = adj[id]  || [];
  if (parents.length !== 1) return; // can only merge single-parent junctions
  const parentFrom = parents[0].from;
  // Re-wire all child edges to the parent node
  children.forEach(({ eid }) => { if (S.edges[eid]) S.edges[eid].from = parentFrom; });
  // Delete the junction and its inlet pipe
  delete S.edges[parents[0].eid];
  delete S.nodes[id];
  if (selId === id) selId = null;
  autoSizeAllEdges();
  render();
}

function ctxEdge(e, id) {
  e.preventDefault(); e.stopPropagation();
  ctxTarget = id; ctxType = 'edge';
  const ed = S.edges[id];
  const flipBtn = document.getElementById('ctx-flip');
  if (flipBtn) flipBtn.style.display = '';
  showCtx(e.clientX, e.clientY, ed ? `Ø${ed.diameter}mm pipe` : 'Pipe');
}

function ctxFlip() {
  const id = ctxTarget; hideCtx();
  flipEdge(id);
}

function flipEdge(id) {
  if (S.edges[id]) {
    const oldFrom = S.edges[id].from;
    S.edges[id].from = S.edges[id].to;
    S.edges[id].to = oldFrom;
    autoSizeAllEdges();
    render();
  }
}

function showCtx(x, y, lbl) {
  const m = document.getElementById('ctx-menu');
  document.getElementById('ctx-lbl').textContent = lbl;
  m.style.display = 'block';
  m.style.left    = x + 'px';
  m.style.top     = y + 'px';
}

function hideCtx()  { document.getElementById('ctx-menu').style.display = 'none'; ctxTarget = null; ctxType = null; }
function ctxSelect(){ if (ctxTarget) selId = ctxTarget; hideCtx(); render(); }

function ctxDelete() {
  if (!ctxTarget) { hideCtx(); return; }
  if (ctxType === 'node')  delNode(ctxTarget);
  if (ctxType === 'edge')  delEdge(ctxTarget);
  hideCtx();
}

// ── Canvas: drag, pan, connect tool ──────────────────────────────────────────

const svg = document.getElementById('svgc');

function getPos(e) {
  const r = svg.getBoundingClientRect();
  return { x: (e.clientX - r.left - vt.x) / vt.scale,
           y: (e.clientY - r.top  - vt.y) / vt.scale };
}

function startDrag(e, id) {
  e.stopPropagation();
  if (tool === 'connect') { connStart = id; return; }
  dragSt = { id, sx: e.clientX, sy: e.clientY,
             ox: S.nodes[id].x, oy: S.nodes[id].y, moved: false };
}

let connLine = null; // rubber-band SVG line during connect

svg.addEventListener('mousemove', e => {
  if (dragSt) {
    const ddx = e.clientX - dragSt.sx, ddy = e.clientY - dragSt.sy;
    if (Math.abs(ddx) > 2 || Math.abs(ddy) > 2) dragSt.moved = true;
    if (dragSt.moved) {
      S.nodes[dragSt.id].x = dragSt.ox + ddx / vt.scale;
      S.nodes[dragSt.id].y = dragSt.oy + ddy / vt.scale;
      render();
    }
  }
  if (connStart) {
    const p = getPos(e), sn = S.nodes[connStart];
    let cl = document.getElementById('conn-line');
    if (!cl) { cl = document.createElementNS('http://www.w3.org/2000/svg','line'); cl.id='conn-line'; cl.setAttribute('stroke','#e0c44d'); cl.setAttribute('stroke-width','1.5'); cl.setAttribute('stroke-dasharray','4,3'); svg.querySelector('#world').appendChild(cl); }
    cl.setAttribute('x1', sn.x); cl.setAttribute('y1', sn.y - (sn.elev || 0) * 20);
    cl.setAttribute('x2', p.x);  cl.setAttribute('y2', p.y);
    // Highlight hovered edge for snap-to-pipe feedback
    const hit = hitTestEdge(p.x, p.y);
    const hh  = document.getElementById('hit-highlight');
    if (hit && hh) { hh.setAttribute('x1', S.nodes[S.edges[hit.edgeId].from].x); hh.setAttribute('y1', S.nodes[S.edges[hit.edgeId].from].y); hh.setAttribute('x2', S.nodes[S.edges[hit.edgeId].to].x); hh.setAttribute('y2', S.nodes[S.edges[hit.edgeId].to].y); hh.style.display=''; }
    else if (hh) hh.style.display = 'none';
  }
  if (isPan && panSt) {
    vt.x += e.clientX - panSt.x; vt.y += e.clientY - panSt.y;
    panSt = { x: e.clientX, y: e.clientY };
    renderCanvas();
  }
});

svg.addEventListener('mouseup', e => {
  // Finish rubber-band connect
  const cl = document.getElementById('conn-line'); if (cl) cl.remove();
  const hh = document.getElementById('hit-highlight'); if (hh) hh.style.display = 'none';

  if (connStart) {
    const wasDrag  = dragSt && dragSt.moved;
    const nodeId   = dragSt ? dragSt.id : null;
    dragSt = null;

    const p       = getPos(e);
    // Check if released on an existing node
    let tgtNode   = null;
    Object.values(S.nodes).forEach(n => {
      if (n.id !== connStart && Math.sqrt((n.x-p.x)**2+(n.y-p.y)**2) * vt.scale < 20) tgtNode = n.id;
    });

    const mat  = Object.keys(S.materials)[0] || 'm_sgpw';
    const pipe = PIPES[S.materials[mat]?.chartKey || 'sgpw'];

    if (tgtNode) {
      // Released on a node: create edge between connStart and tgtNode
      const csn = S.nodes[connStart], ttn = S.nodes[tgtNode];
      let fromId = connStart, toId = tgtNode;
      // Enforce direction: fixture always downstream (toId)
      if (csn.type === 'fixture' && ttn.type !== 'fixture') { fromId = tgtNode; toId = connStart; }
      else if (csn.type !== 'fixture' && ttn.type === 'fixture') { fromId = connStart; toId = tgtNode; }
      else if (csn.type === 'source') { fromId = connStart; toId = tgtNode; }
      else if (ttn.type === 'source') { fromId = tgtNode;   toId = connStart; }
      const estLen = Math.sqrt((csn.x-ttn.x)**2+(csn.y-ttn.y)**2) / 50 || 3;
      addEdge(fromId, toId, mat, pipe ? pipe.sizes[2].A : 25, +estLen.toFixed(1));
    } else {
      // Released on canvas: check for pipe snap
      const hit = hitTestEdge(p.x, p.y);
      if (hit) {
        const hitEdge  = S.edges[hit.edgeId];
        const fromNode = hitEdge ? S.nodes[hitEdge.from] : null;
        const srcNode  = S.nodes[connStart];
        const eMat     = hitEdge?.material || mat;
        const ePipe    = PIPES[S.materials[eMat]?.chartKey || 'sgpw'];
        const distToFrom = fromNode
          ? Math.sqrt((hit.cx - fromNode.x)**2 + (hit.cy - fromNode.y)**2) * vt.scale
          : Infinity;

        if (distToFrom < 24) {
          // Snap to the pipe's from-node instead of splitting
          let fromId = hitEdge.from, toId = connStart;
          if (srcNode && srcNode.type === 'fixture') { fromId = hitEdge.from; toId = connStart; }
          else { fromId = connStart; toId = hitEdge.from; }
          const estLen = Math.sqrt((srcNode.x - fromNode.x)**2 + (srcNode.y - fromNode.y)**2) / 50 || 2;
          addEdge(fromId, toId, eMat, ePipe ? ePipe.sizes[2].A : 25, +estLen.toFixed(1));
        } else {
          // Split the pipe and insert a tap junction
          const jId    = splitEdge(hit.edgeId, 'Tap', hit.cx, hit.cy);
          const estLen = Math.sqrt((srcNode.x - hit.cx)**2 + (srcNode.y - hit.cy)**2) / 50 || 2;
          const isFixture = srcNode && srcNode.type === 'fixture';
          const fromId    = isFixture ? jId       : connStart;
          const toId      = isFixture ? connStart : jId;
          addEdge(fromId, toId, eMat, ePipe ? ePipe.sizes[2].A : 25, +estLen.toFixed(1));
        }
      }
    }
    connStart = null;
    autoSizeAllEdges();
    render();
    return;
  }

  // Finish node drag or select
  if (dragSt) {
    if (!dragSt.moved) selectItem(dragSt.id);
    dragSt = null;
  }
  isPan = false;
});

svg.addEventListener('mousedown', e => {
  if (e.target === svg || e.target.tagName === 'svg') {
    if (tool === 'select') { isPan = true; panSt = { x: e.clientX, y: e.clientY }; }
    else if (tool === 'connect') { connStart = null; }
  }
  hideCtx();
});

svg.addEventListener('click', e => {
  if (e.target === svg || e.target.tagName === 'svg') { selId = null; render(); }
});

svg.addEventListener('dblclick', e => {
  if (e.target === svg || e.target.tagName === 'svg' || e.target.tagName === 'g') {
    const p = getPos(e);
    quickAddBranchAt(p.x, p.y);
  }
});



svg.addEventListener('wheel', e => {
  e.preventDefault();
  const f    = e.deltaY < 0 ? 1.1 : 0.9;
  const r    = svg.getBoundingClientRect();
  const cx   = e.clientX - r.left, cy = e.clientY - r.top;
  vt.x = cx - f * (cx - vt.x);
  vt.y = cy - f * (cy - vt.y);
  vt.scale *= f;
  renderCanvas();
}, { passive: false });

// ── Canvas tool helpers ───────────────────────────────────────────────────────

// Split an edge at point (jx,jy), inserting a new 'branch' junction node.
// Proportionally splits the pipe length; elevation linearly interpolated.
// Returns the new junction node id.
function splitEdge(edgeId, junctionLabel, jx, jy) {
  const e = S.edges[edgeId]; if (!e) return null;
  const fromId   = e.from, toId = e.to;
  const fromNode = S.nodes[fromId];
  const dx = jx - fromNode.x, dy = jy - fromNode.y;
  const totalDist = Math.sqrt((S.nodes[toId].x - fromNode.x)**2 + (S.nodes[toId].y - fromNode.y)**2);
  const frac      = Math.sqrt(dx*dx + dy*dy) / totalDist;
  const origLen   = e.length || 5;
  const len1      = Math.max(0.5, +(origLen * frac).toFixed(1));
  const len2      = Math.max(0.5, +(origLen * (1 - frac)).toFixed(1));
  const jElev     = +((fromNode.elev || 0) + frac * ((S.nodes[toId].elev || 0) - (fromNode.elev || 0))).toFixed(2);
  const jId       = uid();
  S.nodes[jId]    = { id:jId, type:'branch', label:junctionLabel, x:jx, y:jy, elev:jElev,
                      pressure:0, pump:false, pumpHead:0 };
  const mat = e.material, dia = e.diameter, fittings = e.fittings || {};
  delete S.edges[edgeId];
  addEdge(fromId, jId, mat, dia, len1);
  S.edges[Object.keys(S.edges)[Object.keys(S.edges).length - 1]].fittings = { ...fittings };
  addEdge(jId, toId, mat, dia, len2);
  return jId;
}

// Find the edge closest to point (px,py) within threshold pixels.
// Returns { edgeId, cx, cy, dist } or null.
function hitTestEdge(px, py, threshold = 12) {
  let best = null;
  Object.values(S.edges).forEach(e => {
    const fn = S.nodes[e.from], tn = S.nodes[e.to]; if (!fn || !tn) return;
    const fy = fn.y - (fn.elev || 0) * 20;
    const ty = tn.y - (tn.elev || 0) * 20;
    const dx = tn.x - fn.x, dy = ty - fy;
    const lenSq = dx*dx + dy*dy; if (lenSq === 0) return;
    const t    = Math.max(0, Math.min(1, ((px - fn.x)*dx + (py - fy)*dy) / lenSq));
    const cx   = fn.x + t * dx, cy = fy + t * dy;
    const dist = Math.sqrt((px - cx)**2 + (py - cy)**2);
    if (dist < threshold && (!best || dist < best.dist)) best = { edgeId:e.id, cx, cy, dist };
  });
  return best;
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

function showNTip(e, id) {
  const n = S.nodes[id];
  const { adj } = buildAdj();
  const { units, hasValve } = downstreamUnits(id, adj);
  const Q = simFlow(units, hasValve);
  const t = document.getElementById('tip');
  t.innerHTML = `<b>${n.label}</b> [${n.type}]<br>↓ ${units.toFixed(1)}u · Q=${Q.toFixed(1)}L/m · Z=${n.elev || 0}m`;
  t.className = 'tip show';
  t.style.left = (e.clientX + 12) + 'px';
  t.style.top  = (e.clientY - 8)  + 'px';
}

function showETip(e, id) {
  const edge     = S.edges[id];
  const mat      = S.materials[edge.material];
  const chartKey = mat ? mat.chartKey : 'sgpw';
  const pipe     = PIPES[chartKey];
  const C        = pipe ? pipe.C : 130;
  const { adj }  = buildAdj();
  const { units, hasValve } = downstreamUnits(edge.to, adj);
  const Q  = simFlow(units, hasValve);
  const innerDiaTip = getInnerDia(pipe, edge.diameter);
  const R  = R_fromHW(C, innerDiaTip, Q);
  const v  = velocity(Q, innerDiaTip);
  const eq = calcEqLen(edge);
  const t  = document.getElementById('tip');
  t.innerHTML = `<b>Ø${edge.diameter}A</b> ${mat ? mat.name : '?'}<br>Q=${Q.toFixed(1)}L/m · v=${v.toFixed(2)}m/s · R=${R.toFixed(3)}kPa/m<br>L=${edge.length}m + ${eq.toFixed(2)}m eq`;
  t.className = 'tip show';
  t.style.left = (e.clientX + 12) + 'px';
  t.style.top  = (e.clientY - 8)  + 'px';
}

function hideTip() { document.getElementById('tip').className = 'tip'; }

// ── Tool buttons, zoom, fit ───────────────────────────────────────────────────

function setTool(t) {
  tool = t;
  document.querySelectorAll('.cb').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && t === 'select') || (i === 1 && t === 'connect'));
  });
}

function zoom(f) {
  const s = document.getElementById('svgc');
  const cx = s.clientWidth / 2, cy = s.clientHeight / 2;
  vt.x = cx - f * (cx - vt.x);
  vt.y = cy - f * (cy - vt.y);
  vt.scale *= f;
  renderCanvas();
}

function fitView() {
  const ns = Object.values(S.nodes); if (!ns.length) return;
  const xs = ns.map(n => n.x), ys = ns.map(n => n.y);
  const svgEl = document.getElementById('svgc');
  const W = svgEl.clientWidth, H = svgEl.clientHeight;
  const sx = W / (Math.max(...xs) - Math.min(...xs) + 80);
  const sy = H / (Math.max(...ys) - Math.min(...ys) + 80);
  vt.scale = Math.min(sx, sy, 2);
  vt.x = W / 2 - vt.scale * (Math.max(...xs) + Math.min(...xs)) / 2;
  vt.y = H / 2 - vt.scale * (Math.max(...ys) + Math.min(...ys)) / 2;
  renderCanvas();
}


