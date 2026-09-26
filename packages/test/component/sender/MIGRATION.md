# Sender test design and coverage

Sender interaction tests run as browser component tests (CT). Five page E2E
tests retain the application entry, parent state, and complete submit flows.
This separation improves failure attribution and avoids repeating page setup
for every editor interaction. Production behavior is unchanged in the migration.

## Migration baseline

This stage contains **147 independently mounted tests + 10 pure utility tests**,
plus **five E2E tests**. Public slot scopes and Suggestion update/close regressions
are reserved for separate production-fix commits: seven Slots and three
Suggestion cases will bring the complete suite to 157 mounts + 10 utilities.
Reserved cases are not counted as delivered coverage or implemented as skips.

| Specification                       |  Mounts | Scope                                                                                      |
| ----------------------------------- | ------: | ------------------------------------------------------------------------------------------ |
| SenderCore.spec.ts                  |      15 | Model/default initialization, model sync, methods, submission guards, length, clear/cancel |
| SenderEditor.spec.ts                |      10 | Placeholder/editability, real input/paste, undo/redo, re-entry                             |
| SenderKeyboard.spec.ts              |      12 | Enter/Ctrl/Meta/Shift submission and exact newline behavior                                |
| SenderModeAndAutoSize.spec.ts       |       6 | Initial modes, overflow/recovery, autoSize rows                                            |
| SenderExternalContent.spec.ts       |       7 | Ref payloads, empty filtering, registration lifecycle, attachments                         |
| SenderActions.spec.ts               |      11 | Submit/Clear/Cancel, tooltip, counter, graphemes, icons/sizes                              |
| SenderActionChildren.spec.ts        |       7 | Native file chooser/limits, fake speech insertion/interception/cleanup                     |
| SenderMention.spec.ts               |      13 | Ref triggers, filtering, navigation/selection, Atom deletion, structured submit            |
| SenderSuggestion.spec.ts            |      16 | Filtering, selection, navigation, completion, highlighting and popup options               |
| SenderTemplateBlock.spec.ts         |       7 | Ref initialization/replacement, editing, paste, focus, structured submit                   |
| SenderTemplateBlockDeletion.spec.ts |      24 | Legal Backspace/Delete matrix, boundaries and selections                                   |
| SenderTemplateSelect.spec.ts        |      13 | Navigation/selection, closing, mutual exclusion, Teleport/ShadowRoot, cleanup              |
| SenderIsolation.spec.ts             |       6 | Independent values, menus, events and clearing across instances                            |
| **Mounted total**                   | **147** |                                                                                            |

SenderUtilities.spec.ts adds ten tests without mounting a browser component:
grapheme counting, trigger/query ranges, autocomplete and highlight helpers.
They remain separately counted rather than inflating the mounted CT total.

## Fixture and assertion design

- Mount the public Sender and real extensions in focused Vue fixtures. Expose
  input controls and observable event/state outputs instead of replacing the
  component's interaction logic with mocks.
- Use real keyboard operations, clipboard events, native file chooser and
  Teleport targets. Speech uses a deterministic fake handler at the external API
  boundary; this does not validate browser speech-recognition services.
- Verify exact text, structured submit payloads, event counts, block structure
  and cursor context. Do not normalize away meaningful whitespace or newlines.
- Keep per-test mount/page isolation. No shared beforeAll mount, skip/fixme,
  extra retry or new fixed sleep is used to reduce the reported case count.
- Combine only short related flows sharing an initial configuration: undo/redo,
  upload attributes/file selection, rendering/submission, and overflow/recovery.
  An earlier assertion can prevent later assertions in the same flow; different
  initialization settings and sensitive keyboard/deletion boundaries stay separate.
- Keep Actions empty/length guards in their own Actions fixture even where Core
  has similar assertions, so custom-slot integration remains represented.

The compact implementation was selected from a full 181-mount candidate. It
retains the mapped assertions in fewer independent tests; it does not prove
equivalence of every execution history or 100% line/branch coverage. The ten
production-fix-dependent tests are deliberately delivered in follow-up commits.

## Template deletion

All 24 legal deletion cases remain independent: BS-01..12 and DL-01..12.
They cover ordinary/last-character deletion, empty-block exit/removal, entry
from neighboring text, non-empty boundaries, adjacent blocks, whole-node and
real Control+A selection, partial in-block and cross-block ranges.

Assertions preserve surrounding text and verify selection context before/after
real keys. Cross-block deletion follows ProseMirror's merge semantics: the
unselected suffix survives in the remaining block. Impossible selections and
malformed nodes are outside this legal-path matrix.

## Historical E2E migration

The original suite had 81 expanded tests at 79 declaration sites. The append-to
factory accounts for the difference by expanding one declaration into three
ShadowRoot cases. These counts describe source tests, not coverage percentages.

| Old source                                                   | Expanded tests | CT destinations / retained page responsibility                                           |
| ------------------------------------------------------------ | -------------: | ---------------------------------------------------------------------------------------- |
| basic.spec.ts                                                |             27 | Core, Editor, Keyboard, Mode, Actions; basic submit/loading/cancel smoke                 |
| mention/atom.spec.ts, list.spec.ts, trigger.spec.ts          |             12 | Mention trigger/filter/navigation/Atom; structured-submit smoke                          |
| suggestion/basic.spec.ts, keyboard.spec.ts, list.spec.ts     |             16 | Suggestion filtering/keys/completion; completion-submit smoke                            |
| template/backspace.spec.ts, delete.spec.ts, boundary.spec.ts |             19 | TemplateBlock and the expanded 24-case deletion matrix; mixed-template smoke             |
| template/append-to.spec.ts                                   |              7 | Legal body/selector/ShadowRoot targets in TemplateSelect; three defensive cases deferred |

The deferred append-to cases are invalid CSS selector (A-03), detached
HTMLElement (A-04), and missing selector within ShadowRoot (A-07). A legal
connected HTMLElement target also has CT coverage. The Sender itself is mounted
inside a real ShadowRoot for default-body and explicit-body target cases.

Five files in ../../src/sender/specs/smoke remain page-level tests:

| File                       | Complete flow                                                            |
| -------------------------- | ------------------------------------------------------------------------ |
| basic-submit.spec.ts       | Input, exact submit, parent-controlled loading and cancel                |
| mention-submit.spec.ts     | Ref Mention selection and exact text/structured payload                  |
| suggestion-submit.spec.ts  | Keyboard completion and exact submitted text                             |
| template-submit.spec.ts    | Mixed Ref template editing/deletion, Select, Teleport, structured submit |
| attachments-submit.spec.ts | Empty-text attachment payload and removal state                          |

## Known boundaries

The initial migration does not claim public action-slot scope, Ref-only
Suggestion refresh, or immediate close/clear/input coverage; these require
separate product fixes. Template/Mention simultaneous registration remains
outside this work. Auto-mode clearing is checked after the existing transition
guard settles; immediate clearing during that guard is not claimed fixed.
Mention allowSpaces covers an internal ordinary space, not trailing browser NBSP.
Neither repeated passes nor the case count establish a long-term flake rate.

See [RUNTIME.md](./RUNTIME.md) for commands, evidence and measured limits.

## Follow-up fixes

The slot-scope fix adds SenderSlots.spec.ts and its public-slot fixture: seven
mounted cases covering single/multiple layout visibility, the real content
editor, actions-inline/footer/footer-right scopes and editor actions. The
current total is 154 mounts + 10 utilities; the baseline table above describes
only the independently mergeable migration. Three Suggestion regressions remain
reserved for the next fix.
