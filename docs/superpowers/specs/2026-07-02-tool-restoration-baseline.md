# Tool Restoration Baseline

Date: 2026-07-02

## Scope

This baseline documents the restored behavior after the React/TypeScript migration. The goal is to keep the migrated architecture while preserving the original tool behavior, visual structure, and user-facing Chinese text.

## Restored Surface

- Application shell: original hero, horizontal tool tabs, home navigation, readable Chinese copy.
- Home workbench: search, category tabs, favorites, recent tools, tool cards, readable labels.
- Core shared UI: return-to-home link, favorite labels, error boundary, clipboard messages.
- Speed test: multi-target benchmark, streaming TTFT, warmup rounds, summary, export.
- Color palette: auto/preset modes, preset library, preview, CSS/JSON/usage guide outputs.
- Prompt templates: full original template library, categories, search, favorites, expandable cards, copy toast.
- Timestamp converter: live clock, timestamp/date conversion, timezone list, relative time, copy controls.
- JSON formatter: syntax-highlighted tree, collapsible rows, stats, copy, empty/error states.
- Cron parser: examples, natural-language summary, field cards, validation.
- cURL converter: parser coverage, request summary, fetch/Python/Go output panels.
- Text chunker: persisted config, chunk cards, stats, per-chunk copy, copy all.
- Token calculator: original model list, stat cards, model detail rows, clear action.
- Regex tester: match stats, highlights, match details, capture groups.
- JWT debugger: decoded panels, signature panel, verification hint/success/failure states.
- YAML/XML formatters: dual output panels, stats cards, clear/copy behavior.
- CSV converter: JSON output, table preview, stats, delimiter/header controls.
- URL parser: URL part rows, query table, query JSON, rebuilt URL output, copy controls.
- Encoding converter: original action IDs, editable output, swap, clear, copy feedback.
- Color converter: swatch preview, format cards, per-format copy.
- UUID generator: batch options, per-row copy, copy all, v4/v7 limits.
- Hash generator: automatic calculation, result row, algorithm tag, copy control.
- QR generator: real QR encoder, two-column UI, placeholder, version/size info, PNG download.

## Regression Guards

Automated tests now guard:

- Original shell layout is still used and the sidebar migration does not return.
- Core UI text is readable Chinese and selected source files do not contain mojibake.
- Tool registry exposes readable titles, descriptions, and tags.
- Critical legacy UI class names and behaviors remain present for restored tools.
- Core logic for QR, speed test, palette generation, prompt templates, timestamp, JSON, Cron, cURL, text chunking, token estimation, regex, JWT, YAML, XML, CSV, URL, encoding, color, UUID, Hash remains callable.

## Manual/Browser Acceptance

Before publishing restoration work, run browser smoke checks for:

- Every route renders a readable Chinese title and description.
- Restored legacy sections exist in the DOM for each tool.
- Primary interactions work: generate, convert, parse, copy, download, clear, search, favorite, expand.
- Desktop and mobile widths do not hide the primary controls.

## Verification Commands

Use these commands before claiming a restoration change is complete:

```bash
npm test
npm run typecheck
npm run build
```

For browser validation, run a local preview and inspect all tool routes:

```bash
npm run preview -- --port 4173
```

## Deployment

Published site:

https://sandrewzq.github.io/ai-tools/

Latest successful restoration deployments:

- `c9bb2aa` - restored migrated tool behavior.
- `3774233` - restored remaining tool interfaces.
