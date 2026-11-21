# Phase 5A remend benchmark

This is an isolated Phase 5A experiment. It does not alter `TrMarkdown`, the
Markdown parser or renderer, package manifests, the lockfile, or production
build output. The browser harness imports the current stream state and
`markdownItAdapter` from `packages/components/src` and loads `remend@1.5.0`
from this directory's private npm prefix.

The comparison has three layers:

1. `current`: the existing `hold/tail` state (`resolveMarkdownStreamState`),
   with the stable source parsed by the current adapter and the raw tail kept
   as a temporary text surface.
2. `remend-protocol`: `remend(source)` with its documented protocol URL
   placeholders, parsed only for temporary preview.
3. `remend-text-only`: `remend(source, { linkMode: 'text-only' })`, which
   removes incomplete link markup from the temporary preview.

Every input records the exact source, current stable/tail split, both remend
preview strings, parser node signatures, placeholder URL observations, and the
finalized parser signature. Finalization always parses the original source;
neither remend result is used for final output.

## Reproduce

From the repository root:

```sh
node phase5-remend-spike/run-phase5.mjs
```

The script creates the private npm prefix on first run, installs exactly
`remend@1.5.0` there, starts a Vite browser harness, and writes output to
`phase5-remend-spike/results/` by default. Set `PHASE5_RESULTS_DIR` to place
generated output in the Codex visualization folder:

```sh
PHASE5_RESULTS_DIR=/path/to/visualization/phase5-remend-results node phase5-remend-spike/run-phase5.mjs
```

It writes:

- `results/phase5-results.json`: raw per-step measurements and signatures;
- `results/phase5-report.md`: generated findings and concrete counts;
- `results/phase5-report.html`: rendered report with source/preview/final
  columns;

The only external runtime is Chromium from the repository's Playwright
installation. No production dependency is added and no build is run.
