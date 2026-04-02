# AGENTS.md

Repository-level instructions for coding agents working in this monorepo.

This file is intended to provide:

- durable repository context
- practical development norms
- explicit multi-agent launch and orchestration rules
- a lightweight, repo-native workflow compatible with Codex and other coding agents

If a subdirectory later needs stricter local rules, add a nested `AGENTS.md`. The most specific file should win for that subtree.

## 1. Scope And Precedence

This file applies to the whole repository unless a deeper `AGENTS.md` overrides part of it.

Priority order:

1. direct user request
2. nested package-level `AGENTS.md` for the current subtree
3. this repository-level `AGENTS.md`
4. general defaults

If two instructions conflict:

- obey the more specific scope
- obey the newer instruction if the scope is the same
- if still unclear, prefer the safer and more reversible option

## 2. Repository Overview

This repository is a `pnpm` monorepo for TinyRobot packages, tests, docs, demos, and playground tooling.

Top-level areas:

- `packages/components`: core UI component library
- `packages/kit`: runtime/chat orchestration primitives
- `packages/chat`: higher-level chat package built on `components + kit`, including package source, demos, docs, and tests
- `packages/playground`: interactive playground
- `packages/test`: automated tests
- `packages/svgs`: icon/build assets
- `docs`: docs site plus design/implementation references
- `scripts`: repo tooling

Current repository reality:

- package boundaries matter
- `packages/chat` is the main high-level integration surface for packaged chat UX and owns its own demo/docs/tests workflow
- `packages/components`, `packages/kit`, and `packages/chat` are the main reusable implementation layers
- docs are part of the engineering workflow, not post-hoc artifacts

## 3. Canonical Source Of Truth

When making changes, use these sources in this order:

1. current code in the relevant package
2. package-local docs and tests
3. repository docs under `docs/`
4. structured design or change docs when they exist for the task
5. repository-level contribution/config files:
   - `CONTRIBUTING.md`
   - `.editorconfig`
   - root `package.json`

Important note:

- if docs and implementation disagree, do not silently choose one
- update the stale source in the same task when practical
- for larger divergence, document the inconsistency in your plan or final handoff

## 4. Package Boundary Rules

Default rule:

- put logic in the lowest reusable layer that matches its responsibility

Preferred ownership:

- `packages/components`: reusable UI primitives and presentational behavior
- `packages/kit`: reusable runtime primitives, conversation/message orchestration, storage strategy interfaces
- `packages/chat`: chat-level composition, presets, scaffold/layout composition, workspace shell, model selection, attachments, history, packaged chat UX, and package-local demos/docs/tests
- `packages/chat/demo`: showcase blackbox and whitebox integration examples for the chat package, not the long-term source of shared logic
- `docs`: design, usage, and implementation references

Do not:

- copy reusable logic from demos, playgrounds, or examples into multiple places
- move example-specific tradeoffs into reusable packages without explicit intent
- edit generated output directly:
  - `dist/`
  - `node_modules/`

High-scrutiny files:

- root `package.json`
- root `pnpm-workspace.yaml`
- root `AGENTS.md`
- root build/lint/test config
- package entrypoints
- shared `types.ts` files

Change these only when the task clearly requires it.

## 5. Development Workflow

Use this default workflow unless the task is truly trivial:

1. understand the request
2. inspect the nearest relevant code
3. classify the task size/risk
4. decide whether a written plan or structured design note is required
5. implement in the smallest sensible scope
6. validate with the narrowest meaningful command
7. update docs/specs when behavior or structure changed

### 5.1 Task Size Classification

#### Small

Typical characteristics:

- one package
- narrow bug fix or local refactor
- low-risk UI or logic tweak
- no public contract change

Expected workflow:

- brief planning is enough
- direct implementation is acceptable
- package-local validation

#### Medium

Typical characteristics:

- multiple files or modules
- user-visible behavior change
- state flow or data shape change
- docs should likely be updated

Expected workflow:

