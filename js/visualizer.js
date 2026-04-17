// ── Visualizer — D3 Tree Renderer + Step Controller ────────

let vizState = {
  steps: [], currentStep: -1, playing: false,
  timer: null, nodeMap: {}, drawnNodes: {},
  currentAlgo: null, syncEnabled: true,
  ops: { mul: 0, add: 0 }
};

const SPEEDS = [2000, 1400, 900, 500, 250];
const SPEED_LABELS = ['slow', 'slow', 'med', 'fast', 'v.fast'];

const NODE_COLORS = {
  root:  { fill: '#FFE8CC', stroke: '#FFB347', text: '#5a3e00' },
  z0:    { fill: '#FDE8EF', stroke: '#F2A7BB', text: '#7a2040' },
  z1:    { fill: '#EDE8F8', stroke: '#C9B8E8', text: '#3d2a6b' },
  z2:    { fill: '#E4F7F0', stroke: '#A8E6CF', text: '#1a5040' },
  base:  { fill: '#E3F0FB', stroke: '#A7C7E7', text: '#1a3a5c' },
  split: { fill: '#E4F7F0', stroke: '#A8E6CF', text: '#1a5040' },
  leaf:  { fill: '#FDE8EF', stroke: '#F2A7BB', text: '#7a2040' },
  M1:    { fill: '#FFE8CC', stroke: '#FFB347', text: '#5a3e00' },
  M2:    { fill: '#FDE8EF', stroke: '#F2A7BB', text: '#7a2040' },
  M3:    { fill: '#EDE8F8', stroke: '#C9B8E8', text: '#3d2a6b' },
  M4:    { fill: '#E4F7F0', stroke: '#A8E6CF', text: '#1a5040' },
  M5:    { fill: '#E3F0FB', stroke: '#A7C7E7', text: '#1a3a5c' },
  M6:    { fill: '#FFF0E3', stroke: '#FFD4B2', text: '#6b3a00' },
  M7:    { fill: '#F0F0FF', stroke: '#9999CC', text: '#2a2a6b' },
};

function getColor(type) {
  return NODE_COLORS[type] || NODE_COLORS.base;
}

// ── Build D3 tree from nodeMap ────────────────────────────────────────────
function buildTreeData(nodeMap) {
  const nodes = Object.values(nodeMap);
  if (!nodes.length) return null;
  const root = nodes.find(n => n.parentId === null);
  if (!root) return null;

  function buildNode(n) {
    const children = nodes.filter(c => c.parentId === n.id);
    return { data: n, children: children.map(buildNode) };
  }
  return buildNode(root);
}

