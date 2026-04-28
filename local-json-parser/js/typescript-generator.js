function generateTypescript() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    var schema = buildSchema(currentJson, getRootName());
    document.getElementById('typescriptOutput').textContent = buildTypescriptInterfaces(schema);
    setStatus('TypeScript interfaces generated for ' + schema.tables.length + ' interface(s)', 'valid');
    showTab('typescript');
  } catch (e) {
    document.getElementById('typescriptOutput').textContent = 'Could not generate TypeScript:\n' + e.message;
    setStatus('TypeScript generation failed: ' + e.message, 'invalid');
    showTab('typescript');
  }
  updateStats();
}

function buildTypescriptInterfaces(schema) {
  return schema.tables.map(function(table) {
    var lines = ['export interface ' + table.className + ' {', '  id?: number;'];
    if (table.parentName) lines.push('  parentId?: number;');
    table.columns.forEach(function(column) {
      var optional = column.nullable ? '?' : '';
      lines.push('  ' + toCamelCase(column.name) + optional + ': ' + typescriptType(column) + ';');
    });
    lines.push('}');
    return lines.join('\n');
  }).join('\n\n');
}

function typescriptType(column) {
  var base = {
    string: 'string',
    integer: 'number',
    float: 'number',
    boolean: 'boolean',
    date: 'string',
    datetime: 'string',
    json: 'unknown'
  }[column.genericType] || 'string';
  return column.isArray ? base + '[]' : base;
}
