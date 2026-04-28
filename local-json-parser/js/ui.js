function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function getIndent() {
  var value = document.getElementById('indentSize').value;
  return value === 'tab' ? '\t' : Number(value);
}

function setStatus(message, type) {
  var status = document.getElementById('status');
  var stats = document.getElementById('stats').outerHTML;
  status.innerHTML = '<span class="' + type + '">' + escapeHtml(message) + '</span>' + stats;
}

function updateStats() {
  var text = document.getElementById('input').value;
  var lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  var bytes = new Blob([text]).size;
  document.getElementById('stats').textContent = 'Characters: ' + text.length + ' | Lines: ' + lines + ' | Bytes: ' + bytes;
}

function handleInputChange() {
  updateStats();
  saveLastInput();
  markGeneratedOutputsStale();
  scheduleAutoFormat();
}

function scheduleAutoFormat() {
  clearTimeout(autoFormatTimer);
  autoFormatTimer = setTimeout(function() {
    formatJson();
  }, 150);
}
function showTab(tab) {
  var output = document.getElementById('output');
  var sqlOutput = document.getElementById('sqlOutput');
  var modelsOutput = document.getElementById('modelsOutput');
  var schemaOutput = document.getElementById('schemaOutput');
  var jsonPathOutput = document.getElementById('jsonPathOutput');
  var convertedOutput = document.getElementById('convertedOutput');
  var jwtOutput = document.getElementById('jwtOutput');
  var graphOutput = document.getElementById('graphOutput');
  var tree = document.getElementById('tree');
  var formattedTab = document.getElementById('formattedTab');
  var treeTab = document.getElementById('treeTab');
  var sqlTab = document.getElementById('sqlTab');
  var modelsTab = document.getElementById('modelsTab');
  var schemaTab = document.getElementById('schemaTab');
  var jsonPathTab = document.getElementById('jsonPathTab');
  var convertedTab = document.getElementById('convertedTab');
  var graphTab = document.getElementById('graphTab');
  var jwtTab = document.getElementById('jwtTab');
  output.classList.add('hidden');
  sqlOutput.classList.add('hidden');
  modelsOutput.classList.add('hidden');
  schemaOutput.classList.add('hidden');
  jsonPathOutput.classList.add('hidden');
  convertedOutput.classList.add('hidden');
  jwtOutput.classList.add('hidden');
  graphOutput.classList.add('hidden');
  tree.classList.add('hidden');
  formattedTab.classList.remove('active');
  treeTab.classList.remove('active');
  sqlTab.classList.remove('active');
  modelsTab.classList.remove('active');
  schemaTab.classList.remove('active');
  jsonPathTab.classList.remove('active');
  convertedTab.classList.remove('active');
  graphTab.classList.remove('active');
  jwtTab.classList.remove('active');
  if (tab === 'tree') {
    tree.classList.remove('hidden');
    treeTab.classList.add('active');
    document.getElementById('outputHint').textContent = 'Tree View';
    if (!hasValidJson) {
      tree.innerHTML = '<span class="warning">Validate JSON first to generate tree view.</span>';
    }
  } else if (tab === 'sql') {
    sqlOutput.classList.remove('hidden');
    sqlTab.classList.add('active');
    activeOutputId = 'sqlOutput';
    document.getElementById('outputHint').textContent = 'SQL DDL';
    if (!sqlOutput.textContent) {
      sqlOutput.textContent = 'Click Generate SQL to create SQL DDL from valid JSON.';
    }
  } else if (tab === 'models') {
    modelsOutput.classList.remove('hidden');
    modelsTab.classList.add('active');
    activeOutputId = 'modelsOutput';
    document.getElementById('outputHint').textContent = 'Language Models';
    if (!modelsOutput.textContent) {
      modelsOutput.textContent = 'Click Generate Models to create boilerplate from valid JSON.';
    }
  } else if (tab === 'schema') {
    schemaOutput.classList.remove('hidden');
    schemaTab.classList.add('active');
    activeOutputId = 'schemaOutput';
    document.getElementById('outputHint').textContent = 'JSON Schema';
    if (!schemaOutput.textContent) {
      schemaOutput.textContent = 'Click Generate Schema to create JSON Schema from valid JSON.';
    }
  } else if (tab === 'jsonpath') {
    jsonPathOutput.classList.remove('hidden');
    jsonPathTab.classList.add('active');
    activeOutputId = 'jsonPathOutput';
    document.getElementById('outputHint').textContent = 'JSONPath Result';
    if (!jsonPathOutput.textContent) {
      jsonPathOutput.textContent = 'Enter a JSONPath expression and click Run JSONPath.';
    }
  } else if (tab === 'converted') {
    convertedOutput.classList.remove('hidden');
    convertedTab.classList.add('active');
    activeOutputId = 'convertedOutput';
    document.getElementById('outputHint').textContent = 'Converted Output';
    if (!convertedOutput.textContent) {
      convertedOutput.textContent = 'Click CSV or YAML to convert valid JSON.';
    }
  } else if (tab === 'graph') {
    graphOutput.classList.remove('hidden');
    graphTab.classList.add('active');
    activeOutputId = 'graphOutput';
    document.getElementById('outputHint').textContent = 'Graph View';
    if (!graphOutput.innerHTML) {
      graphOutput.innerHTML = '<span class="warning">Click Graph to generate a visual view.</span>';
    }
  } else if (tab === 'jwt') {
    jwtOutput.classList.remove('hidden');
    jwtTab.classList.add('active');
    activeOutputId = 'jwtOutput';
    document.getElementById('outputHint').textContent = 'JWT Decoder';
    if (!jwtOutput.textContent) {
      jwtOutput.textContent = 'Paste a JWT and click JWT.';
    }
  } else {
    output.classList.remove('hidden');
    formattedTab.classList.add('active');
    activeOutputId = 'output';
    document.getElementById('outputHint').textContent = 'Formatted JSON';
  }
}