function renderTree(nodeMap) {
  const container = document.getElementById('treeCanvas');
  container.innerHTML = '';

  const treeData = buildTreeData(nodeMap);
  if (!treeData) return;

  const nodeW = 110, nodeH = 52, hGap = 20, vGap = 70;

  const root = d3.hierarchy(treeData, d => d.children);
  const treeLayout = d3.tree().nodeSize([nodeW + hGap, nodeH + vGap]);
  treeLayout(root);

  const nodes = root.descendants();
  const links = root.links();

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - nodeW/2 - 20;
  const maxX = Math.max(...xs) + nodeW/2 + 20;
  const minY = Math.min(...ys) - nodeH/2 - 20;
  const maxY = Math.max(...ys) + nodeH/2 + 20;
  const svgW = Math.max(maxX - minX, container.clientWidth - 40);
  const svgH = maxY - minY + 40;

  const svg = d3.select('#treeCanvas')
    .append('svg')
    .attr('viewBox', `0 0 ${svgW} ${svgH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('width', '100%')
    .attr('height', 'auto')
    .style('overflow', 'visible');

  const g = svg.append('g')
    .attr('transform', `translate(${-minX}, ${-minY + 20})`);

  // Links
  g.selectAll('.link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('id', d => `link-${d.source.data.data.id}-${d.target.data.data.id}`)
    .attr('d', d => {
      const sx = d.source.x, sy = d.source.y + nodeH/2;
      const tx = d.target.x, ty = d.target.y - nodeH/2;
      const my = (sy + ty) / 2;
      return `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`;
    })
    .style('opacity', 0);

  // Nodes
  const nodeG = g.selectAll('.node-g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node-g')
    .attr('id', d => `node-g-${d.data.data.id}`)
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .style('opacity', 0)
    .style('cursor', 'pointer');

  nodeG.append('rect')
    .attr('x', -nodeW/2).attr('y', -nodeH/2)
    .attr('width', nodeW).attr('height', nodeH)
    .attr('rx', 10).attr('ry', 10)
    .attr('fill', d => getColor(d.data.data.type).fill)
    .attr('stroke', d => getColor(d.data.data.type).stroke)
    .attr('stroke-width', 2);

  nodeG.append('text')
    .attr('class', 'node-text')
    .attr('y', d => d.data.data.sublabel ? -8 : 0)
    .attr('fill', d => getColor(d.data.data.type).text)
    .text(d => d.data.data.label || '');

  nodeG.append('text')
    .attr('class', 'node-result')
    .attr('y', 12)
    .attr('fill', d => getColor(d.data.data.type).stroke)
    .text(d => d.data.data.sublabel || '');

  // Tooltip
  const tooltip = d3.select('body').selectAll('.tree-tooltip').data([null])
    .join('div').attr('class', 'tree-tooltip');

  nodeG.on('mouseover', function(event, d) {
    const nd = d.data.data;
    const color = getColor(nd.type);
    let html = `<div class="tooltip-title" style="color:${color.stroke}">${nd.label}</div>`;
    html += `<div class="tooltip-row"><span>Type</span><span>${nd.type}</span></div>`;
    html += `<div class="tooltip-row"><span>Depth</span><span>${nd.depth}</span></div>`;
    if (nd.result !== null && nd.result !== undefined) {
      const r = typeof nd.result === 'object' ? JSON.stringify(nd.result).slice(0,40) : nd.result;
      html += `<div class="tooltip-row"><span>Result</span><span>${r}</span></div>`;
    }
    if (nd.a !== undefined) {
      html += `<div class="tooltip-row"><span>a, b</span><span>${nd.a}, ${nd.b}</span></div>`;
      html += `<div class="tooltip-row"><span>c, d</span><span>${nd.c}, ${nd.d}</span></div>`;
    }
    if (nd.isBase) html += `<div class="tooltip-row"><span>Base case</span><span>✓</span></div>`;
    tooltip.html(html)
      .style('left', (event.clientX + 14) + 'px')
      .style('top',  (event.clientY - 10) + 'px')
      .classed('visible', true);
  }).on('mousemove', function(event) {
    tooltip.style('left', (event.clientX + 14) + 'px')
           .style('top',  (event.clientY - 10) + 'px');
  }).on('mouseout', function() {
    tooltip.classed('visible', false);
  });

  // Store references
  vizState.drawnNodes = {};
  nodes.forEach(n => {
    vizState.drawnNodes[n.data.data.id] = {
      g: d3.select(`#node-g-${n.data.data.id}`),
      link: g.selectAll(`#link-${n.data.data?.id}`)
    };
  });
}

function revealNode(nodeId) {
  const el = d3.select(`#node-g-${nodeId}`);
  if (!el.empty()) {
    el.transition().duration(400)
      .style('opacity', 1)
      .attr('transform', function() {
        const current = d3.select(this).attr('transform');
        return current;
      });

    el.select('rect')
      .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');
  }

  // Reveal parent link
  d3.selectAll('.link').each(function() {
    const id = d3.select(this).attr('id');
    if (id && id.endsWith(`-${nodeId}`)) {
      d3.select(this).transition().duration(400).style('opacity', 1);
    }
  });
}

function activateNode(nodeId, prevId) {
  // Deactivate previous
  if (prevId !== null && prevId !== undefined) {
    const prev = d3.select(`#node-g-${prevId}`);
    if (!prev.empty()) {
      prev.select('rect')
        .attr('stroke-width', 2)
        .style('filter', 'none');
    }
  }
  // Activate current
  const el = d3.select(`#node-g-${nodeId}`);
  if (!el.empty()) {
    el.select('rect')
      .attr('stroke-width', 3.5)
      .style('filter', 'drop-shadow(0 0 10px rgba(242,167,187,0.8))');
    el.raise();
  }
}

