// =============================================================================
// state.js
// Application state (S) — the single source of truth for an open project.
// Also contains uid(), addNode(), addEdge() factory helpers.
//
// S.nodes     { id → { id, type, label, x, y, elev, pressure, pump,
//                       pumpHead, fixtureType, fixtureQty, hotWater } }
// S.edges     { id → { id, from, to, material, diameter, length, fittings } }
// S.fixtures  { id → fixture type definition }
// S.materials { id → material definition }
// =============================================================================

/* ═══════════════════════════════════════════════════════════════════════════════
   §4  APP STATE
   ─────────────
   S is the single source of truth for the open project.
   All rendering reads from S; all edits write to S then call render() or
   autoSizeAllEdges() → render().

   S.nodes     keyed by id  →  { id, type, label, x, y, elev, pressure,
                                  pump, pumpHead, fixtureType, fixtureQty }
                               type = 'source' | 'branch' | 'fixture'

   S.edges     keyed by id  →  { id, from, to, material, diameter,
                                  length, fittings:{fittingKey:qty} }

   S.fixtures  keyed by id  →  fixture type definitions (loaded from DEF_FIXTURES)
   S.materials keyed by id  →  material definitions    (loaded from DEF_MATERIALS)
   S.nextId                 →  auto-increment counter for uid()
   ═══════════════════════════════════════════════════════════════════════════════ */

let S = {
  nodes:     {},
  edges:     {},
  fixtures:  {},
  materials: {},
  nextId:    1,
  settings: {
    mode: 'public',   // 'public' | 'private' — selects FU column from 表2-2
    autoSize: true,
  },
};

// Canvas viewport transform: pan (x,y) + zoom (scale)
let vt = { x: 80, y: 80, scale: 1 };

// Current tool: 'select' | 'connect'
let tool = 'select';

// Currently selected node or edge id (null = nothing selected)
let selId = null;

// Drag state and connect-tool state (managed in §9)
let dragSt = null, connStart = null, isPan = false, panSt = null;

// Returns a unique id string for new nodes/edges
function uid() { return 'n' + (S.nextId++); }

// Create a node, add it to S, return its id
function addNode(type, label, x, y, elev, pressure, pump, pumpHead, fixtureType, fixtureQty, hotWater) {
  const id = uid();
  S.nodes[id] = {
    id, type, label, x, y,
    elev:        elev        || 0,
    pressure:    pressure    || 300,
    pump:        pump        || false,
    pumpHead:    pumpHead    || 0,
    fixtureType: fixtureType || 'washbasin',
    fixtureQty:  fixtureQty  || 1,
    hotWater:    hotWater    || false,  // 給湯栓併用 — FU × 3/4
  };
  return id;
}

// Create a pipe edge, add it to S, return its id
function addEdge(from, to, mat, dia, len) {
  const id = uid();
  S.edges[id] = { id, from, to, material: mat, diameter: dia || 25, length: len || 5, fittings: {} };
  return id;
}


