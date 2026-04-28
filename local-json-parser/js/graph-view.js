var graphZoom = 1;
var graphPanX = 24;
var graphPanY = 24;

function generateGraphView() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    graphZoom = 1;
    graphPanX = 24;
    graphPanY = 24;
    document.getElementById('graphOutput').innerHTML = buildGraphSvg(currentJson);
    applyGraphTransform();
    setStatus('Graph view generated. Use mouse wheel to zoom and drag to pan.', 'valid');
    showTab('graph');
  } catch (e) {
    document.getElementById('graphOutput').innerHTML = '<span class="invalid">' + escapeHtml(e.message) + '</span>';
    setStatus('Graph generation failed: ' + e.message, 'invalid');
    showTab('graph');
  }
}

function buildGraphSvg(json) {
  var cards = [];
  var edges = [];
  walkGraphCards(json, 'Untitled', '$', 0, cards, edges, null);
  layoutGraphCards(cards);
  return renderGraphCanvas(cards, edges);
}

function walkGraphCards(value, title, path, depth, cards, edges, parentLink) {
  var id = 'card_' + cards.length;
  var card = {
    id: id,
    title: title,
    path: path,
    depth: depth,
    rows: [],
    links: [],
    width: 190,
    height: 0,
    x: 0,
    y: 0
  };
  cards.push(card);
  if (parentLink) edges.push({ from: parentLink.cardId, rowIndex: parentLink.rowIndex, to: id });

  if (Array.isArray(value)) {
    value.slice(0, 50).forEach(function(item, index) {
      var label = title === 'Untitled' ? '[' + index + ']' : title + '[' + index + ']';
      addGraphRow(card, String(index), item, id, cards, edges, path + '[' + index + ']', depth, label);
    });
  } else if (isPlainObject(value)) {
    Object.keys(value).slice(0, 50).forEach(function(key) {
      addGraphRow(card, key, value[key], id, cards, edges, path + '[' + JSON.stringify(key) + ']', depth, key);
    });
  } else {
    card.rows.push({ key: 'value', value: graphPrimitiveLabel(value), kind: primitiveKind(value), linked: false });
  }

  card.height = 26 + Math.max(1, card.rows.length) * 24;
  return card;
}

function addGraphRow(card, key, value, cardId, cards, edges, path, depth, title) {
  var linked = isPlainObject(value) || Array.isArray(value);
  var row = {
    key: key,
    value: linked ? graphValueLabel(value) : graphPrimitiveLabel(value),
    kind: Array.isArray(value) ? 'array' : isPlainObject(value) ? 'object' : primitiveKind(value),
    linked: linked
  };
  card.rows.push(row);
  if (linked) {
    walkGraphCards(value, title, path, depth + 1, cards, edges, { cardId: cardId, rowIndex: card.rows.length - 1 });
  }
}

function layoutGraphCards(cards) {
  var levels = {};
  cards.forEach(function(card) {
    if (!levels[card.depth]) levels[card.depth] = [];
    levels[card.depth].push(card);
  });
  Object.keys(levels).forEach(function(depth) {
    var y = 30;
    levels[depth].forEach(function(card) {
      card.x = 40 + Number(depth) * 250;
      card.y = y;
      y += card.height + 24;
    });
  });
}

function renderGraphCanvas(cards, edges) {
  var width = Math.max(900, Math.max.apply(null, cards.map(function(card) { return card.x + card.width + 80; })));
  var height = Math.max(620, Math.max.apply(null, cards.map(function(card) { return card.y + card.height + 80; })));
  var byId = {};
  cards.forEach(function(card) { byId[card.id] = card; });

  var html = '<div class="graph-toolbar"><span>Wheel: zoom</span><span>Drag: pan</span><button type="button" id="graphResetButton">Reset</button></div>';
  html += '<svg class="graph-svg" xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">';
  html += '<defs><pattern id="graphGrid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e5e7eb"/></pattern></defs>';
  html += '<rect width="100%" height="100%" fill="url(#graphGrid)"/>';
  html += '<g id="graphViewport">';
  edges.forEach(function(edge) {
    var from = byId[edge.from];
    var to = byId[edge.to];
    var startX = from.x + from.width;
    var startY = from.y + 26 + edge.rowIndex * 24 + 12;
    var endX = to.x;
    var endY = to.y + 16;
    html += '<path d="M' + startX + ' ' + startY + ' C ' + (startX + 55) + ' ' + startY + ', ' + (endX - 55) + ' ' + endY + ', ' + endX + ' ' + endY + '" stroke="#cbd5e1" stroke-width="1.5" fill="none"/>';
  });
  cards.forEach(function(card) {
    html += renderGraphCard(card);
  });
  html += '</g></svg>';
  return html;
}

