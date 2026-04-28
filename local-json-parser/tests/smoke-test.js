const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const scriptDir = path.join(root, 'js');

const ids = [
  'formatButton', 'minifyButton', 'escapeButton', 'unescapeButton', 'copyButton',
  'downloadButton', 'clearButton', 'sampleButton', 'generateSqlButton',
  'generateModelsButton', 'generateBothButton',
  'jsonToCsvButton', 'jsonToYamlButton', 'decodeJwtButton',
  'graphButton', 'expandTreeButton', 'collapseTreeButton', 'copyTreePathButton',
  'indentSize', 'fileInput', 'input', 'formattedTab', 'treeTab', 'sqlTab', 'modelsTab',
  'schemaTab', 'jsonPathTab', 'graphTab', 'convertedTab', 'jwtTab',
  'status', 'stats', 'output', 'sqlOutput', 'modelsOutput',
  'schemaOutput', 'jsonPathOutput', 'convertedOutput', 'jwtOutput', 'graphOutput', 'tree', 'outputHint',
  'rootName', 'sqlDialect', 'modelLanguage', 'treeSearch', 'jsonPathInput',
  'jsonPathButton', 'clearStorageButton', 'dropZone', 'resizeHandle', 'graphViewport'
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
    style: {},
    outerHTML: id === 'stats' ? '<span class="stats" id="stats">Characters: 0</span>' : '',
    offsetWidth: id === 'resizeHandle' ? 12 : 0,
    classList: createClassList(),
    setAttribute(name, value) { this[name] = value; },
    getAttribute(name) { return this[name]; },
    setPointerCapture() {},
    addEventListener(type, fn) { this[`on${type}`] = fn; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    contains() { return true; },
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
  querySelector(selector) {
    if (selector === '.layout') return elements.layout || (elements.layout = {
      style: {},
      classList: createClassList(),
      getBoundingClientRect: () => ({ left: 0, width: 1000 }),
      setAttribute(name, value) { this[name] = value; },
      getAttribute(name) { return this[name]; }
    });
    return null;
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
global.window.matchMedia = () => ({ matches: false });

[
  'constants.js',
  'ui.js',
  'tree-view.js',
  'parser.js',
  'schema.js',
  'sql-generator.js',
  'model-generator.js',
  'typescript-generator.js',
  'json-schema.js',
  'jsonpath.js',
  'converters.js',
  'graph-view.js',
  'jwt.js',
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

elements.input.value = JSON.stringify([{ name: 'A' }, { name: 'B' }]);
unescapeJsonString();
if (elements.output.textContent.includes('[object Object]')) throw new Error('Unescape collapsed objects to [object Object]');
if (!elements.output.textContent.includes('"name"')) throw new Error('Unescape did not format object/array JSON');
elements.input.value = JSON.stringify({
  name: 'Varun',
  active: true,
  orders: [{ items: [{ sku: 'A1', qty: 2 }] }]
});

generateSql();
if (!elements.sqlOutput.textContent.includes('CREATE TABLE')) throw new Error('SQL output missing CREATE TABLE');

elements.input.value = JSON.stringify({ changed: true });
handleInputChange();
if (!elements.sqlOutput.textContent.includes('Input changed')) throw new Error('SQL output was not marked stale after input change');
if (!elements.modelsOutput.textContent.includes('Input changed')) throw new Error('Models output was not marked stale after input change');
elements.input.value = JSON.stringify({
  name: 'Varun',
  active: true,
  orders: [{ items: [{ sku: 'A1', qty: 2 }] }]
});
formatJson();

generateModels();
if (!elements.modelsOutput.textContent.includes('class')) throw new Error('Model output missing Python class');

elements.modelLanguage.value = 'typescript';
generateModels();
if (!elements.modelsOutput.textContent.includes('export interface')) throw new Error('TypeScript model output missing interface');
elements.modelLanguage.value = 'python';

elements.schemaTab.onclick();
if (!elements.schemaOutput.textContent.includes('"$schema"')) throw new Error('JSON Schema output missing $schema');

runJsonPath();
if (!elements.jsonPathOutput.textContent.includes('"sku"')) throw new Error('JSONPath output missing expected match');

convertJsonToCsv();
if (!elements.convertedOutput.textContent.includes('orders')) throw new Error('CSV output missing flattened headers');

convertJsonToYaml();
if (!elements.convertedOutput.textContent.includes('orders:')) throw new Error('YAML output missing expected key');

generateGraphView();
if (!elements.graphOutput.innerHTML.includes('graph-svg')) throw new Error('Graph output missing SVG');
if (!elements.graphOutput.innerHTML.includes('Graph view generated') && !elements.graphOutput.innerHTML.includes('graph-toolbar')) throw new Error('Graph output missing toolbar');

elements.input.value = [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ sub: '123', name: 'Varun' })).toString('base64url'),
  'signature'
].join('.');
global.atob = (value) => Buffer.from(value, 'base64').toString('binary');
decodeJwt();
if (!elements.jwtOutput.textContent.includes('"payload"')) throw new Error('JWT output missing payload');

if (!window.JsonParserApp || typeof window.JsonParserApp.format !== 'function') {
  throw new Error('JsonParserApp namespace was not exposed');
}

console.log('smoke ok');
