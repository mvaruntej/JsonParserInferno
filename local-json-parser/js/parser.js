function parseInput() {
  var text = document.getElementById('input').value.trim();
  if (!text) {
    throw new Error('Input is empty. Paste JSON first.');
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw enrichJsonError(e, text);
  }
}

function enrichJsonError(error, text) {
  var message = error && error.message ? error.message : 'Invalid JSON';
  var positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return new Error(message);

  var position = Number(positionMatch[1]);
  var location = getLineColumn(text, position);
  var context = getErrorContext(text, position);
  return new Error(message + '\nLine ' + location.line + ', column ' + location.column + '\n\n' + context);
}

function getLineColumn(text, position) {
  var before = text.slice(0, position);
  var lines = before.split(/\r\n|\r|\n/);
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

function getErrorContext(text, position) {
  var start = Math.max(0, position - 50);
  var end = Math.min(text.length, position + 50);
  var snippet = text.slice(start, end).replace(/\r/g, '').replace(/\n/g, '\\n');
  var pointer = new Array(position - start + 1).join(' ') + '^';
  return snippet + '\n' + pointer;
}

function formatJson() {
  var rawText = document.getElementById('input').value;
  if (!rawText.trim()) {
    currentJson = null;
    hasValidJson = false;
    document.getElementById('output').textContent = '';
    document.getElementById('sqlOutput').textContent = '';
    document.getElementById('modelsOutput').textContent = '';
    document.getElementById('schemaOutput').textContent = '';
    document.getElementById('jsonPathOutput').textContent = '';
    document.getElementById('convertedOutput').textContent = '';
    document.getElementById('jwtOutput').textContent = '';
    document.getElementById('graphOutput').innerHTML = '';
    document.getElementById('tree').innerHTML = '';
    setStatus('Paste JSON and click Validate / Format.', 'warning');
    updateStats();
    showTab('formatted');
    return;
  }

  try {
    currentJson = parseInput();
    hasValidJson = true;
    var formatted = JSON.stringify(currentJson, null, getIndent());
    document.getElementById('output').textContent = formatted;
    document.getElementById('tree').innerHTML = renderTree(currentJson);
    filterTree();
    setStatus('Valid JSON', 'valid');
    showTab('formatted');
  } catch (e) {
    currentJson = null;
    hasValidJson = false;
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
    hasValidJson = true;
    var minified = JSON.stringify(currentJson);
    document.getElementById('output').textContent = minified;
    document.getElementById('tree').innerHTML = renderTree(currentJson);
    filterTree();
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
    var parsed = JSON.parse(text);
    document.getElementById('output').textContent = typeof parsed === 'string'
      ? parsed
      : JSON.stringify(parsed, null, getIndent());
    setStatus('Escaped JSON string converted back to normal text', 'valid');
  } catch (e) {
    document.getElementById('output').textContent = 'Invalid escaped JSON string:\n' + e.message + '\n\nExample input: "Hello\\nWorld"';
    setStatus('Invalid escaped JSON string: ' + e.message, 'invalid');
  }
  showTab('formatted');
  updateStats();
}

