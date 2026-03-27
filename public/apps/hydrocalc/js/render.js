// =============================================================================
// render.js
// All DOM and SVG rendering. No calculations or state mutations here.
//
// Entry point: render() → calls all sub-renderers in order.
//   renderPumpInd()   topbar pump indicator
//   renderTree()      left sidebar system tree
//   renderCanvas()    SVG network diagram
//   renderCalc()      bottom calculation ledger table
//   renderProps()     right properties panel
//   renderReference() reference materials tab
//   renderLibrary()   fixture library tab
//   renderMaterials() pipe materials tab
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
   §8  RENDERING
   ─────────────
   All DOM/SVG updates live here.  No calculations or state mutations.
   Entry point is render() which calls all sub-renderers in order.
   ═══════════════════════════════════════════════════════════════════════════════ */

// Guard against re-entrant calls
let _rendering = false;

function render() {
  if (_rendering) return;
  _rendering = true;
  try {
    renderPumpInd();
    renderTree();
    renderCanvas();
    renderCalc();
    renderProps();
  } finally {
    _rendering = false;
  }
}

// ── Pump indicator (topbar) ───────────────────────────────────────────────────

function renderPumpInd() {
  const pumps = Object.values(S.nodes).filter(n => n.type === 'source' && n.pump);
  document.getElementById('pump-ind').innerHTML = pumps.length
    ? pumps.map(n => `<span class="pump-tag">⚙ ${n.label} +${n.pumpHead || 0}kPa</span>`).join('')
    : '';
}

// ── System tree (left sidebar) ────────────────────────────────────────────────

