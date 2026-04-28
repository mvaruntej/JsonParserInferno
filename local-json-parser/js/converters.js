function convertJsonToCsv() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    document.getElementById('convertedOutput').textContent = jsonToCsv(currentJson);
    setStatus('JSON converted to CSV', 'valid');
    showTab('converted');
  } catch (e) {
    document.getElementById('convertedOutput').textContent = 'Could not convert to CSV:\n' + e.message;
    setStatus('CSV conversion failed: ' + e.message, 'invalid');
    showTab('converted');
  }
}

function convertJsonToYaml() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    document.getElementById('convertedOutput').textContent = jsonToYaml(currentJson, 0);
    setStatus('JSON converted to YAML', 'valid');
    showTab('converted');
  } catch (e) {
    document.getElementById('convertedOutput').textContent = 'Could not convert to YAML:\n' + e.message;
    setStatus('YAML conversion failed: ' + e.message, 'invalid');
    showTab('converted');
  }
}

function jsonToCsv(json) {
  var rows = Array.isArray(json) ? json : [json];
  if (!rows.every(isPlainObject)) {
    throw new Error('CSV export expects an object or an array of objects.');
  }
  var flatRows = rows.map(function(row) { return flattenObject(row, ''); });
  var headers = [];
  flatRows.forEach(function(row) {
    Object.keys(row).forEach(function(key) {
      if (headers.indexOf(key) === -1) headers.push(key);
    });
  });
  return [headers.join(',')].concat(flatRows.map(function(row) {
    return headers.map(function(header) {
      return csvEscape(row[header]);
    }).join(',');
  })).join('\n');
}

function flattenObject(value, prefix) {
  var output = {};
  Object.keys(value).forEach(function(key) {
    var path = prefix ? prefix + '.' + key : key;
    var item = value[key];
    if (isPlainObject(item)) {
      Object.assign(output, flattenObject(item, path));
    } else if (Array.isArray(item)) {
      output[path] = JSON.stringify(item);
    } else {
      output[path] = item;
    }
  });
  return output;
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  var text = String(value);
  if (/[",\n\r]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function jsonToYaml(value, depth) {
  var indent = new Array(depth + 1).join('  ');
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return value.map(function(item) {
      if (isPlainObject(item) || Array.isArray(item)) {
        return indent + '- ' + jsonToYaml(item, depth + 1).trimStart();
      }
      return indent + '- ' + yamlScalar(item);
    }).join('\n');
  }
  if (isPlainObject(value)) {
    var keys = Object.keys(value);
    if (!keys.length) return '{}';
    return keys.map(function(key) {
      var item = value[key];
      if (isPlainObject(item) || Array.isArray(item)) {
        return indent + key + ':\n' + jsonToYaml(item, depth + 1);
      }
      return indent + key + ': ' + yamlScalar(item);
    }).join('\n');
  }
  return yamlScalar(value);
}

function yamlScalar(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}
