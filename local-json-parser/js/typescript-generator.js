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
