// ── Maximum Subarray Algorithm Engine ────────────────────────────────────

let msaOps = { mul: 0, add: 0 };

function msaTrace(arr, low, high, depth = 0, parentId = null, trace = [], idCounter = { v: 0 }) {
  const id = idCounter.v++;
  const slice = arr.slice(low, high + 1);
  const nodeBase = { id, parentId, low, high, depth, resolved: false, result: null };

  if (low === high) {
    msaOps.add++;
    const result = { low, high, sum: arr[low] };
    const node = { ...nodeBase, type: 'base', isBase: true,
      label: `[${arr[low]}]`,
      sublabel: `sum=${arr[low]}`,
      description: `Base case: single element [${arr[low]}] at index ${low}. The maximum subarray of a single element is itself.`,
      pseudoLine: 1,
      result,
      resolved: true,
      quiz: null
    };
    trace.push({ action: 'reveal', node });
    trace.push({ action: 'resolve', nodeId: id, result });
    return { id, result, trace };
  }

  const mid = Math.floor((low + high) / 2);
  const node = { ...nodeBase, type: depth === 0 ? 'root' : 'split',
    label: `[${slice.join(',')}]`,
    sublabel: '',
    description: `Splitting array [${slice.join(', ')}] at midpoint index ${mid}. Left half: [${arr.slice(low, mid+1).join(', ')}], Right half: [${arr.slice(mid+1, high+1).join(', ')}].`,
    pseudoLine: 2,
    result: null,
    resolved: false,
    quiz: depth === 0 ? {
      q: 'Where does the maximum subarray lie?',
      opts: ['Left half only', 'Right half only', 'Crosses midpoint', 'We check all three!'],
      correct: 'We check all three!',
      explanation: 'The divide and conquer approach checks all three cases: left half, right half, and crossing the midpoint. The best of the three is returned.'
    } : null
  };
  trace.push({ action: 'reveal', node });

  // Left
  msaOps.add++;
  const leftRes = msaTrace(arr, low, mid, depth + 1, id, trace, idCounter);

  // Right
  msaOps.add++;
  const rightRes = msaTrace(arr, mid + 1, high, depth + 1, id, trace, idCounter);

  // Cross
  msaOps.add++;
  const crossResult = maxCrossing(arr, low, mid, high);

  // Best
  let result;
  if (leftRes.result.sum >= rightRes.result.sum && leftRes.result.sum >= crossResult.sum) {
    result = leftRes.result;
  } else if (rightRes.result.sum >= leftRes.result.sum && rightRes.result.sum >= crossResult.sum) {
    result = rightRes.result;
  } else {
    result = crossResult;
  }

  node.result = result;
  node.resolved = true;
  node.sublabel = `sum=${result.sum}`;

  trace.push({
    action: 'resolve', nodeId: id, result,
    description: `Best subarray in [${slice.join(', ')}]: left sum=${leftRes.result.sum}, right sum=${rightRes.result.sum}, cross sum=${crossResult.sum}. Winner: sum=${result.sum}`
  });

  return { id, result, trace };
}

function maxCrossing(arr, low, mid, high) {
  let leftSum = -Infinity, s = 0, maxLeft = mid;
  for (let i = mid; i >= low; i--) {
    s += arr[i];
    if (s > leftSum) { leftSum = s; maxLeft = i; }
  }
  let rightSum = -Infinity; s = 0;
  let maxRight = mid + 1;
  for (let j = mid + 1; j <= high; j++) {
    s += arr[j];
    if (s > rightSum) { rightSum = s; maxRight = j; }
  }
  return { low: maxLeft, high: maxRight, sum: leftSum + rightSum };
}

function runMaxSubarray(arr) {
  msaOps = { mul: 0, add: 0 };
  const trace = [];
  const idCounter = { v: 0 };
  const res = msaTrace(arr, 0, arr.length - 1, 0, null, trace, idCounter);

  const steps = [];
  const nodeMap = {};

  for (const event of trace) {
    if (event.action === 'reveal') {
      nodeMap[event.node.id] = event.node;
      steps.push({
        type: 'reveal',
        node: event.node,
        description: event.node.description,
        pseudoLine: event.node.pseudoLine || 0,
        quiz: event.node.quiz,
        ops: { ...msaOps }
      });
    } else if (event.action === 'resolve') {
      if (nodeMap[event.nodeId]) {
        nodeMap[event.nodeId].result = event.result;
        nodeMap[event.nodeId].resolved = true;
        nodeMap[event.nodeId].sublabel = `sum=${event.result.sum}`;
      }
      steps.push({
        type: 'resolve',
        nodeId: event.nodeId,
        result: event.result,
        description: event.description || `Resolved`,
        pseudoLine: 6,
        quiz: null,
        ops: { ...msaOps }
      });
    }
  }

  return {
    steps,
    nodeMap,
    result: res.result,
    totalOps: msaOps
  };
}
