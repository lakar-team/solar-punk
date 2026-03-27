// =============================================================================
// fileio.js
// File I/O: save project as JSON, load project from JSON, export CSV.
// Also contains xlsx loaders for the pipe reference and fixture library files.
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
  §11  FILE I/O
   ─────────────
   ═══════════════════════════════════════════════════════════════════════════════ */

function saveProject() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'hydrocalc_project.json';
  a.click();
}

function loadFile() { document.getElementById('file-input').click(); }

function loadProject(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try { S = JSON.parse(ev.target.result); selId = null; render(); }
    catch { alert('Invalid file'); }
  };
  r.readAsText(f);
}

function exportCSV() {
  const res  = calcAllSegments();
  const hdrs = ['#','From','To','ChartKey','Diameter_mm','L_actual_m','L_fittings_equiv_m',
                'L_total_m','dZ_m','Load_Units','Q_Lpm','R_allow_kPam','R_actual_kPam',
                'Velocity_ms','Recommended_Dia','Status'];
  const rows = res.map((r, i) => [
    i+1, r.from, r.to, r.chartKey, r.dia, r.L_act, r.L_bend, r.L_tot,
    r.dZ, r.units, r.Q, r.R_allow, r.R_act, r.v, r.rec || '—', r.ok ? 'OK' : 'CHECK'
  ]);
  const csv  = [hdrs, ...rows].map(r => r.join(',')).join('\n');
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'pipe_sizing.csv';
  a.click();
}


