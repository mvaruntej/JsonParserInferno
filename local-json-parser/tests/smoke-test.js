const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const scriptDir = path.join(root, 'js');

const ids = [
  'formatButton', 'minifyButton', 'escapeButton', 'unescapeButton', 'copyButton',
  'downloadButton', 'clearButton', 'sampleButton', 'generateSqlButton',
  'generateModelsButton', 'generateBothButton', 'generateSchemaButton', 'indentSize',
  'fileInput', 'input', 'formattedTab', 'treeTab', 'sqlTab', 'modelsTab',
  'schemaTab', 'jsonPathTab', 'status', 'stats', 'output', 'sqlOutput',
  'modelsOutput', 'schemaOutput', 'jsonPathOutput', 'tree', 'outputHint',
  'rootName', 'sqlDialect', 'modelLanguage', 'treeSearch', 'jsonPathInput',
  'jsonPathButton', 'clearStorageButton', 'dropZone'
];

function createClassList() {
  return {
    values: new Set(),
    add(...names) { names.forEach((name) => this.values.add(name)); },
    remove(...names) { names.forEach((name) => this.values.delete(name)); },
    toggle(name, force) {
      if (force === undefined ? !this.values.has(name) : force) this.values.add(name);
      else this.values.delete(name);
    }
  };
}

const elements = {};
ids.forEach((id) => {
  elements[id] = {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    outerHTML: id === 'stats' ? '<span class="stats" id="stats">Characters: 0</span>' : '',
    classList: createClassList(),
    addEventListener(type, fn) { this[`on${type}`] = fn; },
    querySelectorAll() { return []; },
    closest() { return null; }
  };
});

elements.indentSize.value = '2';
elements.rootName.value = 'api_response';
elements.sqlDialect.value = 'postgres';
elements.modelLanguage.value = 'python';
elements.jsonPathInput.value = '$.orders[0].items';

global.window = {};
global.document = {
  getElementById(id) {
    if (!elements[id]) throw new Error(`Missing fake element ${id}`);
    return elements[id];
  },
  addEventListener(type, fn) {
    if (type === 'DOMContentLoaded') fn();
  },
  body: { appendChild() {}, removeChild() {} }
};
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.Blob = function Blob(parts) {
  this.size = parts.join('').length;
};
global.URL = { createObjectURL: () => 'blob:test', revokeObjectURL() {} };
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; }
};

[
  'constants.js',
  'ui.js',
  'tree-view.js',
  'parser.js',
  'schema.js',
  'sql-generator.js',
  'model-generator.js',
  'json-schema.js',
  'jsonpath.js',
  'file-actions.js',
  'app.js'
].forEach((file) => {
  vm.runInThisContext(fs.readFileSync(path.join(scriptDir, file), 'utf8'), { filename: file });
});

elements.input.value = JSON.stringify({
  name: 'Varun',
  active: true,
  orders: [{ items: [{ sku: 'A1', qty: 2 }] }]
});

formatJson();
if (!elements.output.textContent.includes('"Varun"')) throw new Error('Formatted output missing expected data');

generateSql();
if (!elements.sqlOutput.textContent.includes('CREATE TABLE')) throw new Error('SQL output missing CREATE TABLE');

generateModels();
if (!elements.modelsOutput.textContent.includes('class')) throw new Error('Model output missing Python class');

generateJsonSchema();
if (!elements.schemaOutput.textContent.includes('"$schema"')) throw new Error('JSON Schema output missing $schema');

runJsonPath();
if (!elements.jsonPathOutput.textContent.includes('"sku"')) throw new Error('JSONPath output missing expected match');

if (!window.JsonParserApp || typeof window.JsonParserApp.format !== 'function') {
  throw new Error('JsonParserApp namespace was not exposed');
}

console.log('smoke ok');
