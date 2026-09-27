# S4 state comparison — 2026-09-27

Experimental only. No kit API or engine internals were changed. Run against the same S2 `/core` tarball and isolated Angular 20 host described in `README.md` (SHA-256 `9479D41688563B7FC4128565837829181B5CF3251854CE57C03C4FD06896B59F`). Neither strategy replaces the engine-owned message objects.

## Strategies and observed contract

- **A/full:** subscribe to native state, `structuredClone` the full messages array on every notification, then publish a Signal and revision. Distinct arrays, messages and nested metadata/tool state across notifications. Engine message references remain distinct from published messages. Earlier published content remains unchanged.
- **A/revision:** subscribe to native state; publish its shallow-copied array, a new top-level state wrapper and a monotonically increasing revision. Array identity changes; message and nested identities remain stable and engine-owned. Earlier published objects reflect later in-place writes. An `OnPush` message child receives revision as an input, so it checks its unchanged message input; its tool grandchild receives a new status string when nested state changes. This is **not** an immutable history snapshot.
- **B/adapter:** a custom `MessageStateAdapter` composes native `initialize/getState/createMessage/mutate/subscribe`, registers its Angular Signal publication as the first native observer, and uses the same shallow array/revision view. Engine/plugin references and public identity behavior match A/revision. The internal observer must precede external subscribers: publishing after delegated `mutate` made external subscribers see stale Angular state, so the final implementation registers in `initialize`. B is a feasible experiment under explicit mutable-view/revision semantics, but duplicates the bridge boundary inside an adapter and shows no demonstrated advantage. It does not solve immutable nested snapshots without copying.

The gated 3-chunk test uses the same history, nested metadata and provider for each mode. For each released chunk it checks notification progress, rendered `OnPush` message text (`1`, `12`, `123`) without per-chunk `detectChanges`, plugin content (`1`, `12`, `123`), external subscription ordering and object identities. The S3 tool provider checks `awaiting-approval` → `success` in the `OnPush` tool grandchild and the prior nested tool status (stable reference in revision/B; isolated snapshot in full). Destroying the Angular host through `DestroyRef` stops publication while its shared engine continues to process a later send. The engine's own `getState()` and plugin still see the original messages.

## Long-history measurement

`./s4-measure.ps1 -HostDir <installed-outside-repository-host>` copies only S4 source into the already installed host, generates one benchmark mode per fresh test process, restores the host spec in `finally`, and does not install or modify repository dependencies. Each mode starts with **500 messages × 1,024 ASCII content characters**, metadata, one user send and **80 immediate 32-character chunks**. Initial history serializes to 548,781 JSON characters. All modes produced **87 notifications** (including initial and non-chunk state/message updates) and published shallow arrays totaling 43,670 entries. `estimatedDeepCopyBytes` is calculated **after** the timed send as final JSON payload length times notification count; it is an approximate payload size, not measured allocation or actual bytes copied at each notification. It excludes native shallow array copies and engine work. Neither `elapsedMs` nor `publishMs` includes this JSON size calculation.

Windows 10.0.26200, x64, Intel i7-12700H; Node 22.15.1, npm 10.9.2, Angular core 20.3.32, CLI/build 20.3.37, TypeScript 5.9.3, Vitest 3.2.7. Angular zoneless TestBed/jsdom; no browser renderer in this S4 run.

| Mode | elapsed, two runs (ms) | publish, two runs (ms) | estimated deep-copy payload | sampled peak, two runs (bytes) |
| --- | ---: | ---: | ---: | ---: |
| A/full | 86.694 / 95.804 | 85.393 / 94.183 | ~47,997,813 bytes | 101,674,872 / 101,645,072 |
| A/revision | 1.309 / 1.717 | 0.202 / 0.389 | 0 deep-copy bytes | 92,710,576 / 92,679,104 |
| B/adapter | 1.171 / 1.538 | 0.203 / 0.267 | 0 deep-copy bytes | 89,158,616 / 92,701,752 |

`heapUsed` is sampled per notification, not a retained-size or maximum-RSS measurement. GC occurred during the full runs (negative before/after delta); the different initial heaps and process scheduling prohibit precise cross-run memory/speed ratios. These two repetitions establish direction for this one workload, not a general latency claim. All strategies still incur shallow array copies in native `getState()` and engine/plugin work. No performance threshold is asserted.

## Recommendation and remaining risk

For R1, prefer **A/revision as a minimal experimental direction**, with an explicit mutable-view contract and revision input propagation for `OnPush` descendants. Do not publish it as a formal API yet. A/full establishes snapshot isolation but copies O(history × notifications) data; its measured cost is substantial for this continuous stream. B can be reliable without deep copying only under the same mutable-view/revision contract; its adapter composition adds ordering/lifecycle complexity without observed benefit. If consumers require immutable historical message/nested snapshots, neither light variant meets that contract: a separate snapshot boundary or a measured structural-sharing design would need additional work. Do not replace engine-owned messages or duplicate its state machine.

Unverified: Angular 21/22 for S4, S4 Zone.js browser rendering, browser heap/RSS and GC-controlled repeatability, external nested writes outside engine `mutate` (no notification), highly nested/non-JSON payload copy size, many simultaneous subscribers, session persistence, and a formal API/package decision. S3 browser Zone.js/zoneless evidence does not automatically cover these S4 variants.
