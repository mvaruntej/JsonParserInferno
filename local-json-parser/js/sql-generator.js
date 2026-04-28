function generateSql() {
  try {
    currentJson = parseInput();
    var schema = buildSchema(currentJson, getRootName());
    var sql = buildSql(schema, document.getElementById('sqlDialect').value);
    document.getElementById('sqlOutput').textContent = sql;
    setStatus('SQL DDL generated for ' + schema.tables.length + ' table(s)', 'valid');
    showTab('sql');
  } catch (e) {
    document.getElementById('sqlOutput').textContent = 'Could not generate SQL:\n' + e.message;
    setStatus('SQL generation failed: ' + e.message, 'invalid');
    showTab('sql');
  }
  updateStats();
}
function buildSql(schema, dialect) {
  return schema.tables.map(function(table) {
    var lines = [];
    lines.push('CREATE TABLE ' + table.name + ' (');
    lines.push('  ' + idColumn(dialect) + ',');
    if (table.parentName) {
      lines.push('  parent_id ' + intType(dialect) + ' REFERENCES ' + table.parentName + '(id),');
    }
    table.columns.forEach(function(column) {
      lines.push('  ' + column.name + ' ' + sqlType(column.genericType, dialect, column.isArray) + (column.nullable ? '' : ' NOT NULL') + ',');
    });
    var lastIndex = lines.length - 1;
    lines[lastIndex] = lines[lastIndex].replace(/,$/, '');
    lines.push(');');
    return lines.join('\n');
  }).join('\n\n');
}
function sqlType(type, dialect, isArray) {
  if (isArray) {
    if (dialect === 'postgres') return 'JSONB';
    return 'TEXT';
  }
  var map = {
    postgres: { string: 'VARCHAR(255)', integer: 'INTEGER', float: 'DOUBLE PRECISION', boolean: 'BOOLEAN', date: 'DATE', datetime: 'TIMESTAMP', json: 'JSONB' },
    mysql: { string: 'VARCHAR(255)', integer: 'INT', float: 'DOUBLE', boolean: 'BOOLEAN', date: 'DATE', datetime: 'DATETIME', json: 'JSON' },
    sqlite: { string: 'TEXT', integer: 'INTEGER', float: 'REAL', boolean: 'INTEGER', date: 'TEXT', datetime: 'TEXT', json: 'TEXT' }
  };
  return (map[dialect][type] || map[dialect].string);
}

function idColumn(dialect) {
  if (dialect === 'mysql') return 'id INT AUTO_INCREMENT PRIMARY KEY';
  if (dialect === 'sqlite') return 'id INTEGER PRIMARY KEY AUTOINCREMENT';
  return 'id SERIAL PRIMARY KEY';
}
function intType(dialect) {
  return dialect === 'sqlite' ? 'INTEGER' : 'INT';
}

