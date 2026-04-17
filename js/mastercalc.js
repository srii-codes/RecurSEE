// ── Master Method Calculator ──────────────────────────────────────────────

function initMasterCalc() {
  const btn = document.getElementById('masterCalcBtn');
  if (btn) btn.addEventListener('click', calculateMaster);
}

function calculateMaster() {
  const a = parseFloat(document.getElementById('masterA').value);
  const b = parseFloat(document.getElementById('masterB').value);
  const k = parseFloat(document.getElementById('masterK').value);

  if (isNaN(a) || isNaN(b) || isNaN(k) || a < 1 || b < 2 || k < 0) {
    alert('Please enter valid values: a ≥ 1, b ≥ 2, k ≥ 0');
    return;
  }

  const logBA = Math.log(a) / Math.log(b);
  const logBAStr = logBA % 1 === 0 ? logBA.toFixed(0) : logBA.toFixed(3);

  let caseNum, caseLabel, solution, explanation;

  if (k < logBA - 0.001) {
    // Case 1: f(n) = O(n^(log_b a - ε))
    caseNum = 1;
    caseLabel = `Case 1: f(n) = O(n^k) where k=${k} < log_${b}(${a}) ≈ ${logBAStr}`;
    solution = `T(n) = Θ(n^${logBAStr})`;
    explanation = `The recursion dominates. Since n^(log_b a) grows faster than f(n) = n^k, the work is dominated by the leaves of the recursion tree. Result: T(n) = Θ(n^log_${b}(${a})) ≈ Θ(n^${logBAStr}).`;
  } else if (k <= logBA + 0.001) {
    // Case 2: f(n) = Θ(n^(log_b a))
    caseNum = 2;
    caseLabel = `Case 2: f(n) = Θ(n^k) where k=${k} ≈ log_${b}(${a}) ≈ ${logBAStr}`;
    solution = `T(n) = Θ(n^${logBAStr} · log n)`;
    explanation = `The recursion and combine step contribute equally at each level. There are log_${b}(n) levels, each contributing Θ(n^k) work. Result: T(n) = Θ(n^${logBAStr} · log n).`;
  } else {
    // Case 3: f(n) = Ω(n^(log_b a + ε))
    caseNum = 3;
    caseLabel = `Case 3: f(n) = Ω(n^k) where k=${k} > log_${b}(${a}) ≈ ${logBAStr}`;
    solution = `T(n) = Θ(n^${k})`;
    explanation = `The combine step dominates. Since f(n) = n^k grows faster than n^(log_b a), the root level dominates all other levels. Result: T(n) = Θ(n^${k}).`;
  }

  // Show result
  const resultEl = document.getElementById('masterResult');
  resultEl.classList.remove('hidden');

  document.getElementById('masterRecurrence').textContent =
    `T(n) = ${a}T(n/${b}) + f(n),  where f(n) = n^${k}`;

  const caseEl = document.getElementById('masterCase');
  caseEl.textContent = caseLabel;
  caseEl.className = `master-case case${caseNum}`;

  document.getElementById('masterSolution').textContent = solution;
  document.getElementById('masterExplanation').textContent = explanation;

  // Draw recursion tree illustration
  drawMasterTree(a, b, k, logBA, caseNum);
}

function drawMasterTree(a, b, k, logBA, caseNum) {
  const container = document.getElementById('masterTree');
  container.innerHTML = '';

  const colors = { 1: '#A8E6CF', 2: '#A7C7E7', 3: '#F2A7BB' };
  const color = colors[caseNum];

  const levels = Math.min(Math.ceil(Math.log(16) / Math.log(b)), 4);
  let html = `<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Recursion Tree Structure</div>`;

  for (let lvl = 0; lvl <= levels; lvl++) {
    const nodes = Math.pow(a, lvl);
    const size = Math.pow(1/b, lvl);
    const work = Math.pow(size, k);
    const totalWork = nodes * work;
    const nodeCount = Math.min(nodes, 8);

    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">`;
    html += `<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);width:60px">Level ${lvl}</div>`;
    html += `<div style="display:flex;gap:4px;flex:1;align-items:center">`;

    for (let i = 0; i < nodeCount; i++) {
      const w = Math.max(16, Math.min(40, 36 / Math.pow(a, lvl * 0.5)));
      html += `<div style="width:${w}px;height:${w}px;border-radius:6px;background:${color};border:1.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:9px;font-family:var(--font-mono);color:var(--text)">n/${Math.pow(b,lvl).toFixed(0)}</div>`;
    }
    if (nodes > 8) html += `<span style="font-size:10px;color:var(--text-muted)">...+${nodes-8} more</span>`;

    html += `</div>`;
    html += `<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);width:80px;text-align:right">${nodes}×n^${k}/${Math.pow(b,lvl*k).toFixed(1)}</div>`;
    html += `</div>`;
  }

  html += `<div style="margin-top:12px;padding:10px;background:var(--cream2);border-radius:8px;font-size:12px;font-family:var(--font-mono);color:var(--text)">`;
  html += `log_${b}(a) = log_${b}(${a}) ≈ ${logBA.toFixed(3)} | k = ${k} | `;
  html += caseNum === 1 ? `k &lt; log_b(a) → leaves dominate` :
          caseNum === 2 ? `k = log_b(a) → equal at every level` :
                         `k &gt; log_b(a) → root dominates`;
  html += `</div>`;

  container.innerHTML = html;
}
