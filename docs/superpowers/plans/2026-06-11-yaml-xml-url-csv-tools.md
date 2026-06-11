# YAML/XML/URL/CSV Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four enhanced static developer tools: YAML formatter, XML formatter, URL parser, and CSV to JSON/table converter.

**Architecture:** Follow the existing tool module pattern under `src/tools/<tool-id>/` with `data.js`, `render.js`, and `index.js`. Keep all parsing and conversion browser-side, integrate through `index.html`, `src/core/router.js`, `src/shared/dom-cache.js`, `src/core/registry.js`, and `styles.css`.

**Tech Stack:** Vanilla JavaScript ES modules, DOM APIs, CSS, existing shared helpers such as `debounce` and `escapeHtml`.

---

### Task 1: YAML Formatter Module

**Files:**
- Create: `src/tools/yaml-formatter/data.js`
- Create: `src/tools/yaml-formatter/render.js`
- Create: `src/tools/yaml-formatter/index.js`

- [ ] **Step 1: Implement YAML data functions**

Create a lightweight YAML parser for common config shapes: indentation-based objects, arrays, scalar strings, booleans, numbers, nulls, comments, JSON conversion, formatting, and compact output.

- [ ] **Step 2: Implement YAML render functions**

Render formatted YAML, JSON preview, stats, empty state, and hidden-by-default error state.

- [ ] **Step 3: Implement YAML controller**

Bind format, compact, YAML to JSON, JSON to YAML, copy, clear, and debounced live validation events.

### Task 2: XML Formatter Module

**Files:**
- Create: `src/tools/xml-formatter/data.js`
- Create: `src/tools/xml-formatter/render.js`
- Create: `src/tools/xml-formatter/index.js`

- [ ] **Step 1: Implement XML data functions**

Use `DOMParser` for validation and tree extraction, format XML with indentation, compact XML, and convert XML document nodes to a JSON-like tree.

- [ ] **Step 2: Implement XML render functions**

Render formatted XML, JSON tree preview, stats, empty state, and hidden-by-default error state.

- [ ] **Step 3: Implement XML controller**

Bind format, compact, XML to JSON, copy, clear, and debounced validation events.

### Task 3: URL Parser Module

**Files:**
- Create: `src/tools/url-parser/data.js`
- Create: `src/tools/url-parser/render.js`
- Create: `src/tools/url-parser/index.js`

- [ ] **Step 1: Implement URL data functions**

Parse URLs with the native `URL` API, extract protocol, username, password marker, host, hostname, port, path, hash, query table, query JSON, and rebuilt URL.

- [ ] **Step 2: Implement URL render functions**

Render URL parts, query table, query JSON, rebuilt URL, empty state, and hidden-by-default error state.

- [ ] **Step 3: Implement URL controller**

Bind parse, example, copy URL, copy query JSON, clear, and debounced parse events.

### Task 4: CSV Converter Module

**Files:**
- Create: `src/tools/csv-converter/data.js`
- Create: `src/tools/csv-converter/render.js`
- Create: `src/tools/csv-converter/index.js`

- [ ] **Step 1: Implement CSV data functions**

Parse quoted CSV safely, support auto/comma/semicolon/tab/pipe delimiters, optional first-row headers, JSON conversion, table preview data, and stats.

- [ ] **Step 2: Implement CSV render functions**

Render JSON output, table preview, stats, empty state, and hidden-by-default error state.

- [ ] **Step 3: Implement CSV controller**

Bind convert, example, copy JSON, clear, delimiter/header options, and debounced conversion events.

### Task 5: Project Integration

**Files:**
- Modify: `index.html`
- Modify: `src/core/router.js`
- Modify: `src/shared/dom-cache.js`
- Modify: `src/core/registry.js`
- Modify: `styles.css`

- [ ] **Step 1: Update HTML navigation and home cards**

Add four navigation tabs and four home cards, and update hero copy from 15 to 21 tools.

- [ ] **Step 2: Add four tool views**

Add `yamlFormatterView`, `xmlFormatterView`, `urlParserView`, and `csvConverterView` with input controls, action buttons, hidden error containers, output panels, and toast nodes.

- [ ] **Step 3: Update router and registry**

Add importers and `viewMap` entries for all four tools. Add meta imports to `registry.js`.

- [ ] **Step 4: Update DOM cache**

Add lazy namespaces for all four tool views and their controls.

- [ ] **Step 5: Add styles**

Add shared formatter/parser layouts, output cards, stats cards, query table, CSV table preview, and responsive rules.

### Task 6: Verification

**Files:**
- No production file changes expected.

- [ ] **Step 1: Start local server**

Run: `node server.js`

- [ ] **Step 2: Verify routes**

Open and check these routes render their panels without console errors: `#yaml-formatter`, `#xml-formatter`, `#url-parser`, `#csv-converter`.

- [ ] **Step 3: Verify sample conversions**

Test each example button and confirm output, copy buttons, and error containers behave correctly.

---

## Self-Review

- Spec coverage: Covers all four requested tools plus integration and verification.
- Placeholder scan: No open-ended implementation placeholders remain; each task has explicit files and expected behavior.
- Type consistency: Tool IDs, view IDs, and planned DOM namespaces are consistent with current project conventions.
