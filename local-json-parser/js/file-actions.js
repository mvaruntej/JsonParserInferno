function copyOutput() {
  var text = document.getElementById(activeOutputId).textContent;
  if (!text) {
    setStatus('No output to copy', 'warning');
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    setStatus('Output copied to clipboard', 'valid');
  }).catch(function() {
    setStatus('Clipboard copy failed. Select and copy manually.', 'warning');
  });
}

function downloadOutput() {
  var element = document.getElementById(activeOutputId);
  var text = activeOutputId === 'graphOutput' ? element.innerHTML : element.textContent;
  if (!text) {
    setStatus('No output to download', 'warning');
    return;
  }
  var fileInfo = getDownloadInfo();
  var blob = new Blob([text], { type: fileInfo.type });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileInfo.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setStatus('Download started', 'valid');
}

function downloadNamedOutput(outputId, fileName, type) {
  var text = document.getElementById(outputId).textContent;
  if (!text) {
    setStatus('No output to download', 'warning');
    return;
  }
  var blob = new Blob([text], { type: type || 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setStatus('Download started: ' + fileName, 'valid');
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('sqlOutput').textContent = '';
  document.getElementById('modelsOutput').textContent = '';
  document.getElementById('schemaOutput').textContent = '';
  document.getElementById('jsonPathOutput').textContent = '';
  document.getElementById('convertedOutput').textContent = '';
  document.getElementById('jwtOutput').textContent = '';
  document.getElementById('graphOutput').innerHTML = '';
  document.getElementById('tree').innerHTML = '';
  currentJson = null;
  hasValidJson = false;
  saveLastInput();
  setStatus('Cleared. Paste JSON and click Validate / Format.', 'warning');
  updateStats();
  showTab('formatted');
}

function loadSample() {
  document.getElementById('input').value = JSON.stringify({
    name: 'Local JSON Parser',
    version: '1.0',
    features: ['validate', 'format', 'minify', 'tree view', 'download'],
    offline: true,
    user: {
      id: 101,
      name: 'Varun',
      email: null,
      role: 'developer',
      active: true,
      created_at: '2026-04-27'
    },
    orders: [
      { id: 5001, total: 1499.5, status: 'paid', items: [{ sku: 'COURSE-1', qty: 1 }] },
      { id: 5002, total: 799, status: 'pending', items: [{ sku: 'LAB-2', qty: 2 }] }
    ],
    score: 99.5,
    value: null
  }, null, 2);
  formatJson();
}

function loadFile(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
      reader.onload = function(e) {
    document.getElementById('input').value = e.target.result;
    saveLastInput();
    updateStats();
    formatJson();
  };
  reader.readAsText(file);
}

function loadDroppedFile(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('input').value = e.target.result;
    saveLastInput();
    updateStats();
    formatJson();
  };
  reader.readAsText(file);
}

function getDownloadInfo() {
  if (activeOutputId === 'sqlOutput') return { name: 'schema.sql', type: 'text/sql' };
  if (activeOutputId === 'modelsOutput') {
    var language = document.getElementById('modelLanguage').value;
    if (language === 'java') return { name: 'Models.java', type: 'text/plain' };
    if (language === 'go') return { name: 'models.go', type: 'text/plain' };
    if (language === 'typescript') return { name: 'models.ts', type: 'text/plain' };
    return { name: 'models.py', type: 'text/plain' };
  }
  if (activeOutputId === 'schemaOutput') return { name: 'json-schema.json', type: 'application/schema+json' };
  if (activeOutputId === 'jsonPathOutput') return { name: 'jsonpath-result.json', type: 'application/json' };
  if (activeOutputId === 'convertedOutput') return { name: 'converted-output.txt', type: 'text/plain' };
  if (activeOutputId === 'jwtOutput') return { name: 'decoded-jwt.json', type: 'application/json' };
  if (activeOutputId === 'graphOutput') return { name: 'json-graph.svg', type: 'image/svg+xml' };
  return { name: 'formatted-json.json', type: 'application/json' };
}


