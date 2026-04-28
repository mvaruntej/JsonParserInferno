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
  document.getElementById('jsonToCsvButton').addEventListener('click', convertJsonToCsv);
  document.getElementById('jsonToYamlButton').addEventListener('click', convertJsonToYaml);
  document.getElementById('decodeJwtButton').addEventListener('click', decodeJwt);
  document.getElementById('graphButton').addEventListener('click', generateGraphView);
  document.getElementById('expandTreeButton').addEventListener('click', expandTree);
  document.getElementById('collapseTreeButton').addEventListener('click', collapseTree);
  document.getElementById('copyTreePathButton').addEventListener('click', copySelectedTreePath);
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
  document.getElementById('graphTab').addEventListener('click', function() { showTab('graph'); });
  document.getElementById('convertedTab').addEventListener('click', function() { showTab('converted'); });
  document.getElementById('jwtTab').addEventListener('click', function() { showTab('jwt'); });
  document.addEventListener('keydown', handleKeyboardShortcuts);
  bindDropZone();
  bindTreeSelection();
  bindResizeHandle();
  restoreSplitSize();
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
    buildTypescriptInterfaces: buildTypescriptInterfaces,
    buildJsonSchema: buildJsonSchema,
    evaluateJsonPath: evaluateJsonPath,
    jsonToCsv: jsonToCsv,
    jsonToYaml: jsonToYaml,
    buildGraphSvg: buildGraphSvg
  };
}

function bindResizeHandle() {
  var layout = document.querySelector('.layout');
  var handle = document.getElementById('resizeHandle');
  if (!layout || !handle) return;

  handle.addEventListener('pointerdown', function(event) {
    if (window.matchMedia('(max-width: 900px)').matches) return;
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    layout.classList.add('resizing');

    function onPointerMove(moveEvent) {
      var rect = layout.getBoundingClientRect();
      var handleWidth = handle.offsetWidth || 12;
      var leftWidth = moveEvent.clientX - rect.left;
      var percent = Math.max(25, Math.min(75, (leftWidth / rect.width) * 100));
      setSplitSize(percent, handleWidth);
    }

    function onPointerUp() {
      layout.classList.remove('resizing');
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
      try {
        localStorage.setItem(SPLIT_STORAGE_KEY, layout.getAttribute('data-split-percent') || '50');
      } catch (e) {}
    }

    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  });
}

function setSplitSize(percent, handleWidth) {
  var layout = document.querySelector('.layout');
  if (!layout) return;
  handleWidth = handleWidth || 12;
  var rightPercent = 100 - percent;
  layout.style.gridTemplateColumns = 'minmax(280px, ' + percent + 'fr) ' + handleWidth + 'px minmax(280px, ' + rightPercent + 'fr)';
  layout.setAttribute('data-split-percent', String(Math.round(percent)));
}

function restoreSplitSize() {
  try {
    var saved = Number(localStorage.getItem(SPLIT_STORAGE_KEY));
    if (saved >= 25 && saved <= 75 && !window.matchMedia('(max-width: 900px)').matches) {
      setSplitSize(saved, 12);
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', bindEvents);
