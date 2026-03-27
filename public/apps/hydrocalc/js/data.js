// =============================================================================
// data.js
// Static reference data: JIS flow curves (図7-1), pipe chart metadata,
// fitting name maps, and default pipe materials.
// This file contains NO functions — only constants. Safe to read-only.
// =============================================================================

// 図7-1 給水負荷単位線図 — [demand units, design flow Q in L/min]
const FLOW_VALVE = [   // Curve ① — flush-valve fixtures dominant
  [ 10,  30], [ 15,  40], [ 20,  52], [ 30,  70], [ 40,  88], [ 50, 105],
  [ 60, 121], [ 70, 136], [ 80, 150], [100, 178], [120, 204], [150, 240],
  [200, 295], [250, 345], [300, 392], [400, 480], [500, 562],
];
const FLOW_TANK = [    // Curve ② — flush-tank fixtures dominant
  [ 10,  22], [ 15,  28], [ 20,  36], [ 30,  48], [ 40,  60], [ 50,  70],
  [ 60,  80], [ 70,  89], [ 80,  98], [100, 114], [120, 130], [150, 152],
  [200, 187], [250, 217], [300, 245], [400, 298], [500, 347],
];



/* ═══════════════════════════════════════════════════════════════════════════════
   §1  PIPE CHARTS  — runtime-loaded from external pipe chart reference xlsx
   ──────────────────────────────────────────────────────────────────────────────
   PIPES is populated by loadPipeRefXlsx(). Same shape as original embedded data.
   ═══════════════════════════════════════════════════════════════════════════════ */

let PIPES = {};   // empty until reference file is loaded

const FITTING_NAMES = {
  elbow90:    '90° Elbow',
  elbow45:    '45° Elbow',
  bend90:     '90° Bend',
  tee_branch: 'Tee (branch)',
  tee_run:    'Tee (run)',
  gate:       'Gate Valve',
  globe:      'Globe Valve',
  angle:      'Angle Valve',
  check_sw:   'Check Valve (swing)',
  check_imp:  'Check Valve (absorb)',
  strainer:   'Y Strainer',
  socket:     'Socket',
};

// Fitting key mapping: xlsx column header → internal fittingKey
const EQ_COL_MAP = {
  'elbow_90':               'elbow90',  'elbow_90°':          'elbow90',
  'elbow90':                'elbow90',  'elbow_45':           'elbow45',
  'elbow_45°':              'elbow45',  'elbow45':            'elbow45',
  'bend_90':                'bend90',   'bend_90°':           'bend90',
  'tee_branch':             'tee_branch','tee_branch_90deg':  'tee_branch',
  'tee_straight':           'tee_run',  'tee_straight_90deg': 'tee_run',
  'tee_run':                'tee_run',  'tee_reducer_socket': 'tee_branch',
  'tee_and_reducer_socket': 'tee_branch',
  'gate_valve':             'gate',     'gate_valve*1':       'gate',
  'globe_valve':            'globe',    'globe_valve*2':      'globe',
  'angle_valve':            'angle',    'angle+check_swing':  'angle',
  'angle_valve_and_check_swing': 'angle',
  'check_valve_swing':      'check_sw', 'check_swing':        'check_sw',
  'check_valve_shock_absorb':'check_imp','check_shock':       'check_imp',
  'y_strainer':             'strainer', 'socket':             'socket',
};

const PIPE_SHEET_ORDER = ['sgpw','vpvc','copper','sgp','sus','hsgpw','poly'];
const PIPE_META = {
  sgpw:   { label:'硬質塩化ビニルライニング鋼管',       figNo:'図7-2', C:130, suffix:'A'  },
  vpvc:   { label:'硬質ポリ塩化ビニル管',               figNo:'図7-3', C:130, suffix:''   },
  copper: { label:'銅管',                                figNo:'図7-4', C:130, suffix:''   },
  sgp:    { label:'鋼管(SGP)',                            figNo:'図7-5', C:100, suffix:'A'  },
  sus:    { label:'ステンレス鋼管',                      figNo:'図7-6', C:140, suffix:'Su' },
  hsgpw:  { label:'耐熱性硬質塩化ビニルライニング鋼管',  figNo:'図7-7', C:130, suffix:'A'  },
  poly:   { label:'ポリエチレン管',                      figNo:'図7-8', C:215, suffix:''   },
};

