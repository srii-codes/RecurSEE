// ── Strassen Matrix Multiplication Engine ────────────────────────────────

let strassenOps = { mul: 0, add: 0 };

function matAdd(A, B) {
  strassenOps.add++;
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function matSub(A, B) {
  strassenOps.add++;
  return A.map((row, i) => row.map((v, j) => v - B[i][j]));
}

function strassenTrace(A, B, depth = 0, parentId = null, label = 'root', trace = [], idCounter = { v: 0 }) {
  const id = idCounter.v++;
  const n = A.length;

  const matStr = (M) => `[${M.map(r => '[' + r.join(',') + ']').join(',')}]`;
  const nodeBase = { id, parentId, depth, label, resolved: false, result: null };

  if (n === 1) {
    strassenOps.mul++;
    const result = [[A[0][0] * B[0][0]]];
    const node = { ...nodeBase, type: 'base', isBase: true,
      label: `${A[0][0]}×${B[0][0]}`,
      sublabel: `=${result[0][0]}`,
      description: `Base case: 1×1 matrices. ${A[0][0]} × ${B[0][0]} = ${result[0][0]}`,
      pseudoLine: 1, result, resolved: true, quiz: null
    };
    trace.push({ action: 'reveal', node });
    trace.push({ action: 'resolve', nodeId: id, result });
    return { id, result, trace };
  }

  const half = n / 2;
  const split = (M) => {
    const A11 = M.slice(0, half).map(r => r.slice(0, half));
    const A12 = M.slice(0, half).map(r => r.slice(half));
    const A21 = M.slice(half).map(r => r.slice(0, half));
    const A22 = M.slice(half).map(r => r.slice(half));
    return [A11, A12, A21, A22];
  };

  const [A11,A12,A21,A22] = split(A);
  const [B11,B12,B21,B22] = split(B);

  const node = { ...nodeBase, type: depth === 0 ? 'root' : 'split',
    label: `${n}×${n}`,
    sublabel: '',
    description: `Splitting ${n}×${n} matrices into four ${half}×${half} blocks. Will compute 7 Strassen products (M1–M7) instead of 8 classical multiplications.`,
    pseudoLine: 2, result: null, resolved: false,
    quiz: depth === 0 ? {
      q: 'How many recursive multiplications does Strassen use per level?',
      opts: ['4', '6', '7', '8'],
      correct: '7',
      explanation: 'Strassen uses 7 recursive multiplications per level, compared to 8 in the naive approach. This gives O(n^2.807) vs O(n³).'
    } : null
  };
  trace.push({ action: 'reveal', node });

  const m1 = strassenTrace(matAdd(A11,A22), matAdd(B11,B22), depth+1, id, 'M1', trace, idCounter);
  const m2 = strassenTrace(matAdd(A21,A22), B11,             depth+1, id, 'M2', trace, idCounter);
  const m3 = strassenTrace(A11,             matSub(B12,B22), depth+1, id, 'M3', trace, idCounter);
  const m4 = strassenTrace(A22,             matSub(B21,B11), depth+1, id, 'M4', trace, idCounter);
  const m5 = strassenTrace(matAdd(A11,A12), B22,             depth+1, id, 'M5', trace, idCounter);
  const m6 = strassenTrace(matSub(A21,A11), matAdd(B11,B12), depth+1, id, 'M6', trace, idCounter);
  const m7 = strassenTrace(matSub(A12,A22), matAdd(B21,B22), depth+1, id, 'M7', trace, idCounter);

  const C11 = matAdd(matSub(matAdd(m1.result, m4.result), m5.result), m7.result);
  const C12 = matAdd(m3.result, m5.result);
  const C21 = matAdd(m2.result, m4.result);
  const C22 = matAdd(matSub(matAdd(m1.result, m3.result), m2.result), m6.result);

  const result = C11.map((row, i) => [...row, ...C12[i]])
    .concat(C21.map((row, i) => [...row, ...C22[i]]));

  node.result = result;
  node.resolved = true;
  node.sublabel = `${n}×${n} done`;

  trace.push({
    action: 'resolve', nodeId: id, result,
    description: `Assembled ${n}×${n} result from M1–M7.`,
    ops: { ...strassenOps }
  });

  return { id, result, trace };
}

function runStrassen(A, B) {
  strassenOps = { mul: 0, add: 0 };
  // Use provided matrices

  const trace = [];
  const idCounter = { v: 0 };
  const res = strassenTrace(A, B, 0, null, 'root', trace, idCounter);

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
        ops: { ...strassenOps }
      });
    } else if (event.action === 'resolve') {
      if (nodeMap[event.nodeId]) {
        nodeMap[event.nodeId].result = event.result;
        nodeMap[event.nodeId].resolved = true;
      }
      steps.push({
        type: 'resolve', nodeId: event.nodeId, result: event.result,
        description: event.description || 'Resolved',
        pseudoLine: 10, quiz: null, ops: { ...strassenOps }
      });
    }
  }

  return { steps, nodeMap, result: res.result, totalOps: strassenOps, A, B };
}
