// =============================================================================
// loader.js
// Automatic reference data ingestion and project persistence.
// =============================================================================

/**
 * Attempt to auto-load the two required XLSX reference files from the local directory.
 * Requires a local web server (Python, VS Code Live Server, etc.) to allow fetch().
 */
async function autoLoadReferences() {
  const refPairs = [
    { url: 'Reference Material/pipe_flow_reference.xlsx', type: 'pipe' },
    { url: 'Reference Material/fixtures_reference.xlsx',  type: 'fixture' }
  ];

  for (const { url, type } of refPairs) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Auto-loader: could not fetch ${url} (status: ${response.status})`);
        continue;
      }

      const buffer = await response.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const filename = url.split('/').pop();

      if (type === 'pipe') {
        const pipes = parsePipeRefWorkbook(wb);
        if (pipes) applyPipeRef(pipes, filename);
      } else if (type === 'fixture') {
        const fix = parseFixturesFromWorkbook(wb);
        if (fix) applyFixtures(fix, filename);
      }
      console.log(`Auto-loader: successfully ingested ${url}`);
    } catch (e) {
      console.warn(`Auto-loader: skipped ${url} (${e.message})`);
    }
  }
}

/**
 * Save current project state (S) to localStorage.
 */
function saveToLocal() {
  try {
    localStorage.setItem('hydrocalc_last_project', JSON.stringify(S));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

/**
 * Load project state from localStorage if it exists.
 */
function loadFromLocal() {
  try {
    const saved = localStorage.getItem('hydrocalc_last_project');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Basic validation: must have nodes and edges
      if (parsed.nodes && parsed.edges) {
        S = parsed;
        selId = null;
        console.log('Auto-loader: restored project from localStorage');
        return true;
      }
    }
  } catch (e) {
    console.warn('Failed to load from localStorage', e);
  }
  return false;
}

// Auto-save on any modification
window.addEventListener('beforeunload', saveToLocal);
// Periodically save every 30 seconds as a precaution
setInterval(saveToLocal, 30000);