function parsePipeRefWorkbook(wb) {
  const result = {};
  for (const key of PIPE_SHEET_ORDER) {
    const ws = wb.Sheets[key]; if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const meta = PIPE_META[key];

    // Section A: pipe sizes
    let sizeHdrIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i][0] && String(rows[i][0]).startsWith('A  PIPE')) { sizeHdrIdx = i + 1; break; }
    }
    const sizes = [];
    if (sizeHdrIdx >= 0) {
      for (let i = sizeHdrIdx + 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r[0] == null || /^[BC] /.test(String(r[0])) || String(r[0]).startsWith('Interp')) break;
        const dnRaw = String(r[0]).replace(/ *(A|Su)$/, '').trim();
        const dn = isNaN(dnRaw) ? dnRaw : Number(dnRaw);
        const id_mm = Number(r[1]);
        if (dn !== null && !isNaN(id_mm) && id_mm > 0) {
          const entry = { A: dn, id: id_mm };
          if (r[2] !== null && r[2] !== '—') { entry.x1 = Number(r[2]); entry.y1 = Number(r[3]); entry.x2 = Number(r[4]); entry.y2 = Number(r[5]); }
          sizes.push(entry);
        }
      }
    }

    // Section C: equivalent lengths
    let eqLen = null, eqHdrIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i][0] && String(rows[i][0]).startsWith('C  EQUIV')) { eqHdrIdx = i + 1; break; }
    }
    if (eqHdrIdx >= 0) {
      const colRow = rows[eqHdrIdx]; if (colRow) {
        const rawCols = [];
        for (let c = 0; c < colRow.length; c++) {
          if (colRow[c] != null) rawCols.push({ idx: c, name: String(colRow[c]) });
        }
        if (rawCols.length >= 2) {
          const colNames = rawCols.map(c => c.name), colIdxs = rawCols.map(c => c.idx);
          const fittingKeys = colNames.slice(1).map(c => EQ_COL_MAP[c.toLowerCase().replace(/\s+/g,'_')] || null);
          const eqRows = [];
          for (let i = eqHdrIdx + 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r || r[colIdxs[0]] == null || isNaN(Number(r[colIdxs[0]]))) break;
            const rowData = [Number(r[colIdxs[0]])];
            for (let c = 1; c < rawCols.length; c++) {
              if (fittingKeys[c-1] === null) continue;
              const v = r[colIdxs[c]];
              const numV = (v === null || v === '—' || v === '') ? null : parseFloat(String(v).replace(/\*/g,''));
              rowData.push(isNaN(numV) ? null : numV);
            }
            eqRows.push(rowData);
          }
          const dispCols = ['呼び径', ...fittingKeys.filter(k => k !== null).map(k => FITTING_NAMES[k] || k)];
          eqLen = { title: meta.figNo + ' 局部抵抗の相当長 [m]', cols: dispCols, rows: eqRows, fittingKeys: fittingKeys.filter(k => k !== null) };
        }
      }
    }
    if (sizes.length > 0) result[key] = { ...meta, sizes, eqLen };
  }
  return Object.keys(result).length > 0 ? result : null;
}

let _refLoadedFilename = null;

function applyPipeRef(pipesObj, filename) {
  Object.keys(PIPES).forEach(k => delete PIPES[k]);
  Object.assign(PIPES, pipesObj);
  _refLoadedFilename = filename;
  setRefStatusLoaded(filename);
  const badge = document.getElementById('ref-loaded-badge');
  if (badge) { badge.textContent = '✓ ' + filename + ' — ' + Object.keys(PIPES).length + ' pipe types'; badge.style.color = 'var(--green)'; }
  const mmChart = document.getElementById('mm-chart');
  if (mmChart) rebuildChartKeySelect(mmChart);
  autoSizeAllEdges();
  render();
  if (document.getElementById('view-reference').classList.contains('open')) renderReference();
}

