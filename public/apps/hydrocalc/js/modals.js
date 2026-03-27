// =============================================================================
// modals.js
// Modal dialogs: Add Node, Add/Edit Fixture Type, Add/Edit Pipe Material.
// Also contains quickAddBranch() for the canvas toolbar shortcut.
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
  §10  MODALS
   ──────────
   Add Node, Add/Edit Fixture Type, Add/Edit Pipe Material dialogs.
   ═══════════════════════════════════════════════════════════════════════════════ */

let _addNodeAt = null;
function closeModal(id) { document.getElementById(id).classList.remove('open'); _addNodeAt = null; }

let editFixId = null, editMatId = null;

function addNodePrompt() {
  const fo = Object.values(S.fixtures).map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  document.getElementById('mn-ftype').innerHTML = fo;
  document.getElementById('mn-type').value = 'fixture';
  onMTChange();
  document.getElementById('m-add').classList.add('open');
}

function onMTChange() {
  const t = document.getElementById('mn-type').value;
  document.getElementById('mn-fix-w').style.display  = t === 'fixture' ? '' : 'none';
  document.getElementById('mn-pres-w').style.display  = t === 'source'  ? '' : 'none';
}

function quickAddBranch() {
  const svgEl = document.getElementById('svgc');
  const cx = (svgEl.clientWidth  / 2 - vt.x) / vt.scale + Math.random() * 40 - 20;
  const cy = (svgEl.clientHeight / 2 - vt.y) / vt.scale + Math.random() * 40 - 20;
  quickAddBranchAt(cx, cy);
}

function quickAddBranchAt(x, y) {
  const n = Object.values(S.nodes).filter(n => n.type === 'branch').length;
  const label = 'Junction ' + (n + 1);
  const id = addNode('branch', label, x, y, 0, 0, false, 0);
  selId = id;
  autoSizeAllEdges();
  render();
  // Scroll tree to the new node
  setTimeout(() => {
    const el = document.querySelector('.tn[data-nid="' + id + '"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, 40);
}

function confirmAddNode() {
  const t     = document.getElementById('mn-type').value;
  const label = document.getElementById('mn-lbl').value || (t === 'source' ? 'Source' : t === 'branch' ? 'Junction' : 'Fixture');
  const svgEl = document.getElementById('svgc');
  let x, y;
  if (_addNodeAt) {
    x = _addNodeAt.x + Math.random() * 10 - 5;
    y = _addNodeAt.y + Math.random() * 10 - 5;
    _addNodeAt = null;
  } else {
    x = (svgEl.clientWidth  / 2 - vt.x) / vt.scale + Math.random() * 60 - 30;
    y = (svgEl.clientHeight / 2 - vt.y) / vt.scale + Math.random() * 60 - 30;
  }
  const id    = addNode(t, label, x, y,
    +document.getElementById('mn-z').value || 0,
    +document.getElementById('mn-pres').value || 300,
    false, 0,
    document.getElementById('mn-ftype').value, 1);
  selId = id; closeModal('m-add'); autoSizeAllEdges(); render();
}

function addFixturePrompt() {
  editFixId = null;
  document.getElementById('mfix-title').textContent = 'Add Fixture Type';
  document.getElementById('mf-name').value      = '';
  document.getElementById('mf-units').value     = '2';
  document.getElementById('mf-units-prv').value = '';
  document.getElementById('mf-pres').value      = '30';
  document.getElementById('mf-conn').value      = '13';
  document.getElementById('mf-flow').value      = '10';
  document.getElementById('mf-notes').value     = '';
  document.getElementById('m-fix').classList.add('open');
}

function editFixture(id) {
  const f = S.fixtures[id];
  editFixId = id;
  document.getElementById('mfix-title').textContent    = 'Edit: ' + f.name;
  document.getElementById('mf-name').value             = f.name;
  document.getElementById('mf-units').value            = f.units;
  document.getElementById('mf-units-prv').value        = f.unitsPrivate != null ? f.unitsPrivate : '';
  document.getElementById('mf-pres').value             = f.minPressure;
  document.getElementById('mf-conn').value             = f.connDia;
  document.getElementById('mf-flow').value             = f.flow;
  document.getElementById('mf-notes').value            = f.notes || '';
  document.getElementById('m-fix').classList.add('open');
}

function confirmFixture() {
  const id  = editFixId || 'fix_' + Date.now();
  const prvRaw = document.getElementById('mf-units-prv').value;
  S.fixtures[id] = {
    id,
    name:         document.getElementById('mf-name').value  || 'Custom',
    units:        +document.getElementById('mf-units').value || 1,
    unitsPrivate: prvRaw !== '' ? +prvRaw : undefined,
    minPressure:  +document.getElementById('mf-pres').value  || 30,
    connDia:      +document.getElementById('mf-conn').value  || 13,
    flush:        S.fixtures[id]?.flush || 'none',  // preserve existing flush from xlsx
    flow:         +document.getElementById('mf-flow').value  || 10,
    notes:        document.getElementById('mf-notes').value,
  };
  closeModal('m-fix');
  render();
  renderLibrary();
}

function addMatPrompt() {
  editMatId = null;
  document.getElementById('mmat-title').textContent = 'Add Pipe Material';
  document.getElementById('mm-name').value  = '';
  document.getElementById('mm-color').value = '#4d9de0';
  if (Object.keys(PIPES).length > 0) rebuildChartKeySelect(document.getElementById('mm-chart'));
  document.getElementById('mm-chart').value = 'sgpw';
  document.getElementById('m-mat').classList.add('open');
}

function editMat(id) {
  const m = S.materials[id];
  editMatId = id;
  document.getElementById('mmat-title').textContent = 'Edit: ' + m.name;
  document.getElementById('mm-name').value  = m.name;
  document.getElementById('mm-chart').value = m.chartKey || 'sgpw';
  document.getElementById('mm-color').value = m.color;
  document.getElementById('m-mat').classList.add('open');
}

function confirmMat() {
  const id = editMatId || 'mat_' + Date.now();
  S.materials[id] = {
    id,
    name:     document.getElementById('mm-name').value  || 'Custom',
    chartKey: document.getElementById('mm-chart').value,
    color:    document.getElementById('mm-color').value,
  };
  closeModal('m-mat');
  render();
}


