// ── Karatsuba Algorithm Engine ────────────────────────────────────────────
// Generates a full recursive call trace for visualization

let karatsubaOps = { mul: 0, add: 0 };

function karatsubaTrace(x, y, depth = 0, type = 'root', parentId = null, trace = [], idCounter = { v: 0 }) {
  const id = idCounter.v++;
  const nodeBase = { id, parentId, x, y, depth, type, resolved: false, result: null, pseudoLine: -1 };

  // Base case
  if (x < 10 || y < 10) {
    karatsubaOps.mul++;
    const result = x * y;
    const node = { ...nodeBase, isBase: true, result, resolved: true,
      label: `${x} × ${y}`, sublabel: `= ${result}`,
      description: `Base case: ${x} × ${y} = ${result}. Both numbers are single digits — no more splitting needed. Direct multiplication.`,
      pseudoLine: 1,
      quiz: null
    };
    trace.push({ action: 'reveal', node });
    trace.push({ action: 'resolve', nodeId: id, result, ops: { ...karatsubaOps } });
    return { id, result, trace };
  }

  // Split
  const n = Math.max(String(x).length, String(y).length);
  const m = Math.floor(n / 2);
  const p = Math.pow(10, m);
  const a = Math.floor(x / p), b = x % p;
  const c = Math.floor(y / p), d = y % p;

  const node = { ...nodeBase, isBase: false,
    label: `${x} × ${y}`,
    sublabel: '',
    a, b, c, d, m,
    description: `Splitting ${x} × ${y}. With m=${m}: x=${x} → a=${a}, b=${b}. y=${y} → c=${c}, d=${d}. We need z0=b×d, z2=a×c, and z1=(a+b)×(c+d)−z0−z2.`,
    pseudoLine: 3,
    quiz: depth === 0 ? {
      q: 'How many recursive subproblems will this call generate?',
      opts: ['2', '3', '4', '8'],
      correct: '3',
      explanation: 'Karatsuba always makes exactly 3 recursive calls — z0, z2, and the product for z1. This is the key improvement over classical multiplication which needs 4.'
    } : null
  };
  trace.push({ action: 'reveal', node });

  // z0 = b * d
  karatsubaOps.add++;
  const z0res = karatsubaTrace(b, d, depth + 1, 'z0', id, trace, idCounter);

  // z2 = a * c
  karatsubaOps.add++;
  const z2res = karatsubaTrace(a, c, depth + 1, 'z2', id, trace, idCounter);

  // z1 = (a+b)(c+d) - z0 - z2
  karatsubaOps.add += 3;
  const z1res = karatsubaTrace(a + b, c + d, depth + 1, 'z1', id, trace, idCounter);
  const z1 = z1res.result - z0res.result - z2res.result;

  // Assemble
  const result = z2res.result * Math.pow(10, 2 * m) + z1 * p + z0res.result;

  trace.push({
    action: 'resolve', nodeId: id, result,
    ops: { ...karatsubaOps },
    description: `Assembling ${x} × ${y}: z2=${z2res.result}×10^${2*m} + z1=${z1}×10^${m} + z0=${z0res.result} = ${result}`,
    pseudoLine: 10
  });

  node.result = result;
  node.sublabel = `= ${result}`;

  return { id, result, trace };
}

function runKaratsuba(x, y) {
  karatsubaOps = { mul: 0, add: 0 };
  const trace = [];
  const idCounter = { v: 0 };
  const res = karatsubaTrace(x, y, 0, 'root', null, trace, idCounter);

  const steps = [];
  const nodeMap = {};

  for (const event of trace) {
    if (event.action === 'reveal') {
      nodeMap[event.node.id] = event.node;
      steps.push({
        type: 'reveal',
        node: event.node,
        description: event.node.description,
        pseudoLine: event.node.pseudoLine,
        quiz: event.node.quiz,
        ops: { mul: karatsubaOps.mul, add: karatsubaOps.add }
      });
    } else if (event.action === 'resolve') {
      if (nodeMap[event.nodeId]) {
        nodeMap[event.nodeId].result = event.result;
        nodeMap[event.nodeId].resolved = true;
        nodeMap[event.nodeId].sublabel = `= ${event.result}`;
      }
      steps.push({
        type: 'resolve',
        nodeId: event.nodeId,
        result: event.result,
        description: event.description || `Node resolved with result ${event.result}`,
        pseudoLine: event.pseudoLine || 10,
        quiz: null,
        ops: event.ops || karatsubaOps
      });
    }
  }

  return {
    steps,
    nodeMap,
    result: res.result,
    totalOps: karatsubaOps,
    classicalMuls: String(x).length * String(y).length * 4
  };
}
