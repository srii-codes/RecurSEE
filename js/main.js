// ── RecurSEE Main Controller ──────────────────────────────────────────────

let currentAlgo = 'karatsuba';
let currentPage = 'intro';

const PAGES_FOR_MASTERCALC = ['mastercalc'];

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAlgoNav();
  initPageNav();
  initVizControls();
  initMasterCalc();
  loadAlgo('karatsuba');
  showPage('intro');
});

// ── Algorithm switching ───────────────────────────────────────────────────
function initAlgoNav() {
  document.querySelectorAll('.algo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const algo = btn.dataset.algo;
      document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (algo === 'mastercalc') {
        showMasterCalcPage();
        return;
      }

      loadAlgo(algo);
      showPage('history');
    });
  });
}

function loadAlgo(algo) {
  currentAlgo = algo;
  vizState.currentAlgo = algo;

  const data = CONTENT[algo];
  if (!data) return;

  // Sidebar
  document.getElementById('sidebarInfo').textContent = data.info;
  const complexityEl = document.getElementById('sidebarComplexity');
  
  const tags = data.complexityTags || [];
  let html = '';
  
  tags.forEach((t, i) => {
    let label = '';
    if (i === 0) {
      label = 'Recurrence:';
    } else if (i === 1) {
      label = 'Time Complexity:';
    } else if (i === 2) {
      label = 'Comparison:';
    } else if (i === 3) {
      label = 'Category:';
    }
    
    html += `<div class="complexity-item">
      <span class="complexity-label">${label}</span>
      <span class="complexity-value">${t}</span>
    </div>`;
  });
  
  complexityEl.innerHTML = html;


  // History
  document.getElementById('historyTitle').innerHTML = data.history.title;
  document.getElementById('historyBody').innerHTML = data.history.body;
  document.getElementById('historyQuote').textContent = data.history.quote;

  // Pseudocode
  document.getElementById('pseudoContent').textContent = data.pseudo;

  // Code
  loadCode(algo, 'python');

  // Complexity
  document.getElementById('complexityBody').innerHTML = data.complexity;

  // Viz subtitle and inputs
  setupVizInputs(algo);

  // Reset viz state
  vizState.steps = [];
  vizState.currentStep = -1;
  vizState.nodeMap = {};
  vizState.result = null;
  vizState.inputs = null;
  document.getElementById('treeCanvas').innerHTML = '';
  document.getElementById('stepDesc').innerHTML = 'Press <strong>Visualize</strong> to begin.';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('stepBadge').textContent = '0 / 0';
  document.getElementById('resultBox').classList.add('hidden');
  document.getElementById('quizBox').classList.add('hidden');
  document.getElementById('opMul').textContent = '0';
  document.getElementById('opAdd').textContent = '0';
  document.getElementById('syncCode').innerHTML = '';

  // Sync pseudocode panel
  const syncCode = document.getElementById('syncCode');
  const lines = CONTENT[algo].pseudoLines || [];
  syncCode.innerHTML = lines.map(l =>
    `<span class="sync-line">${escapeHtml(l)}</span>`
  ).join('\n');

  // Theme class for selected algorithm
  document.body.classList.remove('algo-karatsuba', 'algo-maxsubarray', 'algo-strassen', 'algo-closestpair', 'algo-mastercalc');
  document.body.classList.add(`algo-${algo}`);

  // Legend
  setupLegend(algo);

  // Op counter classical
  updateClassicalOps(algo);

  // Page nav - show/hide algo-specific pages
  document.getElementById('pageNav').classList.remove('hidden');
  document.querySelectorAll('[data-page]').forEach(b => b.classList.remove('hidden'));
}

function showMasterCalcPage() {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-mastercalc').classList.remove('hidden');
  document.getElementById('pageNav').classList.add('hidden');
  document.getElementById('sidebarInfo').textContent = 'Enter a recurrence relation and see which Master Theorem case applies.';
  document.getElementById('sidebarComplexity').innerHTML = '';
}

// ── Page navigation ───────────────────────────────────────────────────────
function initPageNav() {
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // Tab switching (howto page)
  document.querySelectorAll('.tab-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });

  // Lang switching
  document.querySelectorAll('.lang-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadCode(currentAlgo, btn.dataset.lang);
    });
  });

  // Copy button
  document.getElementById('copyBtn').addEventListener('click', () => {
    const code = document.getElementById('codeContent').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = '⎘ Copy', 1500);
    });
  });
}

function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`page-${page}`)?.classList.remove('hidden');
  document.querySelectorAll('.nav-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
}

// ── Code loading ──────────────────────────────────────────────────────────
function loadCode(algo, lang) {
  const data = CONTENT[algo];
  if (!data || !data.code) return;
  const code = data.code[lang] || data.code.python || '';
  document.getElementById('codeContent').textContent = code;
}

