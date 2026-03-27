// =============================================================================
// init.js
// App initialisation: loads default materials, builds the demo network,
// runs the auto-sizer, and paints the initial UI.
// Called once at page load — edit the demo network here.
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
  §12  INIT
   ─────────
   Load default fixture types and materials into S, build a demo network,
   run the auto-sizer, and paint the initial UI.
   ═══════════════════════════════════════════════════════════════════════════════ */

async function init() {
  // 1. Try to load project from localStorage
  const restored = loadFromLocal();

  if (!restored) {
    // No saved project — build demo network
    S.fixtures = {};
    DEF_MATERIALS.forEach(m => { S.materials[m.id] = { ...m }; });

    const src = addNode('source',  'Water Main', 80,  160, 0,   300, false, 0);
    const b1  = addNode('branch',  'Riser A',    230,  80, 3,   0,   false, 0);
    const b2  = addNode('branch',  'Riser B',    230, 240, 0,   0,   false, 0);
    const f1  = addNode('fixture', 'WC-01',      370,  40, 3.5, 0,   false, 0, 'wc_valve',  1);
    const f2  = addNode('fixture', 'Washbasin',  370, 120, 3.5, 0,   false, 0, 'washbasin', 1);
    const f3  = addNode('fixture', 'Kitchen',    370, 240, 0,   0,   false, 0, 'kitchen',   1);
    const f4  = addNode('fixture', 'WH 7-16号', 370, 300, 0,   0,   false, 0, 'wh_m',      1);

    addEdge(src, b1,  'm_sgpw', 40, 8);
    addEdge(b1,  f1,  'm_sgpw', 25, 4);
    addEdge(b1,  f2,  'm_sgpw', 20, 3);
    addEdge(src, b2,  'm_sgpw', 40, 12);
    addEdge(b2,  f3,  'm_sgpw', 20, 5);
    addEdge(b2,  f4,  'm_sgpw', 20, 3);

    const eids = Object.keys(S.edges);
    if (S.edges[eids[0]]) S.edges[eids[0]].fittings = { elbow90: 2, tee_branch: 1 };
    if (S.edges[eids[1]]) S.edges[eids[1]].fittings = { elbow90: 1, elbow45:    1 };
  }

  // 2. Load reference materials (XLSX) if they exist in the folder
  await autoLoadReferences();

  autoSizeAllEdges();
  render();
  setTimeout(recalcFsvTop, 50);
}

window.addEventListener('resize', () => { renderCanvas(); recalcFsvTop(); });

function recalcFsvTop() {
  const topbar = document.getElementById('topbar');
  const top    = topbar ? topbar.offsetHeight : 48;
  document.querySelectorAll('.fsv').forEach(el => el.style.top = top + 'px');
}

init();

