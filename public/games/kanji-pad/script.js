const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const candidatesList = document.getElementById('candidates-list');
const clearBtn = document.getElementById('clear-btn');
const tooltip = document.getElementById('tooltip');
const resultBar = document.getElementById('result-bar');
const copyBarBtn = document.getElementById('copy-bar-btn');
const clearResultBtn = document.getElementById('clear-result-btn');
const compoundDef = document.getElementById('compound-definition');
const romajiDef = document.getElementById('romaji-pronunciation');
const backspaceBtn = document.getElementById('backspace-btn');
const canvasHint = document.getElementById('canvas-hint');

let isDrawing = false;
let currentStroke = [[], []];
let allStrokes = [];
let recognitionTimeout = null;

// Initialize Canvas size
function initCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineWidth = 6; /* Thicker brush */
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111'; /* Darker ink */
}

window.addEventListener('resize', initCanvas);
initCanvas();

// Drawing logic
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseleave', endDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
}, { passive: false });
canvas.addEventListener('touchend', endDrawing);

function startDrawing(e) {
    isDrawing = true;
    canvasHint.style.opacity = '0';
    clearTimeout(recognitionTimeout);
    
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    currentStroke = [[x], [y], [Date.now()]];
}

function draw(e) {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    currentStroke[0].push(x);
    currentStroke[1].push(y);
    currentStroke[2].push(Date.now());
}

function endDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    allStrokes.push(currentStroke);
    
    // Trigger recognition after 800ms of inactivity
    recognitionTimeout = setTimeout(recognizeKanji, 800);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    candidatesList.innerHTML = '<div class="empty-state">Start drawing to see results</div>';
    canvasHint.style.opacity = '1';
});

// Handwriting Recognition API
async function recognizeKanji() {
    if (allStrokes.length === 0) return;

    const url = 'https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8';
    
    const requestBody = {
        options: "enable_pre_space",
        requests: [{
            writing_guide: {
                writing_area_width: canvas.width,
                writing_area_height: canvas.height
            },
            ink: allStrokes.map(s => [s[0], s[1]]),
            language: "ja"
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        if (data[0] === 'SUCCESS') {
            const candidates = data[1][0][1];
            renderCandidates(candidates);
        }
    } catch (error) {
        console.error('Recognition error:', error);
    }
}

function renderCandidates(candidates) {
    candidatesList.innerHTML = '';
    candidates.forEach(char => {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.textContent = char;
        
        card.addEventListener('mouseenter', (e) => showTooltip(e, char));
        card.addEventListener('mouseleave', hideTooltip);
        card.addEventListener('click', () => selectKanji(char));
        
        candidatesList.appendChild(card);
    });
}

// Dictionary Logic
const cache = new Map();

async function showTooltip(e, char) {
    tooltip.style.left = `${e.clientX + 15}px`;
    tooltip.style.top = `${e.clientY + 15}px`;
    tooltip.classList.remove('hidden');
    
    tooltip.querySelector('.tooltip-kanji').textContent = char;
    tooltip.querySelector('.tooltip-meaning').textContent = 'Loading...';
    tooltip.querySelector('.tooltip-reading').textContent = '';

    let data;
    if (cache.has(char)) {
        data = cache.get(char);
    } else {
        try {
            const resp = await fetch(`https://kanjiapi.dev/v1/kanji/${char}`);
            if (resp.ok) {
                const entry = await resp.json();
                data = {
                    meaning: entry.meanings.slice(0, 3).join(', '),
                    reading: [...entry.on_readings, ...entry.kun_readings].slice(0, 2).join(', ')
                };
                cache.set(char, data);
            } else {
                // If not a kanji (e.g. hiragana), fallback or skip
                data = { meaning: 'No kanji data', reading: '' };
            }
        } catch (err) {
            data = { meaning: 'Offline/Error', reading: '' };
        }
    }

    if (data) {
        tooltip.querySelector('.tooltip-meaning').textContent = data.meaning;
        tooltip.querySelector('.tooltip-reading').textContent = data.reading;
    }
}

function hideTooltip() {
    tooltip.classList.add('hidden');
}

function selectKanji(char) {
    insertAtCursor(resultBar, char);
    updateCompoundDefinition();
    
    // Copy the individual char to clipboard for convenience
    navigator.clipboard.writeText(char);
    
    // Clear canvas and reset focus
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    canvasHint.style.opacity = '1';
    resultBar.focus();
}

function insertAtCursor(myField, myValue) {
    // IE support
    if (document.selection) {
        myField.focus();
        const sel = document.selection.createRange();
        sel.text = myValue;
    }
    // MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart === '0') {
        const startPos = myField.selectionStart;
        const endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
    }
}

function deleteAtCursor(myField) {
    if (myField.selectionStart || myField.selectionStart === '0') {
        const startPos = myField.selectionStart;
        const endPos = myField.selectionEnd;
        
        // If there's a selection, delete it
        if (startPos !== endPos) {
            myField.value = myField.value.substring(0, startPos) + myField.value.substring(endPos);
            myField.selectionStart = myField.selectionEnd = startPos;
        } 
        // Otherwise delete the character BEFORE the cursor
        else if (startPos > 0) {
            myField.value = myField.value.substring(0, startPos - 1) + myField.value.substring(endPos);
            myField.selectionStart = myField.selectionEnd = startPos - 1;
        }
    } else {
        myField.value = myField.value.slice(0, -1);
    }
    myField.focus();
}

clearResultBtn.addEventListener('click', () => {
    resultBar.value = '';
    compoundDef.textContent = '...';
    romajiDef.textContent = '';
    resultBar.focus();
});

backspaceBtn.addEventListener('click', () => {
    deleteAtCursor(resultBar);
    updateCompoundDefinition();
});

resultBar.addEventListener('input', updateCompoundDefinition);

async function updateCompoundDefinition() {
    const word = resultBar.value.trim();
    if (!word) {
        compoundDef.textContent = '...';
        return;
    }

    compoundDef.textContent = 'Translating...';
    romajiDef.textContent = '';

    try {
        // Using Google Translate 'gtx' endpoint with dt=rm for transliteration
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&dt=rm&q=${encodeURIComponent(word)}`;
        const resp = await fetch(url);
        if (resp.ok) {
            const data = await resp.json();
            
            // 1. Get English Translation
            const translation = data[0].map(item => item[0]).filter(i => i).join('');
            compoundDef.textContent = translation || 'No definition found.';
            
            // 2. Get Romaji Transliteration (usually in index 1 of the responses)
            // The structure is roughly [ [ [trans, orig, translit, ...] ], null, "ja", ... ]
            // But sometimes it's in a separate element if dt=rm is used.
            let romaji = "";
            if (data[0] && data[0][1] && data[0][1][3]) {
                romaji = data[0][1][3]; // Transliteration is often here
            } else if (data[0] && data[0][0] && data[0][0][3]) {
                romaji = data[0][0][3];
            }
            
            romajiDef.textContent = romaji || "";
        } else {
            compoundDef.textContent = 'Definition service error.';
        }
    } catch (err) {
        console.error('Compound lookup error:', err);
        compoundDef.textContent = 'Definition service unavailable.';
    }
}

copyBarBtn.addEventListener('click', () => {
    if (resultBar.value) {
        navigator.clipboard.writeText(resultBar.value);
        const originalText = copyBarBtn.textContent;
        copyBarBtn.textContent = '✅ Copied!';
        setTimeout(() => copyBarBtn.textContent = originalText, 2000);
    }
});
