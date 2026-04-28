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
  document.getElementById('indentSize').addEventListener('change', formatJson);
  document.getElementById('fileInput').addEventListener('change', loadFile);
  document.getElementById('input').addEventListener('input', handleInputChange);
  document.getElementById('formattedTab').addEventListener('click', function() { showTab('formatted'); });
  document.getElementById('treeTab').addEventListener('click', function() { showTab('tree'); });
  document.getElementById('sqlTab').addEventListener('click', function() { showTab('sql'); });
  document.getElementById('modelsTab').addEventListener('click', function() { showTab('models'); });
}

document.addEventListener('DOMContentLoaded', bindEvents);

