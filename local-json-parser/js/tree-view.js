function renderTree(value, key) {
  var label = key !== undefined ? '<span class="key">' + escapeHtml(key) + '</span>: ' : '';
  if (Array.isArray(value)) {
    var html = '<details open><summary>' + label + '<span class="type-badge">Array [' + value.length + ']</span></summary><ul>';
    value.forEach(function(item, index) {
      html += '<li>' + renderTree(item, index) + '</li>';
    });
    return html + '</ul></details>';
  }
  if (value !== null && typeof value === 'object') {
    var keys = Object.keys(value);
    var htmlObj = '<details open><summary>' + label + '<span class="type-badge">Object {' + keys.length + '}</span></summary><ul>';
    keys.forEach(function(k) {
      htmlObj += '<li>' + renderTree(value[k], k) + '</li>';
    });
    return htmlObj + '</ul></details>';
  }
  return label + primitiveHtml(value);
}

function primitiveHtml(value) {
  if (typeof value === 'string') return '<span class="string">"' + escapeHtml(value) + '"</span>';
  if (typeof value === 'number') return '<span class="number">' + value + '</span>';
  if (typeof value === 'boolean') return '<span class="boolean">' + value + '</span>';
  if (value === null) return '<span class="null">null</span>';
  return escapeHtml(String(value));
}