function resolveNode(nodeId, result) {
  const el = d3.select(`#node-g-${nodeId}`);
  if (!el.empty()) {
    const nd = vizState.nodeMap[nodeId];
    if (nd) {
      el.select('.node-result')
        .text(nd.sublabel || (result !== null ? `= ${result}` : ''))
        .transition().duration(300);
      el.select('rect')
        .attr('stroke-width', 2)
        .style('filter', 'none');
    }
  }
}

// ── Step execution ────────────────────────────────────────────────────────
function applyStep(idx) {
  if (idx < 0 || idx >= vizState.steps.length) return;
  const step = vizState.steps[idx];
  const prevStep = idx > 0 ? vizState.steps[idx - 1] : null;

  // Update ops counter
  if (step.ops) {
    document.getElementById('opMul').textContent = step.ops.mul;
    document.getElementById('opAdd').textContent = step.ops.add;
  }

  // Description
  const desc = document.getElementById('stepDesc');
  desc.innerHTML = step.description || '';

  // Quiz
  const quizBox = document.getElementById('quizBox');
  if (step.quiz) {
    showQuiz(step.quiz);
  } else {
    quizBox.classList.add('hidden');
  }

  // Code sync
  updateSync(step.pseudoLine);

  // Tree actions
  if (step.type === 'reveal') {
    revealNode(step.node.id);
    activateNode(step.node.id, prevStep?.node?.id || prevStep?.nodeId);
  } else if (step.type === 'resolve') {
    resolveNode(step.nodeId, step.result);
    activateNode(step.nodeId, null);
  }

  // Progress
  const pct = ((idx + 1) / vizState.steps.length) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('stepBadge').textContent = `${idx + 1} / ${vizState.steps.length}`;

  // Final result
  if (idx === vizState.steps.length - 1) {
    showResult();
  } else {
    document.getElementById('resultBox').classList.add('hidden');
  }
}

function showQuiz(quiz) {
  const box = document.getElementById('quizBox');
  box.classList.remove('hidden');
  document.getElementById('quizQ').textContent = quiz.q;
  const opts = document.getElementById('quizOpts');
  opts.innerHTML = '';
  document.getElementById('quizFeedback').classList.add('hidden');
  quiz.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quiz-opt').forEach(b => b.style.pointerEvents = 'none');
      const fb = document.getElementById('quizFeedback');
      if (opt === quiz.correct) {
        btn.classList.add('correct');
        fb.textContent = '✓ Correct! ' + (quiz.explanation || '');
        fb.style.color = '#27ae60';
      } else {
        btn.classList.add('wrong');
        fb.textContent = `✗ Not quite. Answer: ${quiz.correct}. ${quiz.explanation || ''}`;
        fb.style.color = '#e74c3c';
        document.querySelectorAll('.quiz-opt').forEach(b => {
          if (b.textContent === quiz.correct) b.classList.add('correct');
        });
      }
      fb.classList.remove('hidden');
    });
    opts.appendChild(btn);
  });
}

