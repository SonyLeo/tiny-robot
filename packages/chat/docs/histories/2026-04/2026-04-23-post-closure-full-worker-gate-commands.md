# Post-Closure Full-Worker Gate Commands

Date: 2026-04-23

## Summary

Added explicit full-worker retained Playwright gate commands so the test flow can try the faster `4`-worker path first and only fall back to the stable single-worker gate when the local environment is noisy.

## What Landed

- Added to `packages/test/package.json`:
  - `test:chat:smoke:full`
  - `test:chat:scenario:full`
- Updated:
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Current Rule

- preferred first pass:
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
  - `pnpm.cmd -F tiny-robot-test test:chat:scenario:full`
- stable fallback:
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke`
  - `pnpm.cmd -F tiny-robot-test test:chat:scenario`
