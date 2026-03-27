// LocalGitRepo/server.js
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8081;

// Helper to run git commands
function execGit(cmd) {
    try {
        return execSync(`git --git-dir=".git" --work-tree=".." ${cmd}`, {
            cwd: __dirname,
            encoding: 'utf-8'
        });
    } catch (error) {
        return error.stderr || error.stdout || error.message;
    }
}

function generateTree(dir, prefix = '', isRoot = true) {
    let output = '';
    if (isRoot) output += path.basename(path.resolve(dir)) + '/\n';
    
    let items;
    try { items = fs.readdirSync(dir); } catch(e) { return output; }
    
    // Filter ignored
    items = items.filter(i => i !== '.git' && i !== 'node_modules' && i !== 'LocalGitRepo' && !i.endsWith('.exe'));
    
    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        output += prefix + (isLast ? '└── ' : '├── ') + item + '\n';
        if (stat.isDirectory()) {
            output += generateTree(fullPath, prefix + (isLast ? '    ' : '│   '), false);
        }
    });
    return output;
}

// Function to generate AI context
function getAIContext() {
    try {
        const rootDir = path.join(__dirname, '..');
        
        // 1. Structure
        let bgContext = "================ PROJECT STRUCTURE ================\n";
        bgContext += generateTree(rootDir) + "\n\n";

        // 2. AI Instructions
        const instructionsPath = path.join(rootDir, 'AI_Instructions.md');
        if (fs.existsSync(instructionsPath)) {
            bgContext += "================ AI MEMORY & INSTRUCTIONS ================\n";
            bgContext += fs.readFileSync(instructionsPath, 'utf8') + "\n\n";
        }

        // 3. Dependencies
        bgContext += "================ DEPENDENCIES ================\n";
        bgContext += "See HTML headers/Script tags in files below for web dependencies.\n";
        if (fs.existsSync(path.join(rootDir, 'package.json'))) {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
                if(pkg.dependencies) bgContext += "Dependencies: " + JSON.stringify(pkg.dependencies, null, 2) + "\n";
                if(pkg.devDependencies) bgContext += "Dev Dependencies: " + JSON.stringify(pkg.devDependencies, null, 2) + "\n";
            } catch(e) {}
        }
        bgContext += "\n";

        // 4. File Contents
        bgContext += "================ SOURCE CODE ================\n\n";
        const filesOutput = execSync(`git --git-dir=".git" --work-tree=".." ls-files`, { cwd: __dirname, encoding: 'utf-8' });
        const files = filesOutput.split('\n').filter(f => f.trim() !== '');
        
        for(let file of files) {
            const fullPath = path.join(rootDir, file);
            if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
                const ext = path.extname(fullPath).toLowerCase();
                // Skip binary formats
                if (!['.png', '.jpg', '.jpeg', '.gif', '.zip', '.pdf', '.xlsx', '.ico'].includes(ext)) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        bgContext += `\n--- file: ${file} ---\n\`\`\`${ext.replace('.', '')}\n${content}\n\`\`\`\n`;
                    } catch (e) {}
                }
            }
        }
        return bgContext;
    } catch (e) {
        return "Error getting context: " + e.message;
    }
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🛸 Local Git Studio v2.0</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { background-color: #0f111a; color: #a6accd; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f111a; }
        ::-webkit-scrollbar-thumb { background: #292d3e; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b405a; }
    </style>
</head>
<body class="min-h-screen p-8">
    <div class="max-w-7xl mx-auto">
        <header class="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
            <div>
                <h1 class="text-3xl font-bold text-white flex items-center gap-3">
                    <i data-lucide="git-branch" class="w-8 h-8 text-indigo-400"></i>
                    Local Git Studio
                </h1>
                <div class="flex items-center gap-2 mt-2 ml-11">
                    <span class="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-bold tracking-widest">Tracking</span>
                    <code class="text-gray-400 text-xs font-mono" id="projectPath">${path.resolve(__dirname, '..')}</code>
                </div>
            </div>
            <div class="flex gap-4">
                <button id="btnAiContext" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-indigo-500/20">
                    <i data-lucide="brain-circuit" class="w-5 h-5"></i> Generate AI Context
                </button>
                <button id="btnSave" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-emerald-500/20">
                    <i data-lucide="save" class="w-5 h-5"></i> Commit Changes
                </button>
                <button id="btnWipe" class="flex items-center gap-2 bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium border border-red-500/30 transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Reset Repo
                </button>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
                <!-- Time Machine -->
                <div class="bg-[#1a1d2d] rounded-xl p-6 shadow-xl border border-gray-800">
                    <h2 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <i data-lucide="history" class="w-5 h-5 text-indigo-400"></i>
                        Time Machine
                    </h2>
                    <div id="historyList" class="space-y-3 max-h-[600px] overflow-y-auto pr-2 flex flex-col items-center">
                        <i data-lucide="loader" class="w-8 h-8 animate-spin mb-3 text-gray-500 mt-10"></i>
                        <div class="text-gray-500 text-center">Loading commit history...</div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-6">
                <!-- Working Tree Status -->
                <div class="bg-[#1a1d2d] rounded-xl p-6 shadow-xl border border-gray-800">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                            <i data-lucide="file-code" class="w-5 h-5 text-emerald-400"></i>
                            Working Tree Status
                        </h2>
                        <button onclick="fetchStatus()" class="text-gray-400 hover:text-white transition" title="Refresh">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <pre id="statusDisplay" class="text-xs text-gray-300 bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono min-h-[150px] border border-gray-800/50 shadow-inner block">Checking status...</pre>
                </div>

                <!-- AI Persistent Notes -->
                <div class="bg-[#1a1d2d] rounded-xl p-6 shadow-xl border border-gray-800 flex flex-col h-[380px]">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                            <i data-lucide="book-open" class="w-5 h-5 text-yellow-400"></i>
                            AI Instructions
                        </h2>
                        <button onclick="saveNotes()" id="btnSaveNotes" class="text-xs bg-gray-800 hover:bg-yellow-600 hover:text-white text-gray-300 px-3 py-1.5 rounded transition flex items-center gap-1.5">
                            <i data-lucide="save" class="w-3 h-3"></i> Save
                        </button>
                    </div>
                    <p class="text-xs text-gray-400 mb-3">Stored in <code>AI_Instructions.md</code> in project root.</p>
                    <textarea id="aiNotesArea" class="flex-grow w-full bg-black/50 border border-gray-800/50 rounded-lg p-3 text-sm text-gray-300 font-mono shadow-inner focus:outline-none focus:border-yellow-500/50 transition-colors resize-none" placeholder="Write long-term context or instructions for AI agents here..."></textarea>
                </div>
            </div>
        </div>
    </div>

    <!-- AI Context Modal -->
    <div id="aiModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 hidden flex items-center justify-center p-8 opacity-0 transition-opacity duration-300">
        <div class="bg-[#1a1d2d] rounded-xl border border-gray-700 shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col transform scale-95 transition-transform duration-300" id="aiModalContent">
            <div class="flex justify-between items-center p-6 border-b border-gray-800">
                <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                    <i data-lucide="brain-circuit" class="w-6 h-6 text-indigo-400"></i>
                    AI Context Generator
                </h2>
                <div class="flex gap-3">
                    <button id="btnCopyContext" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-500/20">
                        <i data-lucide="copy" class="w-4 h-4"></i> Copy Context
                    </button>
                    <button onclick="closeAiModal()" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium transition">
                        <i data-lucide="x" class="w-4 h-4"></i> Close
                    </button>
                </div>
            </div>
            <div class="p-6 flex-grow flex flex-col min-h-0">
                <p class="text-gray-400 text-sm mb-4">Review the compiled AI Context below. It includes your project structure, dependencies, AI instructions, and tracked source code.</p>
                <textarea id="aiContextPreviewArea" class="flex-grow w-full bg-black/80 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 font-mono shadow-inner focus:outline-none focus:border-indigo-500/50 transition-colors resize-none whitespace-pre" readonly></textarea>
            </div>
        </div>
    </div>


    <!-- Notification Toast -->
    <div id="toast" class="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all transform translate-y-20 opacity-0 pointer-events-none z-50">
        <i id="toastIcon" data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
        <span id="toastMsg" class="font-medium"></span>
    </div>

    <script>
        lucide.createIcons();

        function showToast(msg, isError = false) {
            const t = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            try { document.getElementById('toastIcon').replaceWith(document.getElementById('toastIcon').cloneNode(true)); } catch(e){}
            const icon = document.getElementById('toastIcon') || document.querySelector('.lucide-check-circle') || document.querySelector('.lucide-alert-circle');
            if(icon) {
                icon.id = 'toastIcon';
                icon.setAttribute('data-lucide', isError ? 'alert-circle' : 'check-circle');
                icon.className = \`w-5 h-5 \${isError ? 'text-red-400' : 'text-emerald-400'}\`;
            }
            lucide.createIcons();
            
            t.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000);
        }

        async function fetchHistory() {
            try {
                const res = await fetch('/api/history');
                const data = await res.json();
                const list = document.getElementById('historyList');
                if(data.error) {
                    list.innerHTML = \`<div class="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-900/50 flex items-start gap-3 w-full"><i data-lucide="alert-triangle" class="w-5 h-5 shrink-0"></i><div><strong>Error:</strong><br>\${data.error}</div></div>\`;
                    lucide.createIcons();
                    return;
                }
                list.classList.remove('flex', 'flex-col', 'items-center');
                if(!data.commits || data.commits.length === 0) {
                    list.innerHTML = '<div class="text-gray-500 py-10 text-center bg-black/20 rounded-lg border border-gray-800/50 w-full">No commits found yet. Save a version to get started!</div>';
                    return;
                }
                
                list.innerHTML = data.commits.map((c, i) => \`
                    <div class="group bg-black/30 hover:bg-[#292d3e] p-4 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-all duration-200 flex items-center gap-4 cursor-default">
                        <div class="flex-shrink-0 w-12 h-12 rounded-full \${i===0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-gray-800 text-gray-400'} flex items-center justify-center font-mono text-xs font-bold shadow-inner">
                            \${c.hash.substring(0,6)}
                        </div>
                        <div class="flex-grow min-w-0">
                            <h3 class="text-gray-200 font-medium truncate group-hover:text-white transition-colors" title="\${c.subject}">\${c.subject}</h3>
                            <div class="text-xs text-gray-500 mt-1.5 flex items-center gap-4">
                                <span class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-gray-600"></i> \${c.date}</span>
                                <span class="flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-gray-600"></i> \${c.author}</span>
                                \${i === 0 ? '<span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 ml-auto font-semibold uppercase tracking-wider border border-indigo-500/30">Head</span>' : ''}
                            </div>
                        </div>
                        <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="checkout('\${c.hash}')" class="bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25">
                                <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Restore
                            </button>
                        </div>
                    </div>
                \`).join('');
                lucide.createIcons();
            } catch(e) {
                console.error(e);
            }
        }

        async function fetchStatus() {
            try {
                const res = await fetch('/api/status');
                const dt = await res.text();
                const display = document.getElementById('statusDisplay');
                if(!dt.trim()) {
                    display.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-emerald-500/70 py-6"><i data-lucide="check-circle" class="w-10 h-10 mb-2 opacity-50 block mx-auto"></i><span class="block text-sm">Working tree clean</span></div>';
                    lucide.createIcons();
                } else {
                    display.innerHTML = '';
                    display.textContent = dt;
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function fetchNotes() {
            try {
                const res = await fetch('/api/notes');
                const text = await res.text();
                document.getElementById('aiNotesArea').value = text;
            } catch(e) {}
        }

        async function saveNotes() {
            const btn = document.getElementById('btnSaveNotes');
            btn.innerHTML = '<i data-lucide="loader" class="w-3 h-3 animate-spin"></i> ...';
            lucide.createIcons();
            
            const text = document.getElementById('aiNotesArea').value;
            try {
                await fetch('/api/notes', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({text})
                });
                showToast('AI Instructions saved successfully!');
            } catch(e) {
                showToast('Failed to save instructions', true);
            }
            btn.innerHTML = '<i data-lucide="save" class="w-3 h-3"></i> Save';
            lucide.createIcons();
        }

        async function checkout(hash) {
            if(!confirm('🚨 WARNING: You are about to time travel!\\n\\nAre you sure you want to restore version [' + hash.substring(0,6) + ']?\\nUnsaved changes will be LOST.')) return;
            try {
                showToast('Restoring version...', false);
                await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({hash})
                });
                await fetchHistory();
                await fetchStatus();
                showToast('Successfully restored ' + hash.substring(0,6));
            } catch(e) {
                showToast('Restore failed', true);
            }
        }

        document.getElementById('btnSave').addEventListener('click', async () => {
            const msg = prompt('Enter a note for this version:');
            if(!msg) return;
            try {
                document.getElementById('btnSave').innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Saving...';
                const res = await fetch('/api/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({msg})
                });
                const data = await res.json();
                if(data.success) {
                    showToast('Version saved successfully!');
                    await fetchHistory();
                    await fetchStatus();
                } else {
                    showToast('Failed to save version', true);
                    alert(data.error);
                }
            } catch(e) {
                showToast('Error saving', true);
            } finally {
                document.getElementById('btnSave').innerHTML = '<i data-lucide="save" class="w-5 h-5"></i> Commit Changes';
                lucide.createIcons();
            }
        });

        // Modal Logic
        const modal = document.getElementById('aiModal');
        const modalContent = document.getElementById('aiModalContent');
        const previewArea = document.getElementById('aiContextPreviewArea');

        function openAiModal() {
            modal.classList.remove('hidden');
            // Trigger reflow
            void modal.offsetWidth;
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('scale-95');
        }

        function closeAiModal() {
            modal.classList.add('opacity-0');
            modalContent.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                previewArea.value = '';
            }, 300);
        }

        document.getElementById('btnAiContext').addEventListener('click', async () => {
            const btn = document.getElementById('btnAiContext');
            const ogHtml = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Generating...';
            lucide.createIcons();
            
            try {
                const res = await fetch('/api/context');
                if(res.ok) {
                    const text = await res.text();
                    previewArea.value = text;
                    openAiModal();
                } else {
                    throw new Error('Failed');
                }
            } catch(e) {
                showToast('Failed to generate context', true);
            }
            
            btn.innerHTML = ogHtml;
            lucide.createIcons();
        });

        document.getElementById('btnCopyContext').addEventListener('click', async () => {
            const btn = document.getElementById('btnCopyContext');
            const ogHtml = btn.innerHTML;
            
            try {
                await navigator.clipboard.writeText(previewArea.value);
                btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
                btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
                btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                showToast('Context copied to clipboard');
            } catch(e) {
                showToast('Failed to copy', true);
            }
            
            lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = ogHtml;
                btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
                btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                lucide.createIcons();
            }, 3000);
        });

        document.getElementById('btnWipe').addEventListener('click', async () => {
            if(!confirm('⚠️ DANGER ZONE ⚠️\\n\\nThis will PERMANENTLY DELETE all Git history in this repo and start a fresh history for the current folder.\\n\\nProceed only if you are starting a NEW project or want to wipe old data.')) return;
            const doubleCheck = prompt('Type "WIPE" to confirm:');
            if(doubleCheck !== 'WIPE') return;

            try {
                const res = await fetch('/api/wipe', { method: 'POST' });
                const data = await res.json();
                if(data.success) {
                    showToast('Repository Reset Successfully!');
                    location.reload();
                } else {
                    showToast('Reset failed', true);
                }
            } catch(e) {
                showToast('Error during reset', true);
            }
        });

        fetchHistory();
        fetchStatus();
        fetchNotes();
    </script>
</body>
</html>`;

// Initialize Git exclusions if needed
try {
    execGit('config core.excludesFile ".gitignore"');
} catch(e) {}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(HTML);
    } 
    else if (req.method === 'GET' && req.url === '/api/history') {
        const out = execGit('log -n 50 --pretty=format:"%H|%s|%ar|%an"');
        if(out.includes('fatal:')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: out }));
            return;
        }
        const commits = out.split('\n').filter(l => l.trim()).map(l => {
            const [hash, subject, date, author] = l.split('|');
            return { hash, subject, date, author };
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ commits }));
    }
    else if (req.method === 'GET' && req.url === '/api/status') {
        const out = execGit('status -s');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(out);
    }
    else if (req.method === 'GET' && req.url === '/api/notes') {
        try {
            const notes = fs.readFileSync(path.join(__dirname, '..', 'AI_Instructions.md'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(notes);
        } catch(e) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('');
        }
    }
    else if (req.method === 'POST' && req.url === '/api/notes') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { text } = JSON.parse(body);
                fs.writeFileSync(path.join(__dirname, '..', 'AI_Instructions.md'), text, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch(e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
    }
    else if (req.method === 'GET' && req.url === '/api/context') {
        const context = getAIContext();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(context);
    }
    else if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { msg } = JSON.parse(body);
                execGit('add -A');
                const cleanMsg = msg.replace(/"/g, '\\"');
                const out = execGit(`commit -m "${cleanMsg}"`);
                if(out.includes('fatal:') && !out.includes('nothing to commit')) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: out }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                }
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/api/checkout') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { hash } = JSON.parse(body);
            // using --force to discard uncommitted changes per default
            execGit('checkout --force ' + hash);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
    }
    else if (req.method === 'POST' && req.url === '/api/wipe') {
        try {
            const dotGit = path.join(__dirname, '.git');
            // Aggressive wipe and re-init
            execSync(`rmdir /s /q "${dotGit}"`, { shell: true });
            execGit('init');
            execGit('config core.worktree ".."');
            execGit('config user.email "adam@example.com"');
            execGit('config user.name "Adam"');
            execGit('add -A');
            execGit('commit -m "Fresh project start"');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Local Git Studio running at http://localhost:${PORT}/`);
});