function updateSync(lineIdx) {
  const syncToggle = document.getElementById('syncToggle');
  const syncWrap = document.getElementById('syncWrap');
  if (!syncToggle || !syncToggle.checked) return;

  const algo = vizState.currentAlgo;
  if (!algo || !CONTENT[algo]) return;
  const lines = CONTENT[algo].pseudoLines || [];

  const syncCode = document.getElementById('syncCode');
  syncCode.innerHTML = lines.map((line, i) => {
    const active = i === lineIdx;
    return `<span class="sync-line${active ? ' active' : ''}">${escapeHtml(line)}</span>`;
  }).join('\n');

  // Scroll active line into view
  const activeEl = syncCode.querySelector('.sync-line.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function showResult() {
  const algo = vizState.currentAlgo;
  const result = vizState.result;
  const box = document.getElementById('resultBox');
  const val = document.getElementById('resultVal');
  const sub = document.getElementById('resultSub');

  box.classList.remove('hidden');

  if (algo === 'karatsuba') {
    val.textContent = `${vizState.inputs[0]} × ${vizState.inputs[1]} = ${result}`;
    sub.textContent = `Computed using 3 recursive calls per level instead of 4.`;
  } else if (algo === 'maxsubarray') {
    const arr = vizState.inputs;
    const subarray = arr.slice(result.low, result.high + 1);
    val.textContent = `Maximum sum = ${result.sum}`;
    sub.textContent = `Subarray: [${subarray.join(', ')}]`;
  } else if (algo === 'strassen') {
    const formatMatrix = (m) => `[${m.map(row => '[' + row.map(v => v.toString()).join(', ') + ']').join(', ')}]`;
    val.textContent = `Result: ${formatMatrix(result)}`;
    sub.textContent = `Computed using 7 Strassen products instead of 8.`;
  } else if (algo === 'closestpair') {
    const p1 = result.pair[0], p2 = result.pair[1];
    val.textContent = `Minimum distance = ${result.d.toFixed(4)}`;
    sub.textContent = `Between points (${p1.x},${p1.y}) and (${p2.x},${p2.y}).`;
  }
}


function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Controls ──────────────────────────────────────────────────────────────
function stepNext() {
  if (vizState.currentStep < vizState.steps.length - 1) {
    vizState.currentStep++;
    applyStep(vizState.currentStep);
  }
}

function stepPrev() {
  if (vizState.currentStep > 0) {
    vizState.currentStep--;
    applyStep(vizState.currentStep);
  }
}

function resetViz() {
  stopPlay();
  vizState.currentStep = -1;
  vizState.drawnNodes = {};
  document.getElementById('treeCanvas').innerHTML = '';
  document.getElementById('stepDesc').innerHTML = 'Press <strong>Visualize</strong> to begin.';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('stepBadge').textContent = '0 / 0';
  document.getElementById('resultBox').classList.add('hidden');
  document.getElementById('quizBox').classList.add('hidden');
  document.getElementById('opMul').textContent = '0';
  document.getElementById('opAdd').textContent = '0';
  document.getElementById('syncCode').innerHTML = '';
  // Re-render empty tree
  if (vizState.nodeMap && Object.keys(vizState.nodeMap).length) {
    renderTree(vizState.nodeMap);
  }
}

function startPlay() {
  if (vizState.playing) return;
  vizState.playing = true;
  document.getElementById('ctrlPlay').textContent = '⏸';
  const speed = parseInt(document.getElementById('speedSlider').value);
  const interval = SPEEDS[speed - 1];
  vizState.timer = setInterval(() => {
    if (vizState.currentStep >= vizState.steps.length - 1) {
      stopPlay();
      return;
    }
    stepNext();
  }, interval);
}

function stopPlay() {
  vizState.playing = false;
  document.getElementById('ctrlPlay').textContent = '▶';
  if (vizState.timer) { clearInterval(vizState.timer); vizState.timer = null; }
}

function togglePlay() {
  if (vizState.playing) stopPlay(); else startPlay();
}

function initVizControls() {
  document.getElementById('ctrlNext').addEventListener('click', stepNext);
  document.getElementById('ctrlPrev').addEventListener('click', stepPrev);
  document.getElementById('ctrlReset').addEventListener('click', resetViz);
  document.getElementById('ctrlPlay').addEventListener('click', togglePlay);

  const slider = document.getElementById('speedSlider');
  slider.addEventListener('input', () => {
    const v = parseInt(slider.value);
    document.getElementById('speedVal').textContent = SPEED_LABELS[v - 1];
    if (vizState.playing) { stopPlay(); startPlay(); }
  });

  document.getElementById('syncToggle').addEventListener('change', (e) => {
    document.getElementById('syncCode').innerHTML = '';
    if (e.target.checked && vizState.currentStep >= 0) {
      updateSync(vizState.steps[vizState.currentStep]?.pseudoLine || 0);
    }
  });
}