- write a clear plan first
- consider a structured design note if the change crosses boundaries or introduces new behavior
- validate package-local behavior and affected tests/docs

#### Large

Typical characteristics:

- cross-package changes
- workflow/scaffold/runtime/provider contract changes
- architecture shifts
- likely to benefit from multi-agent parallelism

Expected workflow:

- use structured design documentation for large changes
- define contracts before implementation
- parallelize only with explicit write-scope ownership
- document validation and migration impact

## 6. When To Use Structured Design Docs

Structured design docs are recommended when the change meets any of the following:

- cross-package behavior changes
- public API or schema changes
- template/scaffold/workflow changes
- medium/large feature work with user-visible behavior
- work split across multiple agents
- changes requiring review of "should we do this?" before "how do we code this?"

Structured design docs are usually unnecessary for:

- copy edits
- narrow bug fixes
- isolated style tweaks
- low-risk local refactors
- targeted tests with no behavior change

When structured design docs are used:

- treat the approved design/change document as the change source of truth
- keep implementation aligned with the documented proposal, design, and task breakdown
- update task status only after implementation or verification actually lands
- if implementation diverges from the design, update the document or explicitly flag the drift

## 7. Coding Norms

### 7.1 General

- prefer simple, reviewable changes
- prefer explicitness over cleverness
- preserve existing naming and file layout conventions unless restructuring is intentional
- avoid opportunistic broad cleanup unrelated to the task

### 7.2 Monorepo Hygiene

- keep changes package-local whenever possible
- if a task touches multiple packages, document the dependency direction in your plan
- avoid introducing hidden coupling from demos, playgrounds, or scaffolds back into reusable packages

### 7.3 Config And Dependency Changes

- prefer package-local dependency changes over root-level ones
- do not change dependency versions casually
- if root config changes are needed, explain why in your plan or final summary

### 7.4 Docs Synchronization

Update docs in the same task when practical if you changed:

- package structure
- runtime contract
- provider behavior
- multi-session semantics
- model switching behavior
- MCP configuration behavior
- recommended workflow
- directory or ownership boundaries

### 7.5 External Research And References

When a task depends on unstable external behavior, prefer:

- official product docs
- official framework/library docs
- first-party examples

Do not anchor implementation decisions to random blog posts when official documentation or upstream source is available.

Typical cases where official references should be preferred:

- OpenAI, GitHub, Anthropic, or other agent/tool workflows
- framework/runtime APIs
- build tooling behavior
- package manager behavior
- browser/storage/platform constraints

If external behavior is still ambiguous after reading official sources:

- document the assumption in your plan or final handoff
- choose the least risky and most reversible implementation

### 7.6 High-Risk Change Guardrails

Apply extra caution when editing any of the following:

- storage and persistence behavior
- provider/runtime contracts
- MCP or tool execution flow
- package entrypoints and exports
- template/scaffold generation
- root-level config
- docs that act as workflow or architecture references

For these changes:

- prefer written planning even if the task is not huge
- avoid bundling unrelated refactors
- validate behavior locally before broad integration

### 7.7 Commit And PR Norms

If the task includes creating commits or preparing PR-ready output, align with `CONTRIBUTING.md`.

Repository convention:

- use conventional commit style: `type(scope): description`
- common scopes include packages, components, or feature areas
- update docs/tests when behavior changed

If a commit is not requested, do not create one automatically.

## 8. Validation Norms

For every code change, run the smallest validation that credibly proves the change.

Preferred order:

1. package-local type-check/build
2. targeted tests
3. broader package tests
4. repo-wide validation only if necessary

Common commands:

- root:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- components:
  - `pnpm -F @opentiny/tiny-robot type-check`
  - `pnpm -F @opentiny/tiny-robot build`
- chat:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `pnpm -F @opentiny/tiny-robot-chat build`
  - `pnpm -F @opentiny/tiny-robot-chat-demo type-check`
  - `pnpm -F @opentiny/tiny-robot-chat-demo build`
