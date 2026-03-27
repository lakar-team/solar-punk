# HydroCalc v2 — JIS Pipe Sizing System

A browser-based water supply pipe sizing calculator following JIS standards (給排水衛生設備).  
No build step required — pure HTML, CSS, and vanilla JavaScript.

## Live demo

Deploy via GitHub Pages: **Settings → Pages → Deploy from branch → `main` / `/ (root)`**  
Your app will be live at `https://<your-username>.github.io/hydrocalc/`

---

## Project structure

```
hydrocalc/
├── index.html          ← HTML skeleton + <link> and <script> tags only
│
├── css/
│   ├── base.css        ← CSS variables (colours, fonts), reset, scrollbar
│   ├── layout.css      ← App shell grid, topbar, sidebar, panels, statusbar
│   ├── components.css  ← Buttons, inputs, modals, tooltips, library rows
│   └── canvas.css      ← Network canvas, system tree, ledger table, reference tables
│
├── js/
│   ├── data.js         ← Static constants: JIS flow curves, pipe metadata, materials
│   ├── state.js        ← App state (S), uid(), addNode(), addEdge()
│   ├── hydraulics.js   ← Pure math: Hazen-Williams, velocity, fitting equiv-lengths
│   ├── engine.js       ← Graph traversal, demand summation, auto-sizer
│   ├── render.js       ← All DOM/SVG rendering (no calculations here)
│   ├── ui.js           ← Selection, drag, pan, connect tool, zoom, context menu
│   ├── modals.js       ← Add Node / Fixture / Material dialogs
│   ├── fileio.js       ← Save/Load JSON, Export CSV, xlsx loaders
│   └── init.js         ← App startup and demo network
│
└── README.md
```

---

## Which file to edit for common tasks

| Task | File(s) |
|---|---|
| Change colours / fonts / spacing | `css/base.css` |
| Redesign the layout (panel sizes, grid) | `css/layout.css` |
| Restyle buttons, modals, inputs | `css/components.css` |
| Restyle the network canvas or tree | `css/canvas.css` |
| Change the HTML structure | `index.html` |
| Add a new modal or dialog | `js/modals.js` |
| Add a new UI interaction | `js/ui.js` |
| Fix or extend hydraulic calculations | `js/hydraulics.js` |
| Change graph traversal or auto-sizing | `js/engine.js` |
| Change how things render on screen | `js/render.js` |
| Change the demo network on startup | `js/init.js` |
| Add/change static reference data | `js/data.js` |

---

## Running locally

Because the app uses multiple files loaded via `<script src="...">`, you need a local
web server (browsers block file:// multi-file loads by default).

**Quickest option — Python:**
```bash
cd hydrocalc
python3 -m http.server 8080
# then open http://localhost:8080
```

**VS Code:** Install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

**Node:**
```bash
npx serve .
```

---

## External data files

The app loads two optional xlsx reference files at runtime:

| File | Purpose | Load via |
|---|---|---|
| Pipe chart reference | JIS pipe sizes & equiv. lengths (図7-2~7-8) | Reference Materials tab |
| Fixture reference | 表2-2 fixture demand data | Fixture Library tab |

These files are **not** bundled — they are loaded by the user each session via the file
picker buttons. This keeps the app lightweight and the reference data independently editable.

---

## JS load order

Scripts must load in this order (each depends on the ones above it):

```
data.js       — constants only, no dependencies
state.js      — S object, factory helpers
hydraulics.js — pure math (reads PIPES from data.js via state)
engine.js     — graph engine (uses state + hydraulics)
render.js     — DOM rendering (uses state + engine)
ui.js         — interactions (uses state + engine + render)
modals.js     — dialogs (uses state + render + ui)
fileio.js     — I/O (uses state + render)
init.js       — startup (calls everything)
```

---

## Hydraulic method

- **Flow curve:** JIS 図7-1 給水負荷単位同時使用流量線図 (two curves: flush-valve and flush-tank)
- **Friction loss:** Hazen-Williams `Q = 4.87 · C · d²·⁶³ · i⁰·⁵⁴ × 10³`
- **Fitting losses:** Equivalent lengths from JIS 表7-4~7-9 (loaded from pipe reference file)
- **Velocity limit:** 2.0 m/s maximum (JIS)
