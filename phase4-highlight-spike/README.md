# Phase 4 highlight comparison spike

This directory is an isolated experiment for the Markdown Phase 4 decision. It does not alter `TrMarkdown`, `markdown.less`, package manifests, lockfiles, or the runtime.

The browser compares three adapters against the same fixtures and container:

1. `hljs-current`: Highlight.js with the language map currently in `packages/components/src/markdown/utils/highlight.ts`.
2. `hljs-tuned`: the same Highlight.js core and token CSS, plus Python, SQL, and YAML language modules.
3. `shiki-current`: the current Shiki core/JavaScript regex engine, GitHub light/dark themes, and the current Shiki language whitelist.

The harness measures browser `performance.now()` timings for first text visibility and completed highlighted HTML, records long tasks when the browser exposes them, and writes screenshots for light and dark runs. `run-phase4.mjs` also builds an isolated consumer entry against the freshly built `packages/components/dist` and records emitted chunk sizes and gzip sizes. It never writes to `packages/components/dist`.

## Run

From the repository root:

```sh
node phase4-highlight-spike/run-phase4.mjs
```

The script writes reviewable output under `phase4-highlight-spike/results/`:

- `browser-results.json`: fixture-by-engine/theme measurements and output coverage.
- `browser-report.html`: the exact rendered comparison page.
- `light-current.png`, `light-tuned.png`, `dark-current.png`, and `dark-tuned.png`: fixed 1440×1100 Chromium screenshots. `current` uses the production token values from `variables.css`/`markdown.less`; `tuned` is an experiment-only higher-contrast palette for blind visual review and is not a proposed production change.
- `consumer-build.json`: Vite output files, raw bytes, gzip bytes, and trigger notes.
- `consumer-dist/`: isolated consumer build output.

The browser is Chromium from the installed Playwright 1.62.0 package. The script uses `deviceScaleFactor: 1`, `prefers-color-scheme`, a fixed 1440×1100 viewport, and a monospace system fallback. The harness eagerly imports all three adapters at page startup, so per-fixture timing is warm-module highlight completion after initialization. It is not first paint, cold chunk fetch, or network timing. The output reports the one-time Shiki highlighter initialization separately and records browser long tasks when supported.

The streaming rows are isolated highlight-only append and rewrite checks for a closed TypeScript fence. They verify that the candidate engines can re-highlight the new source and that the measured source is the final source. They do not exercise `TrMarkdown`’s parser, tail hold, or async request guard.

The experiment intentionally does not claim a product budget. The roadmap has no maintainer-confirmed Phase 4 chunk or latency budget, so the report provides baseline and deltas only.