function expandTree() {
  document.querySelectorAll('#tree details').forEach(function(details) {
    details.open = true;
  });
  showTab('tree');
}

function collapseTree() {
  document.querySelectorAll('#tree details').forEach(function(details) {
    details.open = false;
  });
  showTab('tree');
}

function copySelectedTreePath() {
  var selected = document.querySelector('#tree .tree-selected');
  if (!selected) {
    setStatus('Select a tree row first', 'warning');
    return;
  }
  var path = selected.getAttribute('data-path') || '$';
  navigator.clipboard.writeText(path).then(function() {
    setStatus('Copied path: ' + path, 'valid');
  }).catch(function() {
    setStatus('Tree path: ' + path, 'warning');
  });
}

function saveLastInput() {
  try {
    localStorage.setItem(STORAGE_KEY, document.getElementById('input').value);
  } catch (e) {}
}

function restoreLastInput() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      document.getElementById('input').value = saved;
      formatJson();
    }
  } catch (e) {}
}

function clearSavedInput() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    setStatus('Saved input cleared from this browser', 'valid');
  } catch (e) {
    setStatus('Could not clear saved input: ' + e.message, 'warning');
  }
}

function markGeneratedOutputsStale() {
  document.getElementById('sqlOutput').textContent = 'Input changed. Click SQL to refresh this output.';
  document.getElementById('modelsOutput').textContent = 'Input changed. Click Models to refresh this output.';
  document.getElementById('schemaOutput').textContent = 'Input changed. Click Schema to refresh this output.';
  document.getElementById('jsonPathOutput').textContent = 'Input changed. Click Run JSONPath to refresh this output.';
  document.getElementById('convertedOutput').textContent = 'Input changed. Click CSV or YAML to refresh this output.';
  document.getElementById('jwtOutput').textContent = 'Input changed. Click JWT to decode the current input.';
  document.getElementById('graphOutput').innerHTML = '<span class="warning">Input changed. Click Graph to refresh this output.</span>';
}

function filterTree() {
  var query = document.getElementById('treeSearch').value.trim().toLowerCase();
  var tree = document.getElementById('tree');
  var items = tree.querySelectorAll('li');
  items.forEach(function(item) {
    item.classList.remove('tree-hidden', 'tree-match');
    if (!query) return;
    var match = item.textContent.toLowerCase().indexOf(query) !== -1;
    item.classList.toggle('tree-hidden', !match);
    item.classList.toggle('tree-match', match);
    if (match) {
      var details = item.closest('details');
      while (details) {
        details.open = true;
        details = details.parentElement ? details.parentElement.closest('details') : null;
      }
    }
  });
}

