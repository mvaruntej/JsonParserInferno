# Local JSON Parser

Offline JSON utility that runs directly in the browser from `local-json-parser.html`.

## Features

- Validate, format, and minify JSON.
- Show a collapsible tree view with search.
- Escape and unescape JSON strings.
- Generate SQL DDL for PostgreSQL, MySQL, or SQLite.
- Generate Python, Java, or Go model boilerplate.
- Generate JSON Schema.
- Run simple JSONPath expressions such as `$.orders[0].items` and `$["user"].name`.
- Upload JSON files or drag and drop a JSON file onto the input panel.
- Copy or download the currently active output.
- Restore the last input from browser `localStorage`.
- Keyboard shortcuts:
  - `Ctrl+Enter`: validate and format.
  - `Ctrl+L`: clear the editor.

## File Layout

```text
local-json-parser.html
local-json-parser/
  css/styles.css
  js/app.js
  js/constants.js
  js/file-actions.js
  js/json-schema.js
  js/jsonpath.js
  js/model-generator.js
  js/parser.js
  js/schema.js
  js/sql-generator.js
  js/tree-view.js
  js/ui.js
  tests/smoke-test.js
```

## Running

Open `local-json-parser.html` in Chrome, Edge, or another modern browser. No server or internet connection is required.

## Testing

From `D:\codex`, run:

```powershell
node .\local-json-parser\tests\smoke-test.js
```
