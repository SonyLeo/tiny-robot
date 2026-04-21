# Refactor Knowledge Layer

This directory is the thin recurring-knowledge layer for the chat refactor.

It is intentionally smaller than:

- `design/`
- `process/`
- `reviews/`
- `histories/`

Its job is not to redefine contracts.
Its job is to capture the implementation lessons that keep repeating, so later slices do not have to rediscover them.

## Files

- `PLAYBOOK.md`
  promoted, reusable guidance
- `EXPERIENCE_LOG.md`
  candidate and promoted recurring lessons with evidence links

## Promotion Rule

- one-off task detail:
  keep it in the task history or execution slice
- repeated lesson or recurring confusion:
  add it to `EXPERIENCE_LOG.md`
- stable lesson that should guide later slices:
  promote it into `PLAYBOOK.md`

## What Does Not Belong Here

- new runtime or slot contracts
- review decisions that should live in tracker or review packets
- phase gates that belong in `design/execution.md`
- one-off implementation notes that will not recur
