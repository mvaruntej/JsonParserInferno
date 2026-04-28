function parseInput() {
  var text = document.getElementById('input').value.trim();
  if (!text) {
    throw new Error('Input is empty. Paste JSON first.');
  }
  return JSON.parse(text);
}

function formatJson() {
  var rawText = document.getElementById('input').value;
  if (!rawText.trim()) {
    currentJson = null;
    document.getElementById('output').textContent = '';
    document.getElementById('sqlOutput').textContent = '';
    document.getElementById('modelsOutput').textContent = '';
    document.getElementById('tree').innerHTML = '';
    setStatus('Paste JSON and click Validate / Format.', 'warning');
    updateStats();
    showTab('formatted');
    return;
  }

  try {
    currentJson = parseInput();
    var formatted = JSON.stringify(currentJson, null, getIndent());
    document.getElementById('output').textContent = formatted;
    document.getElementById('tree').innerHTML = renderTree(currentJson);
    setStatus('Valid JSON', 'valid');
    showTab('formatted');
  } catch (e) {
    currentJson = null;
    document.getElementById('output').textContent = 'Invalid JSON:\n' + e.message + '\n\nTip: Check missing commas, quotes, brackets, or extra trailing commas.';
    document.getElementById('tree').innerHTML = '';
    setStatus('Invalid JSON: ' + e.message, 'invalid');
    showTab('formatted');
  }
  updateStats();
}

function minifyJson() {
  try {
    currentJson = parseInput();
    var minified = JSON.stringify(currentJson);
    document.getElementById('output').textContent = minified;
    document.getElementById('tree').innerHTML = renderTree(currentJson);
    setStatus('Valid JSON - minified successfully', 'valid');
    showTab('formatted');
  } catch (e) {
    document.getElementById('output').textContent = 'Invalid JSON:\n' + e.message;
    setStatus('Invalid JSON: ' + e.message, 'invalid');
    showTab('formatted');
  }
  updateStats();
}

function escapeJsonString() {
  var text = document.getElementById('input').value;
  document.getElementById('output').textContent = JSON.stringify(text);
  setStatus('Input converted to escaped JSON string', 'valid');
  showTab('formatted');
  updateStats();
}

function unescapeJsonString() {
  try {
    var text = document.getElementById('input').value.trim();
    document.getElementById('output').textContent = JSON.parse(text);
    setStatus('Escaped JSON string converted back to normal text', 'valid');
  } catch (e) {
    document.getElementById('output').textContent = 'Invalid escaped JSON string:\n' + e.message + '\n\nExample input: "Hello\\nWorld"';
    setStatus('Invalid escaped JSON string: ' + e.message, 'invalid');
  }
  showTab('formatted');
  updateStats();
}

