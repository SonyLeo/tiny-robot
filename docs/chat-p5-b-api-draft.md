# Chat P5-B API Draft

> Scope: draft the minimum formal API for `P5-B / Workspace Shell & Regions`
> Status: draft
> Related:
> - [chat-p5-proposal.md](./chat-p5-proposal.md)
> - [progress.md](../packages/chat/progress.md)
> - [chat-chat-cli-handoff.md](./chat-chat-cli-handoff.md)

---

## 1. Purpose

This document defines the smallest formal API shape for the `P5-B` track.

It does not commit the repo to a final implementation yet. Its job is to turn the current demo validation into a stable implementation target.

The current demo has already validated these ideas:

- an outer workspace shell with page margin, rounded clipping, and center host
- left and right shell regions
- basic region open and close behavior
- a panel-host pattern inside the side regions
- a `fullWidth` view-state toggle that changes content width without breaking the chat layout

The next step is to formalize the minimum object model before introducing runtime components into `packages/chat`.

---

## 2. Non-goals

This draft does not yet define:

- final runtime components
- drag-to-resize behavior
- layout persistence
- multi-panel split view inside the same region
- custom panel rendering protocol
- navigation extraction logic
- notebook implementation details

Those can come later. This draft is only for the minimum shell contract.

---

## 3. Design Rules

The validated boundary is:

- `P2 layout` keeps owning chat content presentation
- `P5-B` owns workspace shell regions and panel hosting
- `P5-C` owns view state and content navigation

That means:

- `workspace` remains a pure `messageListVariant`
- `history`, `mcp`, and future panels are hosted by shell regions instead of being hardcoded into the chat layout
- panel content is not the same thing as panel host state

The shell layer should answer:

- where does a region live
- whether a region is open
- which panel is active
- what width a region prefers

It should not answer:

- how `history` works internally
- how `mcp` works internally
- how message rendering works

---

## 4. Minimum Draft Types

Recommended draft model:

```ts
type ChatWorkspaceRegionKey = 'left' | 'right'

type ChatWorkspacePanelWidth = 'sm' | 'md' | 'lg' | number

type ChatWorkspaceBuiltInPanelKind =
  | 'history'
  | 'mcp'
  | 'notebook'
  | 'outline'
  | 'sources'
  | 'custom'

type ChatWorkspaceComposerDockMode = 'bottom' | 'floating-bottom'

interface ChatWorkspacePanelDefinition {
  id: string
  kind?: ChatWorkspaceBuiltInPanelKind
  title?: string
  closable?: boolean
  defaultOpen?: boolean
}

interface ChatWorkspaceRegionConfig {
  enabled?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  width?: ChatWorkspacePanelWidth
  panels?: ChatWorkspacePanelDefinition[]
  activePanelId?: string
}

interface ChatWorkspaceShellTopBarConfig {
  enabled?: boolean
}

interface ChatWorkspaceCenterLayoutConfig {
  header?: boolean
  composerDock?: ChatWorkspaceComposerDockMode
}

interface ChatWorkspaceViewStateConfig {
  fullWidth?: boolean
}

interface ChatWorkspaceShellConfig {
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  topBar?: ChatWorkspaceShellTopBarConfig
  centerLayout?: ChatWorkspaceCenterLayoutConfig
  viewState?: ChatWorkspaceViewStateConfig
}
```

This is intentionally small.

It only covers:

- region existence
- region width
- panel list
- active panel
- minimum view state

---

## 5. Recommended First Runtime Surface

When implementation starts, the first runtime surface should stay minimal.

Recommended order:

1. `WorkspaceShell`
2. `WorkspacePanelHost`
3. `fullWidth` state consumption

The first implementation does not need:

- user-custom panel registries
- persistence
- drag handles
- nested panel layouts

The first runtime contract should be closer to:

```ts
interface TrChatWorkspaceShellProps {
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  topBar?: ChatWorkspaceShellTopBarConfig
  centerLayout?: ChatWorkspaceCenterLayoutConfig
  viewState?: ChatWorkspaceViewStateConfig
}
```

Slots can stay simple:

- `left`
- default
- `right`
- `top-bar`

This matches the current demo validation and avoids overcommitting too early.

Current runtime closeout has now moved one step beyond this first draft:

- `WorkspaceShell` now owns region collapse state in both controlled and uncontrolled modes
- `WorkspaceShell` now emits:
  - `update:leftCollapsed`
  - `update:rightCollapsed`
  - `update:leftActivePanelId`
  - `update:rightActivePanelId`
  - region-level panel change events
- `WorkspaceShell` now exposes region slot props for:
  - `collapsed`
  - `toggle`
  - `region`
  - `panels`
  - `panelItems`
  - `activePanelId`
  - `setActivePanel`
- `WorkspacePanelHost` now supports:
  - `activePanelId`
  - `defaultActivePanelId`
  - `update:activePanelId`
  - `change`

That means the current boundary is no longer only "shell shape + demo proof". It is now a minimal runtime contract with explicit region and active-panel semantics.

---

## 6. Demo-validated Decisions

The current demo already proved several useful decisions:

### 6.1 Fixed outer shell is the right first step

The most useful early win was not panel logic. It was:

- outer spacing
- rounded shell clipping
- stable center host
- shell-level height control

This should remain the first formalization target.

### 6.2 Regions should be hosts, not hardcoded business panels

The demo started with:

- left = history
- right = notebook / mcp / outline

But the real design goal is:

- left region host
- right region host

Panel content should stay replaceable.

### 6.3 `fullWidth` is view state, not layout variant

The demo validated that `fullWidth` should not be folded into `layout.variant`.

Instead:

- `messageListVariant` continues to describe content presentation
- `fullWidth` changes the workspace reading width

This belongs to `P5-C` view state, not `P2 layout`.

At the current stage, `notebook` should not be formalized as a required shell-level view state yet.

The shell should reserve generic panel hosts and slots first. A future notebook-like panel can be mounted there later without forcing the current API to commit to a notebook-specific contract too early.

---

## 7. Verification Criteria

Before any formal runtime component is marked stable, verify:

### Shell verification

- the shell can keep a fixed page-height workspace
- long chat content scrolls inside the message area instead of pushing the sender off-screen
- left and right regions can collapse without breaking the center layout

### Region verification

- region width changes do not break the center height chain
- active panel can switch without remounting the whole chat
- panel host state is separate from panel content
- region panel metadata can flow through shell runtime state before reaching the panel host

### View-state verification

- `fullWidth` only changes the content width behavior
- header remains visually stable during `fullWidth` transitions
- sender and message area transitions remain smooth

---

## 8. Immediate Next Step

The immediate next step after this draft is:

1. keep the demo as the visual validation page
2. add draft types into `packages/chat`
3. only then start the first formal `WorkspaceShell` implementation

This keeps the sequence safe:

- validate visually first
- formalize types second
- implement runtime third

## 9. Current Verified Runtime Shape

The current verified `P5-B` runtime shape is:

- `TrChatWorkspaceShell`
  - region width handling
  - controlled/uncontrolled collapse
  - shell-level active-panel state
  - shell-level panel change events
  - `fullWidth` shell view-state consumption
- `TrChatWorkspacePanelHost`
  - controlled `activePanelId`
  - uncontrolled `defaultActivePanelId`
  - `change` event
- demo composition now consumes shell slot props instead of manually translating region config into panel-host state

Current unit verification now covers:

- region width resolution
- collapse-state resolution
- panel definition -> host item mapping
- active-panel fallback and lookup behavior
