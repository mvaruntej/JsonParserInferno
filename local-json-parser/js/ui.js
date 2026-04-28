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
  document.getElementById('stats').textContent = 'Characters: ' + text.length + ' | Lines: ' + lines;
}

function handleInputChange() {
  updateStats();
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
  var tree = document.getElementById('tree');
  var formattedTab = document.getElementById('formattedTab');
  var treeTab = document.getElementById('treeTab');
  var sqlTab = document.getElementById('sqlTab');
  var modelsTab = document.getElementById('modelsTab');
  output.classList.add('hidden');
  sqlOutput.classList.add('hidden');
  modelsOutput.classList.add('hidden');
  tree.classList.add('hidden');
  formattedTab.classList.remove('active');
  treeTab.classList.remove('active');
  sqlTab.classList.remove('active');
  modelsTab.classList.remove('active');
  if (tab === 'tree') {
    tree.classList.remove('hidden');
    treeTab.classList.add('active');
    document.getElementById('outputHint').textContent = 'Tree View';
    if (!currentJson) {
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
  } else {
    output.classList.remove('hidden');
    formattedTab.classList.add('active');
    activeOutputId = 'output';
    document.getElementById('outputHint').textContent = 'Formatted JSON';
  }
}