function rebuildChartKeySelect(sel) {
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = Object.entries(PIPES).map(([k,p]) =>
    `<option value="${k}">${k} — ${p.label} C=${p.C} (${p.figNo})</option>`
  ).join('') + '<option value="custom">custom — Manual C value</option>';
  if (cur) sel.value = cur;
}

function loadPipeRefXlsx(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const pipes = parsePipeRefWorkbook(wb);
      if (!pipes) { alert('Could not parse pipe reference data. Check that you are loading the correct pipe chart reference file.'); return; }
      applyPipeRef(pipes, file.name);
    } catch (err) { alert('Error reading file: ' + err.message); }
  };
  reader.readAsArrayBuffer(file);
}

function setRefStatusLoaded(filename) {
  const el = document.getElementById('ref-status-bar'); if (!el) return;
  el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;
    background:rgba(76,175,125,0.1);border:1px solid rgba(76,175,125,0.4);border-radius:3px;padding:4px 10px;color:var(--green)">
    ✓ <b>${filename}</b> — ${Object.keys(PIPES).length} pipe types loaded (${Object.keys(PIPES).join(', ')})
    <label style="cursor:pointer;margin-left:8px">
      <span class="btn" style="font-size:9px;padding:1px 8px">↺ Re-load</span>
      <input type="file" accept=".xlsx" style="display:none" onchange="loadPipeRefXlsx(event)">
    </label></span>`;
}

function setRefStatusEmpty() {
  const el = document.getElementById('ref-status-bar'); if (!el) return;
  el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;
    background:rgba(240,165,0,0.08);border:1px solid rgba(240,165,0,0.3);border-radius:3px;padding:4px 10px;color:var(--amber)">
    ⚠ No pipe reference loaded — use the button above to load a pipe chart reference file</span>`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   §2  FIXTURE LIBRARY  — loaded from external xlsx at startup
   ─────────────────────────────────────────────────────────────────────────────
   Source: Fixture reference file (表2-2 各種衛生器具・水栓の特徴)
   The app reads the xlsx via SheetJS and maps each row into S.fixtures[id].

   Expected xlsx columns (row 1 = header, row 2+ = data):
     Col A: id           — unique machine key  (e.g. "wc_valve")
     Col B: Fixture name — 器具名
     Col C: Spec         — 水栓・仕様
     Col D: Max Flow     — 瞬時最大流量 [L/min]  → stored as .flow
     Col E: Min Pres.    — 最小必要圧力 [kPa]    → stored as .minPressure
     Col F: FU Public    — 器具給水負荷単位 (公共) → stored as .units
     Col G: FU Private   — 器具給水負荷単位 (私室) → stored as .unitsPrivate
     Col H: Conn Dia     — 接続管口径 [mm]        → stored as .connDia
     Col I: Flush Type   — "valve" | "tank" | "none" → stored as .flush
     Col J: Notes        — 備考
   ═══════════════════════════════════════════════════════════════════════════════ */

// Fixture data lives in S.fixtures, populated by loadFixturesFromXlsx() at init.
// Fixture data lives entirely in S.fixtures, populated by loadFixtureXlsx().
// No hardcoded fallback — the app starts empty and requires the xlsx import.

// ── xlsx fixture loader (uses SheetJS) ────────────────────────────────────────

function parseFixturesFromWorkbook(wb) {
  // Accept both Japanese sheet name and generic first sheet
  const ws = wb.Sheets['表2-2 Fixtures'] || wb.Sheets[wb.SheetNames[0]];
  if (!ws) return null;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const fixtures = {};
  let loaded = 0;
  for (let i = 1; i < rows.length; i++) {        // skip header row
    const r = rows[i];
    const id = r[0] ? String(r[0]).trim() : null;
    if (!id || id.startsWith('注') || id === '') continue;
    const name = [r[1], r[2]].filter(Boolean).join(' — ');
    fixtures[id] = {
      id,
      name,
      flow:         Number(r[3])  || 10,
      minPressure:  Number(r[4])  || 30,
      units:        Number(r[5])  || 1,
      unitsPrivate: r[6] != null ? Number(r[6]) : undefined,
      connDia:      Number(r[7])  || 13,
      flush:        r[8] ? String(r[8]).trim() : 'none',
      notes:        r[9] ? String(r[9]).trim() : '',
    };
    loaded++;
  }
  return loaded > 0 ? fixtures : null;
}

// Tracks the name of the last loaded fixture xlsx for display
let _libLoadedFilename = null;

function applyFixtures(fixturesObj, source) {
  S.fixtures = fixturesObj;
  _libLoadedFilename = source;
  renderLibrary();
  // Re-populate fixture dropdowns in open modals
  const ftSel = document.getElementById('mn-ftype');
  if (ftSel) ftSel.innerHTML = Object.values(S.fixtures)
    .map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  setLibStatusLoaded(source);
  autoSizeAllEdges();
  render();
}

// Called when user picks a file via the library import button
function loadFixtureXlsx(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = new Uint8Array(e.target.result);
      const wb   = XLSX.read(data, { type: 'array' });
      const fix  = parseFixturesFromWorkbook(wb);
      if (!fix) { alert('Could not parse fixture data. Check column layout (ID, Name, Spec, Q, P, FU-pub, FU-prv, Ø, Flush, Notes).'); return; }
      applyFixtures(fix, file.name);
    } catch (err) {
      alert('Error reading xlsx: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── Library status bar (inside Fixture Library tab) ──────────────────────────

function setLibStatusLoaded(filename) {
  const el = document.getElementById('lib-status-bar');
  if (!el) return;
  el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;
    background:rgba(76,175,125,0.1);border:1px solid rgba(76,175,125,0.4);border-radius:3px;padding:4px 10px;color:var(--green)">
    ✓ <b>${filename}</b> — ${Object.keys(S.fixtures).length} fixtures loaded
    <label style="cursor:pointer;margin-left:8px">
      <span class="btn" style="font-size:9px;padding:1px 8px">↺ Re-import</span>
      <input type="file" accept=".xlsx" style="display:none" onchange="loadFixtureXlsx(event)">
    </label>
  </span>`;
}

function setLibStatusEmpty() {
  const el = document.getElementById('lib-status-bar');
  if (!el) return;
  el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;
    background:rgba(240,165,0,0.08);border:1px solid rgba(240,165,0,0.3);border-radius:3px;padding:4px 10px;color:var(--amber)">
    ⚠ No fixture data loaded — click <b>Import Fixture Reference</b> above to begin
  </span>`;
}


/* ═══════════════════════════════════════════════════════════════════════════════
   §3  PIPE MATERIALS
   ──────────────────
   Maps UI material selections to a PIPES chart key and a display colour.
   chartKey must match a key in PIPES above.
   ═══════════════════════════════════════════════════════════════════════════════ */

const DEF_MATERIALS = [
  { id:'m_sgpw',   name:'SGP VL-lined (硬質塩ビライニング鋼管)', chartKey:'sgpw',   color:'#4d9de0' },
  { id:'m_vpvc',   name:'HPVC (硬質ポリ塩化ビニル管)',           chartKey:'vpvc',   color:'#b0c4c4' },
  { id:'m_copper', name:'Copper (銅管)',                          chartKey:'copper', color:'#c47f00' },
  { id:'m_sgp',    name:'SGP Steel (鋼管 C=100)',                 chartKey:'sgp',    color:'#888888' },
  { id:'m_sus',    name:'Stainless (ステンレス鋼管)',             chartKey:'sus',    color:'#aac4e0' },
  { id:'m_hsgpw',  name:'Heat-resist VL Steel (耐熱性)',          chartKey:'hsgpw',  color:'#e07070' },
  { id:'m_poly',   name:'Polyethylene (ポリエチレン管)',          chartKey:'poly',   color:'#78c878' },
];


