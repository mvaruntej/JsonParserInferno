function generateModels() {
  try {
    currentJson = parseInput();
    var schema = buildSchema(currentJson, getRootName());
    var language = document.getElementById('modelLanguage').value;
    var models = buildModels(schema, language);
    document.getElementById('modelsOutput').textContent = models;
    setStatus(modelLanguageName(language) + ' boilerplate generated for ' + schema.tables.length + ' model(s)', 'valid');
    showTab('models');
  } catch (e) {
    document.getElementById('modelsOutput').textContent = 'Could not generate models:\n' + e.message;
    setStatus('Model generation failed: ' + e.message, 'invalid');
    showTab('models');
  }
  updateStats();
}

function generateBoth() {
  generateSql();
  generateModels();
  setStatus('SQL DDL and model boilerplate generated', 'valid');
}
function buildModels(schema, language) {
  if (language === 'java') return buildJavaModels(schema);
  if (language === 'go') return buildGoModels(schema);
  return buildPythonModels(schema);
}

function buildPythonModels(schema) {
  var imports = 'from dataclasses import dataclass\nfrom datetime import date, datetime\nfrom typing import Any, List, Optional\n\n\n';
  return imports + schema.tables.map(function(table) {
    var lines = ['@dataclass', 'class ' + table.className + ':', '    id: Optional[int] = None'];
    if (table.parentName) lines.push('    parent_id: Optional[int] = None');
    table.columns.forEach(function(column) {
      var fieldName = sanitizeIdentifier(column.name, PY_RESERVED);
      var typeName = pythonType(column);
      lines.push('    ' + fieldName + ': ' + typeName + ' = None');
    });
    return lines.join('\n');
  }).join('\n\n\n');
}

function buildJavaModels(schema) {
  return schema.tables.map(function(table) {
    var lines = ['public class ' + table.className + ' {', '    private Long id;'];
    if (table.parentName) lines.push('    private Long parentId;');
    table.columns.forEach(function(column) {
      lines.push('    private ' + javaType(column) + ' ' + sanitizeIdentifier(toCamelCase(column.name), JAVA_RESERVED) + ';');
    });
    lines.push('}');
    return lines.join('\n');
  }).join('\n\n');
}

function buildGoModels(schema) {
  return schema.tables.map(function(table) {
    var lines = ['type ' + table.className + ' struct {', '    ID *int64 `json:"id,omitempty"`'];
    if (table.parentName) lines.push('    ParentID *int64 `json:"parent_id,omitempty"`');
    table.columns.forEach(function(column) {
      var fieldName = sanitizeIdentifier(toPascalCase(column.name), GO_RESERVED);
      lines.push('    ' + fieldName + ' ' + goType(column) + ' `json:"' + column.sourceKey + ',omitempty"`');
    });
    lines.push('}');
    return lines.join('\n');
  }).join('\n\n');
}
function pythonType(column) {
  var base = { string: 'str', integer: 'int', float: 'float', boolean: 'bool', date: 'date', datetime: 'datetime', json: 'Any' }[column.genericType] || 'str';
  if (column.isArray) base = 'List[' + base + ']';
  return 'Optional[' + base + ']';
}

function javaType(column) {
  var base = { string: 'String', integer: 'Integer', float: 'Double', boolean: 'Boolean', date: 'LocalDate', datetime: 'LocalDateTime', json: 'Object' }[column.genericType] || 'String';
  if (column.isArray) base = 'List<' + base + '>';
  return base;
}

function goType(column) {
  var base = { string: 'string', integer: 'int64', float: 'float64', boolean: 'bool', date: 'string', datetime: 'string', json: 'any' }[column.genericType] || 'string';
  if (column.isArray) return '[]' + base;
  return '*' + base;
}
function modelLanguageName(language) {
  if (language === 'java') return 'Java';
  if (language === 'go') return 'Go';
  return 'Python';
}

