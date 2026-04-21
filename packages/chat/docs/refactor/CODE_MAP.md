# Chat Refactor Code Map

This file describes the intended implementation areas for the refactor.

Use it as a routing aid, not as a replacement for the actual code.

## Target Areas

- `src/root/`
  Root wiring, provide/inject boundaries, and runtime assembly entry
- `src/page/`
  official page composition and page-shell behavior
- `src/primitives/`
  primitive UI surfaces with explicit read boundaries
- `src/runtime/`
  feature runtimes, bridge helpers, and source-of-truth ownership
- `src/legacy/`
  temporary compatibility or comparison adapters while the refactor is in flight

## Legacy Anchors

When old shipping code still exists, treat it as:

- capability boundary reference
- parity anchor
- comparison fixture

Do not treat legacy paths as the long-term owner of new contracts.

## Test Areas

- `tests/contracts/`
  public surface and contract anchors
- `tests/runtime/`
  runtime and feature semantics
- `tests/page/` or equivalent page-level suites
  page composition and integration behavior
- `demo/`
  blackbox and whitebox usage anchors

## Ownership Rule

Place logic in the lowest stable layer that matches its responsibility.

- root decides wiring
- page decides composition
- primitives decide local UI contracts
- runtime owns source-of-truth behavior
