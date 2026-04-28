function bindEvents() {
  document.getElementById('formatButton').addEventListener('click', formatJson);
  document.getElementById('minifyButton').addEventListener('click', minifyJson);
  document.getElementById('escapeButton').addEventListener('click', escapeJsonString);
  document.getElementById('unescapeButton').addEventListener('click', unescapeJsonString);
  document.getElementById('copyButton').addEventListener('click', copyOutput);
  document.getElementById('downloadButton').addEventListener('click', downloadOutput);
  document.getElementById('clearButton').addEventListener('click', clearAll);
  document.getElementById('sampleButton').addEventListener('click', loadSample);
  document.getElementById('generateSqlButton').addEventListener('click', generateSql);
  document.getElementById('generateModelsButton').addEventListener('click', generateModels);
  document.getElementById('generateBothButton').addEventListener('click', generateBoth);
  document.getElementById('generateSchemaButton').addEventListener('click', generateJsonSchema);
  document.getElementById('indentSize').addEventListener('change', formatJson);
  document.getElementById('fileInput').addEventListener('change', loadFile);
  document.getElementById('input').addEventListener('input', handleInputChange);
  document.getElementById('treeSearch').addEventListener('input', filterTree);
  document.getElementById('jsonPathButton').addEventListener('click', runJsonPath);
  document.getElementById('jsonPathInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') runJsonPath();
  });
  document.getElementById('clearStorageButton').addEventListener('click', clearSavedInput);
  document.getElementById('formattedTab').addEventListener('click', function() { showTab('formatted'); });
  document.getElementById('treeTab').addEventListener('click', function() { showTab('tree'); });
  document.getElementById('sqlTab').addEventListener('click', function() { showTab('sql'); });
  document.getElementById('modelsTab').addEventListener('click', function() { showTab('models'); });
  document.getElementById('schemaTab').addEventListener('click', function() { showTab('schema'); });
  document.getElementById('jsonPathTab').addEventListener('click', function() { showTab('jsonpath'); });
  document.addEventListener('keydown', handleKeyboardShortcuts);
  bindDropZone();
  restoreLastInput();
  exposeNamespace();
}

function handleKeyboardShortcuts(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    formatJson();
  } else if (event.key.toLowerCase() === 'l') {
    event.preventDefault();
    clearAll();
  }
}

function bindDropZone() {
  var dropZone = document.getElementById('dropZone');
  ['dragenter', 'dragover'].forEach(function(eventName) {
    dropZone.addEventListener(eventName, function(event) {
      event.preventDefault();
      dropZone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(function(eventName) {
    dropZone.addEventListener(eventName, function(event) {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
    });
  });
  dropZone.addEventListener('drop', function(event) {
    loadDroppedFile(event.dataTransfer.files[0]);
  });
}

function exposeNamespace() {
  window.JsonParserApp = {
    format: formatJson,
    minify: minifyJson,
    clear: clearAll,
    parseInput: parseInput,
    buildSchema: buildSchema,
    buildSql: buildSql,
    buildModels: buildModels,
    buildJsonSchema: buildJsonSchema,
    evaluateJsonPath: evaluateJsonPath
  };
}

document.addEventListener('DOMContentLoaded', bindEvents);
