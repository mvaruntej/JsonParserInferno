function getRootName() {
  return toSnakeCase(document.getElementById('rootName').value || 'api_response');
}

function buildSchema(json, rootName) {
  var tables = [];
  var tableMap = {};

  function ensureTable(name, parentName) {
    var tableName = uniqueTableName(toSnakeCase(name), tableMap);
    if (!tableMap[tableName]) {
      tableMap[tableName] = {
        name: tableName,
        className: toPascalCase(tableName),
        parentName: parentName || null,
        columns: []
      };
      tables.push(tableMap[tableName]);
    }
    return tableMap[tableName];
  }

  function addColumn(table, name, genericType, nullable, sourceKey, isArray) {
    var columnName = sanitizeSqlName(toSnakeCase(name));
    if (columnName === 'id' || columnName === 'parent_id') {
      columnName = columnName + '_value';
    }
    var existing = table.columns.find(function(col) { return col.name === columnName; });
    if (existing) {
      existing.genericType = mergeTypes(existing.genericType, genericType);
      existing.nullable = existing.nullable || nullable;
      existing.isArray = existing.isArray || isArray;
      return;
    }
    table.columns.push({
      name: columnName,
      sourceKey: sourceKey || name,
      genericType: genericType,
      nullable: !!nullable,
      isArray: !!isArray
    });
  }

  function analyzeObject(samples, tableName, parentName) {
    var table = ensureTable(tableName, parentName);
    var keys = {};
    samples.forEach(function(sample) {
      if (sample && typeof sample === 'object' && !Array.isArray(sample)) {
        Object.keys(sample).forEach(function(key) { keys[key] = true; });
      }
    });

    Object.keys(keys).forEach(function(key) {
      var values = samples.map(function(sample) {
        return sample && Object.prototype.hasOwnProperty.call(sample, key) ? sample[key] : null;
      });
      var nonNull = values.filter(function(value) { return value !== null && value !== undefined; });
      if (!nonNull.length) {
        addColumn(table, key, 'string', true, key, false);
        return;
      }

      if (nonNull.some(function(value) { return Array.isArray(value); })) {
        var arrayItems = [];
        nonNull.forEach(function(value) {
          if (Array.isArray(value)) {
            arrayItems = arrayItems.concat(value);
          }
        });
        var objectItems = arrayItems.filter(isPlainObject);
        if (objectItems.length) {
          analyzeObject(objectItems, key, table.name);
        } else {
          var arrayType = inferPrimitiveType(arrayItems);
          addColumn(table, key, arrayType === 'null' ? 'json' : arrayType, values.length !== nonNull.length, key, true);
        }
        return;
      }

      if (nonNull.some(isPlainObject)) {
        analyzeObject(nonNull.filter(isPlainObject), key, table.name);
        return;
      }

      addColumn(table, key, inferPrimitiveType(nonNull), values.length !== nonNull.length, key, false);
    });
  }

  if (Array.isArray(json)) {
    var rootObjects = json.filter(isPlainObject);
    if (rootObjects.length) {
      analyzeObject(rootObjects, rootName, null);
    } else {
      var rootTable = ensureTable(rootName, null);
      addColumn(rootTable, 'value', inferPrimitiveType(json), false, 'value', true);
    }
  } else if (isPlainObject(json)) {
    analyzeObject([json], rootName, null);
  } else {
    var primitiveTable = ensureTable(rootName, null);
    addColumn(primitiveTable, 'value', inferPrimitiveType([json]), false, 'value', false);
  }

  return { rootName: rootName, tables: tables };
}
function inferPrimitiveType(values) {
  var types = {};
  values.forEach(function(value) {
    if (value === null || value === undefined) {
      types.null = true;
    } else if (typeof value === 'boolean') {
      types.boolean = true;
    } else if (typeof value === 'number') {
      types[Number.isInteger(value) ? 'integer' : 'float'] = true;
    } else if (typeof value === 'string') {
      if (isDateTime(value)) types.datetime = true;
      else if (isDate(value)) types.date = true;
      else types.string = true;
    } else {
      types.json = true;
    }
  });
  if (types.json) return 'json';
  if (types.string) return 'string';
  if (types.datetime) return types.date ? 'string' : 'datetime';
  if (types.date) return 'date';
  if (types.float) return 'float';
  if (types.integer) return 'integer';
  if (types.boolean) return 'boolean';
  return 'null';
}
function mergeTypes(left, right) {
  if (left === right) return left;
  if (left === 'null') return right;
  if (right === 'null') return left;
  if ((left === 'integer' && right === 'float') || (left === 'float' && right === 'integer')) return 'float';
  if ((left === 'date' && right === 'datetime') || (left === 'datetime' && right === 'date')) return 'datetime';
  return 'string';
}
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isDateTime(value) {
  return /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2})?/.test(value);
}

function toSnakeCase(value) {
  var text = String(value || 'field')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  if (!text) text = 'field';
  if (/^\d/.test(text)) text = 'field_' + text;
  return text;
}

function toCamelCase(value) {
  var pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toPascalCase(value) {
  return toSnakeCase(value).split('_').map(function(part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
}

function sanitizeSqlName(name) {
  return SQL_RESERVED[name] ? name + '_field' : name;
}

function sanitizeIdentifier(name, reserved) {
  var lower = String(name).toLowerCase();
  return reserved[lower] ? name + 'Field' : name;
}

function uniqueTableName(name, tableMap) {
  var cleanName = sanitizeSqlName(name);
  if (!tableMap[cleanName]) return cleanName;
  var index = 2;
  while (tableMap[cleanName + '_' + index]) index++;
  return cleanName + '_' + index;
}

