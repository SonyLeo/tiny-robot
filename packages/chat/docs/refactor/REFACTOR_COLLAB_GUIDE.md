# Chat Refactor Collaboration Guide

This document defines the default write discipline for the chat refactor branch.

## Core Rule

A typical task should update:

- one primary source doc
- and, only when needed, one status or derived doc

You should almost never need to update every refactor document in a single code task.

## Primary Write Targets

- contract change:
  `design/api-runtime.md`
- phase, gate, or validation change:
  `design/execution.md`
- top-level design direction change:
  `design/overview.md`
- review method change:
  `process/review-scheme.md`
- current status, conclusions, or next actions:
  `process/alignment-tracker.md`
- meeting preparation:
  the relevant file under `reviews/`
- multi-session implementation slice:
  an active file under `../exec-plans/active/`
- finished code change:
  a history entry under `../histories/`

## Update Order

When a real change happens:

1. update the primary source doc
2. update tracker or review packet only if the task changed status or meeting narrative
3. update a generated artifact only if its source contract changed
4. write a history entry only when code or repository behavior actually landed

## Archive Rule

Do not update:

- `archive/proposal.md`
- `archive/phase-0_5-freeze-record.md`

unless the task is explicitly re-baselining historical context.

## Review Packet Rule

Review packets are temporary communication artifacts for a specific meeting.

- They may summarize source docs.
- They must not become the place where the real contract is defined.
- After the meeting, the lasting outcome belongs in `process/alignment-tracker.md`.

## Generated Artifact Rule

Generated or derived tables help with fast lookup.

- They are not the authority.
- Their source files must be named in the artifact.
- If an artifact and a design doc disagree, the design doc wins.
