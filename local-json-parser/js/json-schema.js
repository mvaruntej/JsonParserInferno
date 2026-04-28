function generateJsonSchema() {
  try {
    currentJson = parseInput();
    hasValidJson = true;
    var schema = buildJsonSchema(currentJson, getRootName());
    document.getElementById('schemaOutput').textContent = JSON.stringify(schema, null, getIndent());
    setStatus('JSON Schema generated', 'valid');
    showTab('schema');
  } catch (e) {
    document.getElementById('schemaOutput').textContent = 'Could not generate JSON Schema:\n' + e.message;
    setStatus('JSON Schema generation failed: ' + e.message, 'invalid');
    showTab('schema');
  }
  updateStats();
}

function buildJsonSchema(value, title) {
  var schema = inferSchema(value);
  schema.$schema = 'https://json-schema.org/draft/2020-12/schema';
  schema.title = toPascalCase(title || 'Root');
  return orderSchemaKeys(schema);
}

function inferSchema(value) {
  if (Array.isArray(value)) {
    return inferArraySchema(value);
  }
  if (isPlainObject(value)) {
    var properties = {};
    var required = [];
    Object.keys(value).forEach(function(key) {
      properties[key] = inferSchema(value[key]);
      if (value[key] !== null && value[key] !== undefined) required.push(key);
    });
    var objectSchema = { type: 'object', properties: properties };
    if (required.length) objectSchema.required = required;
    return objectSchema;
  }
  if (value === null) return { type: 'null' };
  if (typeof value === 'boolean') return { type: 'boolean' };
  if (typeof value === 'number') return { type: Number.isInteger(value) ? 'integer' : 'number' };
  if (typeof value === 'string') {
    if (isDateTime(value)) return { type: 'string', format: 'date-time' };
    if (isDate(value)) return { type: 'string', format: 'date' };
    return { type: 'string' };
  }
  return {};
}

function inferArraySchema(values) {
  if (!values.length) return { type: 'array', items: {} };
  var merged = values.map(inferSchema).reduce(mergeJsonSchemas);
  return { type: 'array', items: merged };
}

function mergeJsonSchemas(left, right) {
  if (JSON.stringify(left) === JSON.stringify(right)) return left;
  if (left.type === 'object' && right.type === 'object') return mergeObjectSchemas(left, right);
  if (left.type === 'array' && right.type === 'array') {
    return { type: 'array', items: mergeJsonSchemas(left.items || {}, right.items || {}) };
  }
  var types = [];
  [left.type, right.type].forEach(function(type) {
    if (Array.isArray(type)) types = types.concat(type);
    else if (type) types.push(type);
  });
  return { type: types.filter(function(type, index) { return types.indexOf(type) === index; }) };
}

function mergeObjectSchemas(left, right) {
  var properties = {};
  var keys = {};
  Object.keys(left.properties || {}).forEach(function(key) { keys[key] = true; });
  Object.keys(right.properties || {}).forEach(function(key) { keys[key] = true; });
  Object.keys(keys).forEach(function(key) {
    if (left.properties && right.properties && left.properties[key] && right.properties[key]) {
      properties[key] = mergeJsonSchemas(left.properties[key], right.properties[key]);
    } else {
      properties[key] = (left.properties && left.properties[key]) || (right.properties && right.properties[key]);
    }
  });
  return { type: 'object', properties: properties };
}

function orderSchemaKeys(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema)) return schema.map(orderSchemaKeys);
  var ordered = {};
  ['$schema', 'title', 'type', 'format', 'properties', 'items', 'required'].forEach(function(key) {
    if (schema[key] !== undefined) ordered[key] = orderSchemaKeys(schema[key]);
  });
  Object.keys(schema).forEach(function(key) {
    if (ordered[key] === undefined) ordered[key] = orderSchemaKeys(schema[key]);
  });
  return ordered;
}