// ── Viz inputs ────────────────────────────────────────────────────────────
function setupVizInputs(algo) {
  const row = document.getElementById('inputRow');
  const hint = document.getElementById('inputHint');
  row.innerHTML = '';

  if (algo === 'karatsuba') {
    hint.textContent = 'Keep inputs under 1000 for a readable tree.';
    row.innerHTML = `
      <label class="input-label">First number</label>
      <input type="number" class="input-field" id="inp1" value="201" min="0" max="999"/>
      <span style="font-size:20px;color:var(--text-muted)">×</span>
      <input type="number" class="input-field" id="inp2" value="345" min="0" max="999"/>
      <button class="viz-btn" id="vizBtn">Visualize</button>
    `;
    document.getElementById('vizBtn').addEventListener('click', runViz);

  } else if (algo === 'maxsubarray') {
    hint.textContent = 'Enter up to 16 integers (can be negative).';
    row.innerHTML = `
      <label class="input-label">Array</label>
      <input type="text" class="input-field" id="inp1" value="-2,1,-3,4,-1,2" style="width:260px"/>
      <button class="viz-btn" id="vizBtn">Visualize</button>
    `;
    document.getElementById('vizBtn').addEventListener('click', runViz);

  } else if (algo === 'strassen') {
    hint.textContent = 'Enter 4 values for each 2×2 matrix (row by row).';
    row.innerHTML = `
      <label class="input-label">Matrix A</label>
      <input type="text" class="input-field" id="inp1" value="1,2,3,4" style="width:150px"/>
      <label class="input-label">Matrix B</label>
      <input type="text" class="input-field" id="inp2" value="5,6,7,8" style="width:150px"/>
      <button class="viz-btn" id="vizBtn">Visualize</button>
    `;
    document.getElementById('vizBtn').addEventListener('click', runViz);

  } else if (algo === 'closestpair') {
    hint.textContent = 'Using a demo point set (up to 8 points).';
    row.innerHTML = `
      <label class="input-label">Points</label>
      <input type="text" class="input-field" id="inp1"
        value="(2,3),(12,30),(40,50),(5,1),(12,10),(3,4),(8,2),(15,20)"
        style="width:360px;font-size:12px"/>
      <button class="viz-btn" id="vizBtn">Visualize</button>
    `;
    document.getElementById('vizBtn').addEventListener('click', runViz);
  }

  updateClassicalOps(algo);
}

function runViz() {
  const algo = currentAlgo;
  let runResult;

  if (algo === 'karatsuba') {
    const x = parseInt(document.getElementById('inp1').value);
    const y = parseInt(document.getElementById('inp2').value);
    if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > 999 || y > 999) {
      shakeInput('inp1'); return;
    }
    vizState.inputs = [x, y];
    runResult = runKaratsuba(x, y);
    document.getElementById('opClassical').textContent = `${String(x).length * String(y).length * 4} muls`;

  } else if (algo === 'maxsubarray') {
    const raw = document.getElementById('inp1').value;
    const arr = raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (arr.length < 2 || arr.length > 16) { shakeInput('inp1'); return; }
    vizState.inputs = arr;
    runResult = runMaxSubarray(arr);
    document.getElementById('opClassical').textContent = `${arr.length * (arr.length - 1) / 2} comparisons`;

  } else if (algo === 'strassen') {
    const aStr = document.getElementById('inp1').value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const bStr = document.getElementById('inp2').value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (aStr.length !== 4 || bStr.length !== 4) { shakeInput('inp1'); return; }
    const A = [[aStr[0], aStr[1]], [aStr[2], aStr[3]]];
    const B = [[bStr[0], bStr[1]], [bStr[2], bStr[3]]];
    vizState.inputs = [A, B];
    runResult = runStrassen(A, B);
    document.getElementById('opClassical').textContent = `${Math.pow(2, 3)} muls`;

  } else if (algo === 'closestpair') {
    const raw = document.getElementById('inp1').value;
    const pts = [];
    const matches = raw.match(/\(([^)]+)\)/g);
    if (!matches || matches.length < 2) { shakeInput('inp1'); return; }
    matches.forEach(m => {
      const parts = m.replace(/[()]/g,'').split(',');
      if (parts.length === 2) pts.push({ x: parseFloat(parts[0]), y: parseFloat(parts[1]) });
    });
    vizState.inputs = pts;
    runResult = runClosestPair(pts);
    document.getElementById('opClassical').textContent = `${pts.length*(pts.length-1)/2} pairs`;
  }

  if (!runResult) return;

  vizState.steps = runResult.steps;
  vizState.nodeMap = runResult.nodeMap;
  vizState.result = runResult.result;
  vizState.currentStep = -1;

  // Render tree
  renderTree(vizState.nodeMap);

  // Step to first
  stepNext();
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('error');
  setTimeout(() => el.classList.remove('error'), 600);
}

function updateClassicalOps(algo) {
  const el = document.getElementById('opClassical');
  if (!el) return;
  el.textContent = '—';
}

// ── Legend ────────────────────────────────────────────────────────────────
function setupLegend(algo) {
  const legend = document.getElementById('treeLegend');
  const items = {
    karatsuba: [
      { label: 'Root', color: '#FFB347' },
      { label: 'z0 (b×d)', color: '#F2A7BB' },
      { label: 'z1 ((a+b)(c+d))', color: '#C9B8E8' },
      { label: 'z2 (a×c)', color: '#A8E6CF' },
      { label: 'Base case', color: '#A7C7E7' },
    ],
    maxsubarray: [
      { label: 'Root', color: '#FFB347' },
      { label: 'Split', color: '#A8E6CF' },
      { label: 'Base case', color: '#A7C7E7' },
    ],
    strassen: [
      { label: 'Root', color: '#FFB347' },
      { label: 'M1-M7', color: '#F2A7BB' },
      { label: 'Base', color: '#A7C7E7' },
    ],
    closestpair: [
      { label: 'Root', color: '#FFB347' },
      { label: 'Split', color: '#A8E6CF' },
      { label: 'Leaf', color: '#F2A7BB' },
    ]
  };

  const list = items[algo] || [];
  legend.innerHTML = list.map(item => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${item.color}"></div>
      <span>${item.label}</span>
    </div>
  `).join('');
}