function renderGraphCard(card) {
  var html = '<g class="graph-card">';
  html += '<rect x="' + card.x + '" y="' + card.y + '" width="' + card.width + '" height="' + card.height + '" rx="4" fill="#ffffff" stroke="#cbd5e1"/>';
  html += '<rect x="' + card.x + '" y="' + card.y + '" width="' + card.width + '" height="26" rx="4" fill="' + cardHeaderFill(card) + '"/>';
  html += '<text x="' + (card.x + 10) + '" y="' + (card.y + 17) + '" font-family="Consolas, monospace" font-size="12" fill="#475569">' + escapeHtml(truncateText(card.title, 24)) + '</text>';
  card.rows.forEach(function(row, index) {
    var y = card.y + 26 + index * 24;
    html += '<line x1="' + card.x + '" y1="' + y + '" x2="' + (card.x + card.width) + '" y2="' + y + '" stroke="#e5e7eb"/>';
    html += '<text x="' + (card.x + 10) + '" y="' + (y + 16) + '" font-family="Consolas, monospace" font-size="11" fill="#2563eb">' + escapeHtml(truncateText(row.key, 14)) + ':</text>';
    html += '<text x="' + (card.x + 82) + '" y="' + (y + 16) + '" font-family="Consolas, monospace" font-size="11" fill="' + graphTextColor(row.kind) + '">' + escapeHtml(truncateText(row.value, 16)) + '</text>';
    if (row.linked) {
      html += '<circle cx="' + (card.x + card.width) + '" cy="' + (y + 12) + '" r="6" fill="#f8fafc" stroke="#94a3b8"/>';
      html += '<text x="' + (card.x + card.width - 3) + '" y="' + (y + 15) + '" font-family="Arial" font-size="9" fill="#64748b">+</text>';
    }
  });
  html += '</g>';
  return html;
}

function bindGraphInteractions() {
  var graph = document.getElementById('graphOutput');
  graph.addEventListener('wheel', function(event) {
    if (!graph.querySelector('.graph-svg')) return;
    event.preventDefault();
    var delta = event.deltaY > 0 ? -0.08 : 0.08;
    graphZoom = Math.max(0.35, Math.min(2.4, graphZoom + delta));
    applyGraphTransform();
  }, { passive: false });

  graph.addEventListener('pointerdown', function(event) {
    if (!graph.querySelector('.graph-svg')) return;
    if (event.target && event.target.id === 'graphResetButton') return;
    var startX = event.clientX;
    var startY = event.clientY;
    var startPanX = graphPanX;
    var startPanY = graphPanY;
    graph.setPointerCapture(event.pointerId);
    graph.classList.add('panning');

    function move(moveEvent) {
      graphPanX = startPanX + (moveEvent.clientX - startX) / graphZoom;
      graphPanY = startPanY + (moveEvent.clientY - startY) / graphZoom;
      applyGraphTransform();
    }

    function end() {
      graph.classList.remove('panning');
      graph.removeEventListener('pointermove', move);
      graph.removeEventListener('pointerup', end);
      graph.removeEventListener('pointercancel', end);
    }

    graph.addEventListener('pointermove', move);
    graph.addEventListener('pointerup', end);
    graph.addEventListener('pointercancel', end);
  });

  graph.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'graphResetButton') {
      graphZoom = 1;
      graphPanX = 24;
      graphPanY = 24;
      applyGraphTransform();
    }
  });
}

function applyGraphTransform() {
  var viewport = document.getElementById('graphViewport');
  if (viewport) {
    viewport.setAttribute('transform', 'translate(' + graphPanX + ' ' + graphPanY + ') scale(' + graphZoom + ')');
  }
}

function graphValueLabel(value) {
  if (Array.isArray(value)) return '[' + value.length + ' items]';
  if (isPlainObject(value)) return '{' + Object.keys(value).length + ' keys}';
  if (value === null) return 'null';
  return String(value);
}

function graphPrimitiveLabel(value) {
  if (value === null) return 'null';
  return String(value);
}

function primitiveKind(value) {
  if (value === null) return 'null';
  return typeof value;
}

function cardHeaderFill(card) {
  if (card.depth === 0) return '#bae6fd';
  if (card.title.indexOf('[') !== -1) return '#bfdbfe';
  return '#ccfbf1';
}

function graphTextColor(kind) {
  if (kind === 'number') return '#ea580c';
  if (kind === 'boolean') return '#16a34a';
  if (kind === 'null') return '#94a3b8';
  if (kind === 'array' || kind === 'object') return '#64748b';
  return '#475569';
}

function truncateText(text, length) {
  text = String(text);
  return text.length > length ? text.slice(0, length - 1) + '...' : text;
}