- docs:
  - use the narrowest docs build or validation command relevant to the changed area

Validation rules:

- do not skip validation silently if it was practical to run
- if validation could not be run, state that explicitly
- prefer targeted tests over full-suite runs during iteration

## 9. Documentation Norms

When updating docs:

- favor real implementation over aspirational structure
- if a doc is a design doc, clearly distinguish current state vs future recommendation
- if a doc is an implementation doc, keep it aligned with the latest code

Suggested doc ownership:

- `docs/*design*.md`: rationale, boundaries, architecture
- `docs/*implementation*.md`: actual implementation path and status
- task-specific change docs: medium/large change records and task tracking when needed

When changing docs that are used for team workflow or architecture alignment:

- keep them implementation-aware
- remove stale directory structures or outdated layer names
- do not leave competing "current" designs in multiple files

## 10. Multi-Agent Launch Norms

Use multiple agents only when parallelism materially reduces risk or latency.

Good reasons to launch multiple agents:

- the task has clearly separable write scopes
- the task spans different layers such as `core` and `features`
- docs/tests/design notes can progress independently
- one agent can research/spec-align while another implements

Do not launch multiple agents when:

- the task is small
- all meaningful work blocks on one file or one decision
- write scopes overlap heavily
- the shared contract has not been decided yet

## 11. Multi-Agent Startup Checklist

Before launching additional agents, the orchestrator should:

1. define the immediate critical-path task to keep locally
2. identify sidecar tasks that can proceed independently
3. freeze shared contracts before implementation:
   - package boundaries
   - file ownership
   - key types and interfaces
   - config names and feature flags
4. assign non-overlapping write scopes
5. define required outputs for each worker:
   - changed files
   - assumptions
   - risks
   - validation results

If shared contracts are not stable, do not parallelize implementation yet.

## 12. Recommended Multi-Agent Splits For This Repo

Safe write-scope seams usually include:

- `packages/chat/src/components`
- `packages/chat/src/composables`
- `packages/chat/demo`
- `packages/chat/tests`
- `packages/chat/docs`
- `packages/kit/src`
- `docs/`
- `packages/test/`

Common good pairings:

- one agent on runtime/core
- one agent on UI/features
- one agent on docs/tests/design notes

Avoid parallel edits to:

- root `package.json`
- root `AGENTS.md`
- root workflow/config files
- package entrypoints such as `src/index.ts`
- shared contract files such as `types.ts`
- shared task or design documents unless owned by the orchestrator

## 13. Orchestration Rules

The main/orchestrating agent owns:

- the top-level plan
- shared contract decisions
- decomposition
- conflict resolution
- integration
- final validation

Worker agents should:

- stay inside their assigned write scope
- not revert other work
- report assumptions instead of silently expanding scope
- leave integration-sensitive files to the orchestrator whenever practical

The orchestrator should not duplicate delegated work.

## 14. Agent Reporting Format

When delegating work, require a compact structured report:

```text
Status: done | blocked | needs-review
Changed files:
- path/to/file

Assumptions:
- ...

Risks:
- ...

Validation:
- command
- result
```

This is the minimum expected handoff format for parallel work in this repo.

## 15. Integration Sequence After Parallel Work

After worker results return, the orchestrator should:

1. review changed files
2. resolve contract or import drift
3. run package-local validation
4. run targeted tests
5. update docs/design notes if needed
6. produce the final integrated result

Worker completion is not final completion. Integration validation is required.

## 16. Repository Defaults

When in doubt, use these defaults:

- package manager: `pnpm`
- indentation/style: follow `.editorconfig`
- start with planning for medium/large work
- use structured design docs for cross-package or user-visible architecture changes
- validate package-locally before validating repo-wide
- parallelize only with explicit disjoint write ownership

## 17. What This File Does Not Define

This file does not fully define:

- package-specific API design rules
- release/versioning policy
- deployment policy
- package-local testing strategy details

Use nested `AGENTS.md` files if any package needs stricter local instructions.
