// ── Closest Pair of Points Engine ────────────────────────────────────────

let cpOps = { mul: 0, add: 0 };

function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function bruteForce(pts) {
  let minD = Infinity, pair = null;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      cpOps.mul++;
      const d = dist(pts[i], pts[j]);
      if (d < minD) { minD = d; pair = [pts[i], pts[j]]; }
    }
  }
  return { d: minD, pair };
}

function stripClosest(strip, d) {
  strip.sort((a, b) => a.y - b.y);
  let minD = d, pair = null;
  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < minD; j++) {
      cpOps.add++;
      const dd = dist(strip[i], strip[j]);
      if (dd < minD) { minD = dd; pair = [strip[i], strip[j]]; }
    }
  }
  return { d: minD, pair };
}

function closestRec(pts, depth = 0, parentId = null, trace = [], idCounter = { v: 0 }) {
  const id = idCounter.v++;
  const n = pts.length;
  const nodeBase = { id, parentId, depth, resolved: false };

  const ptsStr = pts.map(p => `(${p.x},${p.y})`).join(' ');

  if (n <= 3) {
    cpOps.mul += n;
    const res = bruteForce(pts);
    const node = { ...nodeBase, type: n === 1 ? 'base' : 'leaf', isBase: true,
      label: n === 1 ? `(${pts[0].x},${pts[0].y})` : `${n} pts`,
      sublabel: `δ=${res.d.toFixed(2)}`,
      description: `Base case (${n} points): ${ptsStr}. Brute-force all pairs. Minimum distance = ${res.d.toFixed(3)}.`,
      pseudoLine: 1, result: res, resolved: true, quiz: null
    };
    trace.push({ action: 'reveal', node });
    trace.push({ action: 'resolve', nodeId: id, result: res });
    return { id, result: res };
  }

  const mid = Math.floor(n / 2);
  const midX = pts[mid].x;
  const left = pts.slice(0, mid);
  const right = pts.slice(mid);

  const node = { ...nodeBase, type: depth === 0 ? 'root' : 'split',
    label: `${n} points`,
    sublabel: '',
    description: `Splitting ${n} points at x=${midX}. Left: ${left.length} points, Right: ${right.length} points. Will recursively find closest in each half, then check the strip.`,
    pseudoLine: 3, result: null, resolved: false,
    quiz: depth === 0 ? {
      q: 'What is the maximum number of points to check in the strip for each point?',
      opts: ['3', '5', '7', 'All of them'],
      correct: '7',
      explanation: 'A geometric proof shows that in the δ×2δ strip rectangle, at most 8 points (including the point itself) can fit. So each point checks at most 7 others.'
    } : null
  };
  trace.push({ action: 'reveal', node });

  const leftRes = closestRec(left, depth + 1, id, trace, idCounter);
  const rightRes = closestRec(right, depth + 1, id, trace, idCounter);

  let delta = Math.min(leftRes.result.d, rightRes.result.d);
  let bestRes = leftRes.result.d <= rightRes.result.d ? leftRes.result : rightRes.result;

  cpOps.add++;
  const strip = pts.filter(p => Math.abs(p.x - midX) < delta);
  const stripRes = stripClosest(strip, delta);

  let finalResult;
  if (stripRes.d < delta) {
    finalResult = stripRes;
    delta = stripRes.d;
  } else {
    finalResult = bestRes;
  }

  node.result = finalResult;
  node.resolved = true;
  node.sublabel = `δ=${finalResult.d.toFixed(2)}`;

  trace.push({
    action: 'resolve', nodeId: id, result: finalResult,
    description: `Best: left δ=${leftRes.result.d.toFixed(3)}, right δ=${rightRes.result.d.toFixed(3)}, strip δ=${stripRes.d.toFixed(3)}. Final δ=${finalResult.d.toFixed(3)}`,
    ops: { ...cpOps }
  });

  return { id, result: finalResult };
}

function runClosestPair(points) {
  cpOps = { mul: 0, add: 0 };
  const pts = [...points].sort((a, b) => a.x - b.x);
  const trace = [];
  const idCounter = { v: 0 };
  const res = closestRec(pts, 0, null, trace, idCounter);

  const steps = [];
  const nodeMap = {};

  for (const event of trace) {
    if (event.action === 'reveal') {
      nodeMap[event.node.id] = event.node;
      steps.push({
        type: 'reveal', node: event.node,
        description: event.node.description,
        pseudoLine: event.node.pseudoLine || 0,
        quiz: event.node.quiz,
        ops: { ...cpOps }
      });
    } else if (event.action === 'resolve') {
      if (nodeMap[event.nodeId]) {
        nodeMap[event.nodeId].result = event.result;
        nodeMap[event.nodeId].resolved = true;
        nodeMap[event.nodeId].sublabel = `δ=${event.result.d.toFixed(2)}`;
      }
      steps.push({
        type: 'resolve', nodeId: event.nodeId, result: event.result,
        description: event.description || 'Resolved',
        pseudoLine: 8, quiz: null, ops: { ...cpOps }
      });
    }
  }

  return { steps, nodeMap, result: res.result, totalOps: cpOps };
}