function renderTree() {
  const { adj } = buildAdj();
  const segs = calcAllSegments();
  const segByEdge = {};
  segs.forEach(r => segByEdge[r.eid] = r);
  const sources = Object.values(S.nodes).filter(n => n.type === 'source');
  const fixtureIcons = {
    wc_valve:'🚽', wc_valve2:'🚽', wc_tank:'🚽', wc_spec:'🚽',
    urinal:'🚾', washbasin:'🪥', handwash:'🪥', kitchen:'🍳',
    mop:'🧹', sink13:'🚰', sink20:'🚰', hose:'🌿',
    bathtub:'🛁', bathtub_j:'🛁', shower:'🚿',
    wh_s:'🔥', wh_m:'🔥', wh_l:'🔥',
  };
  let h = '';

  // Render a pipe row (edge) in the tree
  function renderEdgeRow(eid, indent) {
    const e = S.edges[eid]; if (!e) return;
    const r   = segByEdge[eid];
    const v   = r ? r.v : 0;
    const col = velColor(v);
    const eSel = selId === eid;
    const dia  = e.diameter || 25;
    const Q    = r ? r.Q : 0;
    h += `<div class="pipe-row${eSel ? ' sel' : ''}" style="padding-left:${indent + 8}px"
               onclick="selectEdge('${eid}')" data-eid="${eid}">
            <span style="display:inline-block;width:10px;height:2px;background:${col};vertical-align:middle;margin-right:4px"></span>
            <span style="color:${col}">Ø${dia}A</span>
            <span style="color:var(--text-dim);margin-left:4px">${Q > 0 ? Q.toFixed(1) + ' L/m' : '—'}</span>
            <span style="color:${col};margin-left:4px">${v > 0 ? v.toFixed(2) + ' m/s' : ''}</span>
          </div>`;
  }

  // Recursively render a node and its downstream tree
  const treeVisited = new Set();
  function rn(id, indent) {
    if (treeVisited.has(id)) return;
    treeVisited.add(id);
    const n = S.nodes[id]; if (!n) return;
    const { units } = downstreamUnits(id, adj);
    const nSel = selId === id;
    const ic   = n.type === 'source' ? '⊕' : n.type === 'branch' ? '◆' : (fixtureIcons[n.fixtureType] || '◈');
    const cl   = n.type === 'source' ? 'src' : n.type === 'branch' ? 'br' : 'ft';
    h += `<div class="tn ${cl}${nSel ? ' sel' : ''}" style="padding-left:${indent}px"
               onclick="selectNode('${id}')" data-nid="${id}">
            ${ic} <b>${n.label}</b>
            <span style="color:var(--text-dim);font-size:10px">${units > 0 ? ' ' + units.toFixed(1) + 'u' : ''}</span>
          </div>`;
    (adj[id] || []).forEach(({ eid, to }) => {
      renderEdgeRow(eid, indent + 8);
      rn(to, indent + 16);
    });
  }

  sources.forEach(n => rn(n.id, 0));

  // Any nodes not reachable from a source (disconnected)
  const conn = new Set();
  sources.forEach(n => {
    const q = [n.id];
    while (q.length) {
      const id = q.shift();
      if (conn.has(id)) continue;
      conn.add(id);
      (adj[id] || []).forEach(({ to }) => { if (!conn.has(to)) q.push(to); });
    }
  });
  const disc = Object.values(S.nodes).filter(n => !conn.has(n.id));
  if (disc.length) {
    h += `<div style="color:var(--text-dim);font-size:10px;padding:4px 8px">— disconnected —</div>`;
    disc.forEach(n => rn(n.id, 0));
  }

  document.getElementById('tree-cont').innerHTML = h;
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

// Node fill colour by type
function nColor(n) {
  return n.type === 'source' ? '#2563eb' : n.type === 'fixture' ? '#16a34a' : '#64748b';
}

// Node hit-test radius by type
function nRadius(n) {
  return n.type === 'source' ? 20 : n.type === 'branch' ? 8 : 18;
}

// SVG symbol for a fixture node (2D engineering icon)
function fixtureSymbol(fixtureTypeId, color, isSel) {
  const s  = isSel ? 'var(--amber)' : color;
  const sw = isSel ? 2.5 : 1.5;
  const bg = 'rgba(255,255,255,0.9)';
  const sym = {
    wc_valve:  `<rect x="-10" y="-14" width="20" height="28" rx="3" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <line x1="0" y1="-14" x2="0" y2="14" stroke="${s}" stroke-width="${sw}"/>
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="${s}"/>`,
    wc_tank:   `<rect x="-10" y="-14" width="20" height="20" rx="2" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <rect x="-6"  y="6"   width="12" height="8"  rx="1" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>`,
    urinal:    `<path d="M-8,-14 Q0,-18 8,-14 L10,2 Q10,14 0,14 Q-10,14 -10,2 Z" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>`,
    washbasin: `<ellipse cx="0" cy="0" rx="10" ry="8" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <line x1="0" y1="-14" x2="0" y2="-8" stroke="${s}" stroke-width="${sw}"/>`,
    handwash:  `<ellipse cx="0" cy="0" rx="7"  ry="5" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <line x1="0" y1="-14" x2="0" y2="-5" stroke="${s}" stroke-width="${sw}"/>`,
    kitchen:   `<rect x="-10" y="-10" width="20" height="20" rx="2" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <circle cx="-4" cy="-2" r="3" fill="none" stroke="${s}" stroke-width="${sw}"/>`,
    mop:       `<rect x="-10" y="-10" width="20" height="20" rx="2" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <line x1="-6" y1="2" x2="6" y2="2" stroke="${s}" stroke-width="${sw}"/>`,
    hose:      `<circle cx="0" cy="0" r="10" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <path d="M-5,0 Q0,-8 5,0" fill="none" stroke="${s}" stroke-width="${sw}"/>`,
    bathtub:   `<rect x="-12" y="-8" width="24" height="16" rx="4" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <ellipse cx="6" cy="-4" rx="3" ry="2" fill="none" stroke="${s}" stroke-width="${sw * 0.8}"/>`,
    shower:    `<line x1="0" y1="-14" x2="0" y2="0" stroke="${s}" stroke-width="${sw}"/>
                <line x1="-8" y1="0" x2="8" y2="0" stroke="${s}" stroke-width="${sw}"/>
                <circle cx="-4" cy="6" r="1.5" fill="${s}"/>
                <circle cx="0"  cy="8" r="1.5" fill="${s}"/>
                <circle cx="4"  cy="6" r="1.5" fill="${s}"/>`,
    wh_s:      `<rect x="-8" y="-12" width="16" height="24" rx="8" fill="${bg}" stroke="${s}" stroke-width="${sw}"/>
                <text x="0" y="5" text-anchor="middle" font-size="10" fill="${s}">♨</text>`,
  };
  // Alias variants to their base symbol
  const aliases = { wc_valve2:'wc_valve', wc_spec:'wc_valve', sink13:'mop', sink20:'mop', bathtub_j:'bathtub', wh_m:'wh_s', wh_l:'wh_s' };
  const resolvedId = aliases[fixtureTypeId] || fixtureTypeId;
  return (sym[resolvedId] || sym['washbasin']);
}

// ── Canvas (SVG network diagram) ──────────────────────────────────────────────

function renderCanvas() {
  const results = calcAllSegments();
  const rmap = {};
  results.forEach(r => rmap[r.eid] = r);

  // Build edge SVG
  let edgeHtml = '';
  Object.values(S.edges).forEach(e => {
    const fn = S.nodes[e.from], tn = S.nodes[e.to]; if (!fn || !tn) return;
    const r         = rmap[e.id];
    const isSel     = selId === e.id;
    const pipeColor = isSel ? 'var(--amber)' : velColor(r ? r.v : 0);
    const sw        = Math.max(2, Math.min(8, (e.diameter || 25) / 6));
    const fvy       = fn.y - (fn.elev || 0) * 20;
    const tvy       = tn.y - (tn.elev || 0) * 20;
    const mx        = (fn.x + tn.x) / 2, my = (fvy + tvy) / 2;
    edgeHtml += `
      <line x1="${fn.x}" y1="${fvy}" x2="${tn.x}" y2="${tvy}"
            stroke="transparent" stroke-width="20" style="cursor:pointer"
            onmouseenter="showETip(event,'${e.id}')" onmouseleave="hideTip()"
            onclick="selectEdge('${e.id}')"/>
      <line x1="${fn.x}" y1="${fvy}" x2="${tn.x}" y2="${tvy}"
            stroke="${pipeColor}" stroke-width="${sw}"
            stroke-linecap="round" marker-end="url(#arr)"
            style="pointer-events:none" />
      <circle cx="${mx}" cy="${my}" r="4" fill="${pipeColor}" style="pointer-events:none; opacity:0.6"/>`;
  });

  // Build node SVG
  let nodeHtml = '';
  Object.values(S.nodes).forEach(n => {
    const c    = nColor(n), r = nRadius(n), isSel = selId === n.id;
    const hitR = r + 10;
    const vy   = n.y - (n.elev || 0) * 20;

    if (Math.abs(n.elev || 0) > 0.01) {
      nodeHtml += `<line x1="${n.x}" y1="${vy}" x2="${n.x}" y2="${n.y}" stroke="${c}" stroke-width="1.5" stroke-dasharray="2,3" opacity="0.4" style="pointer-events:none"/>
                   <circle cx="${n.x}" cy="${n.y}" r="2" fill="${c}" opacity="0.4" style="pointer-events:none"/>`;
    }

    if (n.type === 'branch') {
      nodeHtml += `
        <circle cx="${n.x}" cy="${vy}" r="${hitR}" fill="transparent"
                onmousedown="startDrag(event,'${n.id}')" onmouseenter="showNTip(event,'${n.id}')"
                onmouseleave="hideTip()" oncontextmenu="ctxNode(event,'${n.id}')"/>
        <circle cx="${n.x}" cy="${vy}" r="${r}" fill="${isSel ? 'var(--amber)' : '#fff'}"
                stroke="${isSel ? 'var(--text-bright)' : c}" stroke-width="1.5" style="pointer-events:none"/>`;
    } else if (n.type === 'fixture') {
      nodeHtml += `
        <circle cx="${n.x}" cy="${vy}" r="${hitR}" fill="transparent"
                onmousedown="startDrag(event,'${n.id}')" onmouseenter="showNTip(event,'${n.id}')"
                onmouseleave="hideTip()" oncontextmenu="ctxNode(event,'${n.id}')"/>
        <g transform="translate(${n.x},${vy})" style="pointer-events:none">
          ${fixtureSymbol(n.fixtureType, c, isSel)}
        </g>`;
    } else { // source
      nodeHtml += `
        <circle cx="${n.x}" cy="${vy}" r="${hitR}" fill="transparent"
                onmousedown="startDrag(event,'${n.id}')" onmouseenter="showNTip(event,'${n.id}')"
                onmouseleave="hideTip()" oncontextmenu="ctxNode(event,'${n.id}')"/>
        <circle cx="${n.x}" cy="${vy}" r="${r}" fill="${isSel ? 'var(--amber)' : '#fff'}"
                stroke="${isSel ? 'var(--text-bright)' : c}" stroke-width="2.5" style="pointer-events:none"/>
        <text x="${n.x}" y="${vy + 4}" text-anchor="middle" font-size="10" fill="${isSel ? '#fff' : c}"
              font-weight="bold" style="pointer-events:none">W</text>`;
    }
    // Node label
    nodeHtml += `<text x="${n.x}" y="${vy + r + 14}" text-anchor="middle"
                       font-size="10" fill="var(--text-dim)" style="pointer-events:none">${n.label}</text>`;
  });

  const g = document.getElementById('world');
  if (g) {
    g.setAttribute('transform', `translate(${vt.x},${vt.y}) scale(${vt.scale})`);
    g.innerHTML = edgeHtml + nodeHtml;
  }
}

// ── Calculation ledger (bottom panel) ────────────────────────────────────────

function renderCalc() {
  const res = calcAllSegments();
  let h = '';
  res.forEach((r, i) => {
    const isSelRow = selId === r.eid;
    const statusIcon = r.status === 'ok' ? '✓' : (r.status === 'warn' ? '⚠' : '✗');
    
    // Value highlighting logic
    const vColor = (r.v > 4.0) ? 'var(--red)' : (r.v > 2.0 ? 'var(--amber)' : 'inherit');
    const rColor = (r.status === 'err' && r.R_act > r.R_allow) ? 'var(--red)' : 
                   (r.status === 'warn' && r.R_act > r.R_allow) ? 'var(--amber)' : 'inherit';
    
    h += `<tr data-eid="${r.eid}" onclick="selectEdge('${r.eid}')"
              style="${isSelRow ? 'background:rgba(224,196,77,0.18);outline:1px solid #e0c44d' : ''}">
            <td style="text-align:right;color:var(--text-dim)">${i + 1}</td>
            <td>${r.from} <span style="color:var(--text-dim)">→</span> ${r.to}</td>
            <td style="color:var(--text-dim);font-size:10px">${r.chartKey}</td>
            <td style="text-align:right">${r.L_act}</td>
            <td style="text-align:right">${r.L_bend}</td>
            <td style="text-align:right">${r.L_tot}</td>
            <td style="text-align:right">${r.dZ}</td>
            <td style="text-align:right">${r.units}</td>
            <td style="text-align:right">${r.Q}</td>
            <td style="text-align:right;font-size:9px;color:var(--text-dim)">${r.R_allow.toFixed(3)}</td>
            <td style="text-align:right;font-weight:700;color:${rColor}">${r.R_act.toFixed(3)}</td>
            <td style="text-align:right;color:${vColor}">${r.v.toFixed(2)}</td>
            <td style="text-align:right;color:var(--text-dim);font-size:9px">${r.rec || '—'}</td>
            <td style="text-align:right">Ø${r.dia}</td>
            <td class="${r.status}" style="text-align:center">${statusIcon}</td>
          </tr>`;
  });
  document.getElementById('cb2').innerHTML = h;

  // Scroll selected row into view
  if (selId) {
    const selRow = document.querySelector(`#cb2 tr[data-eid="${selId}"]`);
    if (selRow) selRow.scrollIntoView({ block: 'nearest' });
  }

  // Update summary badge
  const ok = res.filter(r => r.ok).length, tot = res.length;
  const stEl = document.getElementById('st');
  const sdot = document.getElementById('sdot');
  if (stEl) {
    const isError = ok < tot;
    stEl.textContent = tot > 0 ? `${ok}/${tot} segments OK` : '0/0 segments OK';
    stEl.style.color = isError ? 'var(--red)' : 'var(--green)';

    if (sdot) {
      sdot.className = isError ? 'sdot w' : 'sdot';
      sdot.style.boxShadow = isError ? '0 0 10px var(--red)' : 'none';
    }
  }
}

// ── Properties panel (right sidebar) ─────────────────────────────────────────

function renderProps() {
  const cont = document.getElementById('props-content');
  const lbl  = document.getElementById('sel-lbl');
  if (!cont) return;

  if (!selId) {
    if (lbl) lbl.textContent = 'Nothing selected';
    cont.innerHTML = '<p style="color:var(--text-dim);font-size:11px;padding:8px">Click a node or pipe to inspect.</p>';
    return;
  }

  const n = S.nodes[selId], e = S.edges[selId];

  // ── Node properties ───────────────────────────────────────────────────────
  if (n) {
    const { adj }           = buildAdj();
    const { units, hasValve } = downstreamUnits(n.id, adj);
    const Q = simFlow(units, hasValve);
    const typeBadge = { source:'⊕ Source', branch:'◆ Junction', fixture:'◈ Fixture' };
    if (lbl) lbl.textContent = n.label;
    let extra = '';

    if (n.type === 'source') {
      extra = `
        <label>Label</label>
        <input value="${n.label}" onchange="upN('${n.id}','label',this.value)">
        <label>Elevation Z (m)</label>
        <input type="number" step="any" value="${n.elev || 0}" onchange="upN('${n.id}','elev',+this.value)">
        <label>Supply pressure (kPa)</label>
        <input type="number" step="any" value="${n.pressure || 300}" onchange="upN('${n.id}','pressure',+this.value)">
        <label>Booster pump</label>
        <label class="tog"><input type="checkbox" ${n.pump ? 'checked' : ''} onchange="upN('${n.id}','pump',this.checked)"> Enabled</label>
        ${n.pump ? `<label>Pump head (kPa)</label><input type="number" step="any" value="${n.pumpHead || 0}" onchange="upN('${n.id}','pumpHead',+this.value)">` : ''}`;
    } else if (n.type === 'branch') {
      extra = `
        <label>Label</label>
        <input value="${n.label}" oninput="upN('${n.id}','label',this.value)">
        <label>Elevation Z (m)</label>
        <input type="number" value="${n.elev || 0}" step="0.1" oninput="upN('${n.id}','elev',+this.value)">
        <div class="info-row"><span>Demand units (downstream)</span><b>${units.toFixed(1)} u</b></div>
        <div class="info-row"><span>Design flow Q</span><b>${Q.toFixed(1)} L/min</b></div>
        <p style="color:var(--text-dim);font-size:10px">Right-click → Remove Junction to delete and re-wire.</p>`;
    } else if (n.type === 'fixture') {
      const fixOpts = Object.values(S.fixtures).map(f =>
        `<option value="${f.id}" ${n.fixtureType === f.id ? 'selected' : ''}>${f.name}</option>`).join('');
      const fix  = S.fixtures[n.fixtureType] || {};
      const mode = (S.settings && S.settings.mode) || 'public';
      const fuPub  = fix.units != null ? fix.units : '—';
      const fuPrv  = fix.unitsPrivate != null ? fix.unitsPrivate : fuPub;
      const fuBase = mode === 'private' ? fuPrv : fuPub;
      const fuEff  = effectiveFU(n).toFixed(2);
      const hwNote = n.hotWater ? ' <span style="color:var(--amber);font-size:9px">×¾ applied</span>' : '';
      extra = `
        <label>Label</label>
        <input value="${n.label}" onchange="upN('${n.id}','label',this.value)">
        <label>Elevation Z (m)</label>
        <input type="number" value="${n.elev || 0}" step="any" onchange="upN('${n.id}','elev',+this.value)">
        <label>Fixture type</label>
        <select onchange="upN('${n.id}','fixtureType',this.value);render()">${fixOpts}</select>
        <label>Quantity</label>
        <input type="number" min="1" value="${n.fixtureQty || 1}" onchange="upN('${n.id}','fixtureQty',+this.value)">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" ${n.hotWater ? 'checked' : ''} onchange="upN('${n.id}','hotWater',this.checked)">
          給湯栓併用 Hot water mixed faucet (FU × ¾)
        </label>
        <div class="info-row"><span>FU Public / Private</span><b style="font-family:var(--mono)">${fuPub} / ${fuPrv}</b></div>
        <div class="info-row"><span>Effective FU (${mode})${hwNote}</span><b style="color:var(--amber);font-family:var(--mono)">${fuEff} × ${n.fixtureQty||1} = ${(+fuEff*(n.fixtureQty||1)).toFixed(2)} u</b></div>
        <div class="info-row"><span>Min pressure</span><b>${fix.minPressure || '—'} kPa</b></div>
        <div class="info-row"><span>Conn. dia</span><b>Ø${fix.connDia || '—'} mm</b></div>`;
    }

    cont.innerHTML = `
      <div class="prop-badge">${typeBadge[n.type] || n.type}</div>
      <button class="btn danger" style="margin-bottom:8px;width:100%" onclick="delNode('${n.id}')">🗑 Delete Node</button>
      <div class="prop-form">${extra}</div>`;
    return;
  }

  // ── Edge properties ───────────────────────────────────────────────────────
  if (e) {
    const mat      = S.materials[e.material];
    const chartKey = mat ? mat.chartKey : 'sgpw';
    const pipe     = PIPES[chartKey];
    const C        = pipe ? pipe.C : 130;
    const matOpts  = Object.values(S.materials).map(m =>
      `<option value="${m.id}" ${e.material === m.id ? 'selected' : ''}>${m.name}</option>`).join('');
    const sizes    = (pipe ? pipe.sizes : []).map(s => s.A);
    const diaOpts  = sizes.map(d => `<option value="${d}" ${e.diameter == d ? 'selected' : ''}>${d} mm</option>`).join('');
    const { adj }  = buildAdj();
    const { units, hasValve } = downstreamUnits(e.to, adj);
    const Q        = simFlow(units, hasValve);
    const fromNode = S.nodes[e.from], toNode = S.nodes[e.to];
    const dZ       = ((toNode ? toNode.elev : 0) || 0) - ((fromNode ? fromNode.elev : 0) || 0);

    let P_req = 30;
    if (toNode && toNode.type === 'fixture') P_req = (S.fixtures[toNode.fixtureType] || {}).minPressure || 30;
    else P_req = 0;

    const allSegs      = calcAllSegments();
    const seg          = allSegs.find(r => r.eid === e.id);
    const P_up_display = seg ? (seg.R_allow * seg.L_tot + dZ * 9.81 + P_req).toFixed(1) : '—';
    const R_allow      = seg ? seg.R_allow : 0;
    const innerDiaRP   = getInnerDia(pipe, e.diameter);
    const R_act        = seg ? seg.R_act   : R_fromHW(C, innerDiaRP, Q);
    const v            = velocity(Q, innerDiaRP);
    const rec          = selectDiamFromChart(chartKey, Q, Math.max(R_allow, 0.001));
    const L_bend       = calcEqLen(e);
    const L_tot        = (e.length || 0) + L_bend;

    // Build fittings table rows
    const fKeys = (pipe && pipe.eqLen && pipe.eqLen.fittingKeys) || ['elbow90','elbow45'];
    let fRows = '';
    fKeys.forEach(fk => {
      const qty = (e.fittings && e.fittings[fk]) || 0;
      const eq  = getEqLen(chartKey, e.diameter, fk);
      fRows += `<tr>
        <td>${FITTING_NAMES[fk] || fk}</td>
        <td><input type="number" min="0" max="99" value="${qty}" style="width:44px"
             onchange="upFitting('${e.id}','${fk}',+this.value)"></td>
        <td style="color:var(--text-dim)">${eq > 0 ? eq + ' m' : '—'}</td>
        <td style="color:var(--text-dim)">${qty > 0 && eq > 0 ? (qty * eq).toFixed(2) + ' m' : '—'}</td>
      </tr>`;
    });

    // Velocity status label
    const vLabel = v <= 0 ? '—' : v <= 2 ? '✓ OK' : v <= 3 ? '⚠ HIGH' : v <= 4 ? '⚠ VERY HIGH' : '⚠ EXCESSIVE';

    if (lbl) lbl.textContent = `${fromNode ? fromNode.label : '?'} → ${toNode ? toNode.label : '?'}`;
    cont.innerHTML = `
      <div class="prop-badge">Pipe Segment</div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
        <button class="btn primary" style="width:100%" onclick="autoSizeAllEdges(true);render()">⚡ Apply Recommended Size</button>
        <div style="display:flex;gap:4px">
          <button class="btn" style="flex:1" onclick="flipEdge('${e.id}')">⇄ Flip Flow</button>
          <button class="btn danger" style="flex:1" onclick="delEdge('${e.id}')">🗑 Delete</button>
        </div>
      </div>
      <div class="prop-form">
        <label>Material</label>
        <select onchange="upEMat('${e.id}',this.value)">${matOpts}</select>
        <label>Diameter</label>
        <select onchange="upE('${e.id}','diameter',+this.value)">${diaOpts}</select>
        <label>Length (m)</label>
        <input type="number" min="0.1" step="any" value="${e.length || 5}" onchange="upE('${e.id}','length',+this.value)">

        <div class="prop-section">Fittings</div>
        <table class="fit-tbl">
          <thead><tr><th>Fitting</th><th>Qty</th><th>eq/unit</th><th>Total</th></tr></thead>
          <tbody>${fRows}</tbody>
        </table>
        <div class="info-row"><span>Σ fittings equiv.</span><b>${L_bend.toFixed(2)} m</b></div>
        <div class="info-row"><span>L total (act+eq)</span><b>${L_tot.toFixed(2)} m</b></div>

        <div class="prop-section">Hydraulics</div>
        <div class="info-row"><span>Demand units (↓)</span><b>${units.toFixed(1)} u</b></div>
        <div class="info-row"><span>Design flow Q</span><b>${Q.toFixed(1)} L/min</b></div>
        <div class="info-row"><span>P upstream</span><b>${P_up_display} kPa</b></div>
        <div class="info-row"><span>ΔZ elev</span><b>${dZ.toFixed(2)} m</b></div>
        <div class="info-row"><span>R allow</span><b>${R_allow.toFixed(4)} kPa/m</b></div>
        <div class="info-row"><span>R actual (HW)</span><b>${R_act.toFixed(4)} kPa/m</b></div>
        <div class="info-row"><span>Velocity</span><b style="color:${velColor(v)}">${v.toFixed(2)} m/s — ${vLabel}</b></div>
        <div class="info-row"><span>Rec. diameter</span><b style="color:${rec.A === e.diameter ? 'var(--green)' : 'var(--amber)'}">${rec.A ? 'Ø' + rec.A : '—'}</b></div>
      </div>`;
  }
}

// ── Reference Materials tab ───────────────────────────────────────────────────

function renderReference() {
  if (Object.keys(PIPES).length === 0) {
    setRefStatusEmpty();
    document.getElementById('ref-content').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:48px 24px;gap:16px;text-align:center;color:var(--text-dim)">
        <div style="font-size:40px;opacity:0.3">📋</div>
        <div style="font-family:var(--head);font-size:16px;font-weight:700;color:var(--text)">No Pipe Reference Loaded</div>
        <div style="font-size:12px;max-width:400px;line-height:1.6">
          Load a pipe chart reference file to populate all JIS pipe chart data (図7-2~7-8) and equivalent length tables (表7-4~7-9).
        </div>
        <label style="cursor:pointer;margin-top:8px">
          <span class="btn primary" style="font-size:12px;padding:7px 18px;display:inline-flex;align-items:center;gap:6px">📂 Load Pipe Reference</span>
          <input type="file" accept=".xlsx" style="display:none" onchange="loadPipeRefXlsx(event)">
        </label>
      </div>`;
    return;
  }
  let h = '';
  Object.entries(PIPES).forEach(([key, pipe]) => {

    // ── Pipe sizes table (inner diameters) ────────────────────────────────
    const sizeRows = pipe.sizes.map(s =>
      `<tr><td>${s.A}${pipe.suffix}</td><td>${s.id.toFixed(3)}</td></tr>`).join('');

    // ── Equivalent length table ───────────────────────────────────────────
    let eqHtml = '';
    if (pipe.eqLen) {
      const thCells = pipe.eqLen.cols.map(c => `<th>${c}</th>`).join('');
      const tbRows  = pipe.eqLen.rows.map(row =>
        `<tr>${row.map(v => v == null
          ? `<td class="null-val">—</td>`
          : `<td>${v}</td>`
        ).join('')}</tr>`
      ).join('');
      eqHtml = `
        <p class="ref-label">${pipe.eqLen.title}</p>
        <div class="ref-scroll">
          <table class="ref-table">
            <thead><tr>${thCells}</tr></thead>
            <tbody>${tbRows}</tbody>
          </table>
        </div>`;
    }

    h += `
      <div class="ref-section">
        <div class="ref-sec-hdr" onclick="toggleRef(this)">
          <span class="ref-sec-title">${pipe.label}</span>
          <span class="ref-sec-sub">${pipe.figNo} &nbsp;·&nbsp; C = ${pipe.C} &nbsp;·&nbsp; ${pipe.sizes.length} sizes</span>
        </div>
        <div class="ref-sec-body">
          <div class="ref-inner-grid">
            <div>
              <p class="ref-label">管内径 (Inner Diameters)</p>
              <table class="ref-table">
                <thead><tr><th>呼び径</th><th>内径 mm</th></tr></thead>
                <tbody>${sizeRows}</tbody>
              </table>
            </div>
            <div>${eqHtml}</div>
          </div>
        </div>
      </div>`;
  });
  document.getElementById('ref-content').innerHTML = h;
}

function toggleRef(hdr) {
  const body   = hdr.nextElementSibling;
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.ref-sec-body').forEach(b => b.classList.remove('open'));
  if (!isOpen) body.classList.add('open');
}

// ── Fixture Library tab ────────────────────────────────────────────────────────

function renderLibrary() {
  const fixtures = Object.values(S.fixtures);

  if (!fixtures.length) {
    setLibStatusEmpty();
    document.getElementById('lib-grid').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:48px 24px;gap:16px;text-align:center;color:var(--text-dim)">
        <div style="font-size:40px;opacity:0.3">📋</div>
        <div style="font-family:var(--head);font-size:16px;font-weight:700;color:var(--text)">No Fixture Data</div>
        <div style="font-size:12px;max-width:380px;line-height:1.6">
          Import your <b style="color:var(--amber)">Fixture Reference</b> file using the button above.
          The file should have columns: ID · Name · Spec · Q (L/min) · P min (kPa) · FU Public · FU Private · Conn Ø (mm) · Flush · Notes
        </div>
        <label style="cursor:pointer;margin-top:8px">
          <span class="btn primary" style="font-size:12px;padding:7px 18px">📂 Import Fixture Reference</span>
          <input type="file" accept=".xlsx" style="display:none" onchange="loadFixtureXlsx(event)">
        </label>
      </div>`;
    return;
  }

  setLibStatusLoaded(_libLoadedFilename || 'fixtures.xlsx');

  const mode = (S.settings && S.settings.mode) || 'public';

  const rows = fixtures.map(f => {
    const fuPub = f.units != null ? f.units : '—';
    const fuPrv = f.unitsPrivate != null ? f.unitsPrivate : fuPub;
    const fuActive = mode === 'private' ? fuPrv : fuPub;
    return `<tr class="lib-row" draggable="true"
                ondragstart="libDragStart(event,'${f.id}')" ondragend="libDragEnd(event)">
      <td style="color:var(--text-dim);font-family:var(--mono);font-size:9px;white-space:nowrap">${f.id}</td>
      <td style="font-weight:600;color:var(--text-bright);white-space:nowrap">${f.name}</td>
      <td style="text-align:right;font-family:var(--mono);color:${mode==='public'?'var(--amber)':'var(--text-dim)'}${mode==='public'?';font-weight:700':''}">${fuPub}</td>
      <td style="text-align:right;font-family:var(--mono);color:${mode==='private'?'var(--amber)':'var(--text-dim)'}${mode==='private'?';font-weight:700':''}">${fuPrv}</td>
      <td style="text-align:right;font-family:var(--mono)">${f.minPressure}</td>
      <td style="text-align:right;font-family:var(--mono)">${f.connDia}</td>
      <td style="text-align:right;font-family:var(--mono)">${f.flow}</td>
      <td style="color:var(--text-dim);font-size:10px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.notes || ''}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <div style="display:flex;align-items:center;gap:4px">
          <button class="qty-btn" onclick="libQtyDec('${f.id}')">−</button>
          <span id="lib-qty-${f.id}" style="font-family:var(--mono);font-size:11px;min-width:18px;text-align:center">1</span>
          <button class="qty-btn" onclick="libQtyInc('${f.id}')">＋</button>
          <button class="btn primary" style="font-size:9px;padding:2px 8px;margin-left:2px" onclick="libAddToNetwork('${f.id}')">Add ➔</button>
          <button class="btn" style="font-size:9px;padding:2px 6px" onclick="editFixture('${f.id}')">✏</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('lib-grid').innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:var(--body)">
      <thead>
        <tr style="border-bottom:2px solid var(--border)">
          <th style="text-align:left;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">ID</th>
          <th style="text-align:left;padding:5px 8px;color:var(--amber);font-family:var(--mono);font-size:9px;letter-spacing:1px">FIXTURE</th>
          <th style="text-align:right;padding:5px 8px;font-family:var(--mono);font-size:9px;letter-spacing:1px;color:${mode==='public'?'var(--amber)':'var(--text-dim)'}">FU 公共<br>Public</th>
          <th style="text-align:right;padding:5px 8px;font-family:var(--mono);font-size:9px;letter-spacing:1px;color:${mode==='private'?'var(--amber)':'var(--text-dim)'}">FU 私室<br>Private</th>
          <th style="text-align:right;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px;white-space:nowrap">P MIN<br>kPa</th>
          <th style="text-align:right;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">Ø<br>mm</th>
          <th style="text-align:right;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">Q<br>L/min</th>
          <th style="text-align:left;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">NOTES</th>
          <th style="padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">ADD TO NETWORK</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:10px;color:var(--text-dim);margin-top:8px;font-family:var(--mono)">
      * 注: 給湯栓併用の場合は FU × ¾ — toggle per fixture node in the Properties panel after placing.
      Active mode: <b style="color:var(--amber)">${mode === 'public' ? '公共 Public' : '私室 Private'}</b>
    </p>`;

  // Re-init qty counters
  Object.values(S.fixtures).forEach(f => { _libQty[f.id] = _libQty[f.id] || 1; });
}

// Per-fixture qty counters in the library panel
const _libQty = {};

function libQtyInc(fixId) {
  _libQty[fixId] = Math.min((_libQty[fixId] || 1) + 1, 99);
  const el = document.getElementById('lib-qty-' + fixId);
  if (el) el.textContent = _libQty[fixId];
}
function libQtyDec(fixId) {
  _libQty[fixId] = Math.max((_libQty[fixId] || 1) - 1, 1);
  const el = document.getElementById('lib-qty-' + fixId);
  if (el) el.textContent = _libQty[fixId];
}
function libAddToNetwork(fixId) {
  const f   = S.fixtures[fixId]; if (!f) return;
  const qty = _libQty[fixId] || 1;
  const svgEl = document.getElementById('svgc');
  const cx  = (svgEl.clientWidth  / 2 - vt.x) / vt.scale;
  const cy  = (svgEl.clientHeight / 2 - vt.y) / vt.scale;
  const label = f.name.replace(/\s*[（(—–-].*/,'').trim();
  let lastId = null;
  // Spread nodes in a small grid: up to 6 per row, 50px apart
  const cols = Math.min(qty, 6);
  for (let i = 0; i < qty; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const id  = uid();
    S.nodes[id] = { id, type:'fixture', label,
      x: cx - (cols - 1) * 25 + col * 50 + (Math.random() * 6 - 3),
      y: cy + row * 50 + (Math.random() * 6 - 3),
      elev:0, pressure:0, pump:false, pumpHead:0,
      fixtureType: fixId, fixtureQty: 1, hotWater: false };
    lastId = id;
  }
  selId = lastId;
  switchView('network');
  autoSizeAllEdges();
  render();
}

let libDragFixId = null;
function libDragStart(e, fixId) { libDragFixId = fixId; e.dataTransfer.setData('text/plain', fixId); }
function libDragEnd(e)          { libDragFixId = null; }
function canvasDragOver(e)      { e.preventDefault(); }

function canvasDrop(e) {
  e.preventDefault();
  const fixId  = e.dataTransfer.getData('text/plain') || libDragFixId;
  if (!fixId || !S.fixtures[fixId]) return;
  const svgEl  = document.getElementById('svgc');
  const rect   = svgEl.getBoundingClientRect();
  const cx     = (e.clientX - rect.left - vt.x) / vt.scale;
  const cy     = (e.clientY - rect.top  - vt.y) / vt.scale;
  const f      = S.fixtures[fixId];
  const id     = uid();
  const label  = f.name.replace(/\s*[（(—–-].*/,'').trim();
  S.nodes[id]  = { id, type:'fixture', label, x:cx, y:cy, elev:0, pressure:0,
                   pump:false, pumpHead:0, fixtureType:fixId,
                   fixtureQty: _libQty[fixId] || 1, hotWater: false };
  selId = id;
  autoSizeAllEdges();
  render();
}

// ── Pipe Materials tab ────────────────────────────────────────────────────────

function renderMaterials() {
  const mats = Object.values(S.materials);
  const rows = mats.map(m => {
    const pipe = PIPES[m.chartKey] || null;
    const sizes = pipe ? pipe.sizes.map(s => s.A).join(', ') : (Object.keys(PIPES).length === 0 ? '⚠ load reference' : '—');
    return `<tr class="lib-row">
      <td>
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${m.color};vertical-align:middle;margin-right:6px"></span>
        <b style="color:var(--text-bright)">${m.name}</b>
      </td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--amber)">${m.chartKey}</td>
      <td style="font-family:var(--mono);font-size:9px;color:var(--text-dim);white-space:nowrap">${pipe ? pipe.figNo : '—'}</td>
      <td style="font-family:var(--mono);font-size:10px;text-align:right">${pipe ? pipe.C : '—'}</td>
      <td style="font-family:var(--mono);font-size:9px;color:var(--text-dim)">${sizes}</td>
      <td>
        <button class="btn" style="font-size:9px;padding:1px 6px" onclick="editMat('${m.id}')">✏ Edit</button>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('mat-grid').innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:var(--body)">
      <thead>
        <tr style="border-bottom:1px solid var(--border)">
          <th style="text-align:left;padding:5px 8px;color:var(--amber);font-family:var(--mono);font-size:9px;letter-spacing:1px">MATERIAL</th>
          <th style="text-align:left;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">CHART KEY</th>
          <th style="text-align:left;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">FIGURE</th>
          <th style="text-align:right;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">C</th>
          <th style="text-align:left;padding:5px 8px;color:var(--text-dim);font-family:var(--mono);font-size:9px;letter-spacing:1px">AVAILABLE SIZES (mm)</th>
          <th style="padding:5px 8px"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── View switching ─────────────────────────────────────────────────────────────

function switchView(v) {
  // Network is always visible underneath; .fsv panels float over it
  ['reference','library','materials'].forEach(n => {
    const el = document.getElementById('view-' + n);
    if (el) el.classList.toggle('open', n === v);
  });
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ['network','reference','library','materials'][i] === v);
  });
  if (v === 'reference') renderReference();
  if (v === 'library')   renderLibrary();
  if (v === 'materials') renderMaterials();
}


