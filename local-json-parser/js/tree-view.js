function renderTree(value, key, path) {
  path = path || '$';
  var label = key !== undefined ? '<span class="key">' + escapeHtml(key) + '</span>: ' : '';
  if (Array.isArray(value)) {
    var html = '<details open data-path="' + escapeHtml(path) + '"><summary data-path="' + escapeHtml(path) + '">' + label + '<span class="type-badge">Array [' + value.length + ']</span></summary><ul>';
    value.forEach(function(item, index) {
      var childPath = path + '[' + index + ']';
      html += '<li data-path="' + escapeHtml(childPath) + '">' + renderTree(item, index, childPath) + '</li>';
    });
    return html + '</ul></details>';
  }
  if (value !== null && typeof value === 'object') {
    var keys = Object.keys(value);
    var htmlObj = '<details open data-path="' + escapeHtml(path) + '"><summary data-path="' + escapeHtml(path) + '">' + label + '<span class="type-badge">Object {' + keys.length + '}</span></summary><ul>';
    keys.forEach(function(k) {
      var childPath = path + '[' + JSON.stringify(k) + ']';
      htmlObj += '<li data-path="' + escapeHtml(childPath) + '">' + renderTree(value[k], k, childPath) + '</li>';
    });
    return htmlObj + '</ul></details>';
  }
  return '<span class="tree-leaf" data-path="' + escapeHtml(path) + '">' + label + primitiveHtml(value) + '</span>';
}

function primitiveHtml(value) {
  if (typeof value === 'string') return '<span class="string">"' + escapeHtml(value) + '"</span>';
  if (typeof value === 'number') return '<span class="number">' + value + '</span>';
  if (typeof value === 'boolean') return '<span class="boolean">' + value + '</span>';
  if (value === null) return '<span class="null">null</span>';
  return escapeHtml(String(value));
}

function bindTreeSelection() {
  var tree = document.getElementById('tree');
  tree.addEventListener('click', function(event) {
    var target = event.target.closest('[data-path]');
    if (!target || !tree.contains(target)) return;
    tree.querySelectorAll('.tree-selected').forEach(function(node) {
      node.classList.remove('tree-selected');
    });
    target.classList.add('tree-selected');
    setStatus('Selected path: ' + target.getAttribute('data-path'), 'valid');
  });
}
