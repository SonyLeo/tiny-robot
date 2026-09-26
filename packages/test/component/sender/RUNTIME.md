# Sender verification

## Reproduce

Validated with Node 24.19.0, pnpm 10.34.5, Chromium, Playwright 1.62.0,
Vue 3.5.43 and Tiptap 3.17.1 on Windows. Run from packages/test:

```powershell
pnpm type-check:sender
pnpm exec playwright test -c playwright-ct.config.ts '[\\/]Sender[^\\/]*\.spec\.ts$' --workers=4 --retries=0
pnpm -F @opentiny/tiny-robot build
pnpm exec playwright test src/sender/specs/smoke --workers=4 --retries=0
```

Build the component package from the same commit before E2E, because page tests
consume built exports while Sender CT fixtures import source. Dependencies must
already be installed. No lockfile was changed; this repository ignores them.
The scoped Sender type check avoids unrelated docs fixtures in the full CT check.

## Migration verification

This stage uses unchanged production source and contains 147 mounts + 10 pure
tests. The independent branch is checked with zero retries, alongside five E2E
smoke cases. Formatting and ESLint apply to the changed test sources.

Validated on 2026-09-26 with four workers and zero retries:

- Sender CT: 157/157 passed, 73.89 seconds reported by Playwright.
- Page E2E: 5/5 passed, 16.0 seconds, using a fresh component build.
- Scoped Sender vue-tsc, ESLint on changed test sources, and component build
  (including production vue-tsc) passed.
- No skipped, unexpected or flaky results were reported in these runs.

## Fix verification

The subsequent slot-scope commit passed scoped vue-tsc, scoped ESLint and all
seven Slots CT cases (12.2 seconds, four workers, zero retries). Its test count
is 154 mounts + 10 utilities; the migration measurements above remain unchanged.

After both fixes, the final suite passed 167/167 in 100.03 seconds, followed by
5/5 page E2E in 9.4 seconds using a fresh successful component build. Scoped
Sender vue-tsc and ESLint passed. Runs used four workers, zero retries, and
reported no skipped, unexpected or flaky cases. This verification run is slower
than the earlier benchmark and is not a controlled timing comparison.

For a negative control, temporarily removing both production fixes caused
SLOT-03/05/06/07 and SUGGESTION-04/16A to fail on their expected state assertions;
SLOT-01/02/04 still passed. Restoring the fixes preceded the final full run.

## Design experiment

Before splitting the migration from its product fixes, the combined candidate
was compared against nested subsets of the complete suite. Every row includes
ten pure utility tests in addition to its mounted count.

| Mounted plan | Repeated rounds | Process wall median | Observed wall range |
| ------------ | --------------: | ------------------: | ------------------- |
| 100 subset   |               2 |             52.54 s | 49.99-55.08 s       |
| 120 subset   |               2 |             63.02 s | 61.67-64.36 s       |
| 140 subset   |               2 |             72.68 s | 71.78-73.58 s       |
| 160 subset   |               2 |             83.63 s | 81.01-86.25 s       |
| 181 complete |               4 |             91.22 s | 85.35-96.88 s       |
| 157 compact  |               3 |             70.03 s | 56.83-75.90 s       |

All 15 formal rounds passed (2385 test executions), with four workers, zero
retries, warm caches and unchanged recording policy. The smaller subsets omit
unique scenarios; their shorter runtime is not an equivalent-coverage speedup.
The 157-mount plan combines related short flows and retains mapped assertions.

Because machine load varied, adjacent comparisons are more useful than pooled
medians: 75.90 vs 90.60 seconds and 70.03 vs 85.35 seconds, approximately 16-18%
less wall time, or 15 seconds per run. These are local observations, not a CI SLA.
A subsequent 20-worker run passed 167/167 in 71.74 seconds wall (70.83 seconds
Playwright), with no clear gain over four workers. Default parallelism is unchanged.

These full-candidate measurements include the reserved product fixes and must
not be presented as timings for the migration-only 147-mount branch. Five page
smoke tests are outside all CT timings. No controlled run of the original 81
E2E cases was made, so no old-E2E speedup ratio is claimed.

## Limits

No coverage instrumentation or line/branch coverage percentage is provided.
Cold CI builds and long-term flake rates are not established by these samples.
Bubble has 43 CT cases in five files; its optional comparison failed during
docs-demo dependency resolution before executing tests, so no Bubble runtime
comparison is available. See MIGRATION.md for deferred behavioral boundaries.
