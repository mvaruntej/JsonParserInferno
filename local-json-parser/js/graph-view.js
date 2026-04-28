function generateGraphView() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    document.getElementById('graphOutput').innerHTML = buildGraphSvg(currentJson);
    setStatus('Graph view generated', 'valid');
    showTab('graph');
  } catch (e) {
    document.getElementById('graphOutput').innerHTML = '<span class="invalid">' + escapeHtml(e.message) + '</span>';
    setStatus('Graph generation failed: ' + e.message, 'invalid');
    showTab('graph');
  }
}

function buildGraphSvg(json) {
  var nodes = [];
  var edges = [];
  walkGraph(json, 'root', '$', 0, nodes, edges, null);
  var levels = {};
  nodes.forEach(function(node) {
    if (!levels[node.depth]) levels[node.depth] = [];
    levels[node.depth].push(node);
  });
  Object.keys(levels).forEach(function(depth) {
    levels[depth].forEach(function(node, index) {
      node.x = 40 + Number(depth) * 230;
      node.y = 40 + index * 82;
    });
  });
  var maxDepth = Math.max.apply(null, nodes.map(function(node) { return node.depth; }));
  var maxRows = Math.max.apply(null, Object.keys(levels).map(function(level) { return levels[level].length; }));
  var width = Math.max(720, 300 + maxDepth * 230);
  var height = Math.max(420, 120 + maxRows * 82);
  var byId = {};
  nodes.forEach(function(node) { byId[node.id] = node; });

  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">';
  svg += '<rect width="100%" height="100%" fill="#ffffff"/>';
  edges.forEach(function(edge) {
    var from = byId[edge.from];
    var to = byId[edge.to];
    svg += '<path d="M' + (from.x + 170) + ' ' + (from.y + 26) + ' C ' + (from.x + 205) + ' ' + (from.y + 26) + ', ' + (to.x - 35) + ' ' + (to.y + 26) + ', ' + to.x + ' ' + (to.y + 26) + '" stroke="#94a3b8" fill="none"/>';
  });
  nodes.forEach(function(node) {
    svg += '<g>';
    svg += '<rect x="' + node.x + '" y="' + node.y + '" width="170" height="52" rx="8" fill="' + graphFill(node.kind) + '" stroke="#cbd5e1"/>';
    svg += '<text x="' + (node.x + 10) + '" y="' + (node.y + 21) + '" font-family="Arial" font-size="12" font-weight="700" fill="#172033">' + escapeHtml(truncateText(node.label, 20)) + '</text>';
    svg += '<text x="' + (node.x + 10) + '" y="' + (node.y + 39) + '" font-family="Arial" font-size="11" fill="#475569">' + escapeHtml(truncateText(node.value, 24)) + '</text>';
    svg += '</g>';
  });
  svg += '</svg>';
  return svg;
}

function walkGraph(value, label, path, depth, nodes, edges, parentId) {
  var id = 'node_' + nodes.length;
  var kind = Array.isArray(value) ? 'array' : isPlainObject(value) ? 'object' : typeof value;
  nodes.push({ id: id, label: label, value: graphValueLabel(value), depth: depth, kind: kind, path: path });
  if (parentId) edges.push({ from: parentId, to: id });
  if (Array.isArray(value)) {
    value.slice(0, 40).forEach(function(item, index) {
      walkGraph(item, String(index), path + '[' + index + ']', depth + 1, nodes, edges, id);
    });
  } else if (isPlainObject(value)) {
    Object.keys(value).slice(0, 40).forEach(function(key) {
      walkGraph(value[key], key, path + '[' + JSON.stringify(key) + ']', depth + 1, nodes, edges, id);
    });
  }
}

function graphValueLabel(value) {
  if (Array.isArray(value)) return 'Array [' + value.length + ']';
  if (isPlainObject(value)) return 'Object {' + Object.keys(value).length + '}';
  if (value === null) return 'null';
  return String(value);
}

function graphFill(kind) {
  if (kind === 'object') return '#eff6ff';
  if (kind === 'array') return '#f0fdf4';
  if (kind === 'string') return '#fefce8';
  if (kind === 'number') return '#fff7ed';
  if (kind === 'boolean') return '#f5f3ff';
  return '#f8fafc';
}

function truncateText(text, length) {
  text = String(text);
  return text.length > length ? text.slice(0, length - 1) + '...' : text;
}
