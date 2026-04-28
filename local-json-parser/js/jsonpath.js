function runJsonPath() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    var expression = document.getElementById('jsonPathInput').value.trim();
    if (!expression) throw new Error('Enter a JSONPath expression.');
    var result = evaluateJsonPath(currentJson, expression);
    document.getElementById('jsonPathOutput').textContent = JSON.stringify(result, null, getIndent());
    setStatus('JSONPath returned ' + result.length + ' result(s)', 'valid');
    showTab('jsonpath');
  } catch (e) {
    document.getElementById('jsonPathOutput').textContent = 'JSONPath failed:\n' + e.message;
    setStatus('JSONPath failed: ' + e.message, 'invalid');
    showTab('jsonpath');
  }
  updateStats();
}

function evaluateJsonPath(root, expression) {
  var tokens = tokenizeJsonPath(expression);
  var results = [root];
  tokens.forEach(function(token) {
    var next = [];
    results.forEach(function(value) {
      if (token.type === 'property') {
        if (value !== null && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, token.value)) {
          next.push(value[token.value]);
        }
      } else if (token.type === 'index') {
        if (Array.isArray(value) && value[token.value] !== undefined) next.push(value[token.value]);
      } else if (token.type === 'wildcard') {
        if (Array.isArray(value)) next = next.concat(value);
        else if (value !== null && typeof value === 'object') {
          Object.keys(value).forEach(function(key) { next.push(value[key]); });
        }
      }
    });
    results = next;
  });
  return results;
}

function tokenizeJsonPath(expression) {
  if (expression.charAt(0) !== '$') throw new Error('JSONPath must start with $.');
  var tokens = [];
  var index = 1;
  while (index < expression.length) {
    var char = expression.charAt(index);
    if (char === '.') {
      index++;
      if (expression.charAt(index) === '*') {
        tokens.push({ type: 'wildcard' });
        index++;
        continue;
      }
      var nameMatch = expression.slice(index).match(/^[A-Za-z_$][\w$-]*/);
      if (!nameMatch) throw new Error('Expected property name after dot.');
      tokens.push({ type: 'property', value: nameMatch[0] });
      index += nameMatch[0].length;
      continue;
    }
    if (char === '[') {
      var end = expression.indexOf(']', index);
      if (end === -1) throw new Error('Missing closing ].');
      var content = expression.slice(index + 1, end).trim();
      if (content === '*') {
        tokens.push({ type: 'wildcard' });
      } else if (/^\d+$/.test(content)) {
        tokens.push({ type: 'index', value: Number(content) });
      } else {
        var quoted = content.match(/^['"](.+)['"]$/);
        if (!quoted) throw new Error('Bracket notation supports indexes, *, or quoted property names.');
        tokens.push({ type: 'property', value: quoted[1] });
      }
      index = end + 1;
      continue;
    }
    throw new Error('Unexpected token "' + char + '".');
  }
  return tokens;
}
