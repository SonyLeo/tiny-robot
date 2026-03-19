# Chat P5 Proposal

> Scope: refine the future `P5` direction for `packages/chat`  
> 范围：细化 `packages/chat` 未来 `P5` 阶段的方向。
>
> Status: draft  
> 状态：草案。
>
> Related:  
> 相关文档：
> - [chat-kit-design.md](./chat-kit-design.md)
> - [progress.md](../packages/chat/progress.md)
> - [chat-chat-cli-handoff.md](./chat-chat-cli-handoff.md)

---

## 1. Purpose

`P5` should no longer be treated as a vague "theme or workspace" bucket.  
`P5` 不应该再被当成一个模糊的“主题或工作区”兜底阶段。

Based on the current chat architecture and the observed workspace patterns in LobeHub-like products, `P5` should become the layer that handles:  
结合当前 chat 架构，以及 LobeHub 一类产品里已经出现的 workspace 模式，`P5` 应该被定义成专门处理下列能力的层：

- visual appearance  
  视觉外观
- workspace shell regions  
  工作区壳层区域
- active content navigation  
  活动内容导航
- workspace view state  
  工作区视图状态

It should not reopen the completed `P2` layout boundary, and it should not replace the existing `chat` runtime chain.  
它不应该重新打开已经完成的 `P2 layout` 边界，也不应该替换现有的 `chat` runtime 主链路。

---

## 2. Revised P5 Definition

`P5` should be split into three internal tracks.  
`P5` 应该拆成三个内部子方向，而不是继续用一个宽泛的大阶段来承载。

### P5-A. Theme & Appearance

Responsible for:  
负责：

- color mode  
  明暗模式
- semantic color tokens  
  语义化颜色 token
- typography  
  字体系统
- radius / border / shadow  
  圆角 / 边框 / 阴影
- density  
  密度
- bubble visual style  
  bubble 视觉风格
- surface style  
  surface 视觉风格

Can provide:  
可以提供：

- visual defaults  
  视觉默认值
- appearance presets  
  外观 preset
- preferred chat view hints such as `bubble` or `docs`  
  诸如 `bubble` 或 `docs` 这样的聊天视图偏好提示

Must not own:  
不应该负责：

- shell structure  
  壳层结构
- sidebar existence  
  sidebar 是否存在
- panel arrangement  
  panel 如何排布
- notebook visibility  
  notebook 是否可见
- content navigation source  
  内容导航的数据来源

### P5-B. Workspace Shell & Regions

Responsible for:  
负责：

- app-level shell regions  
  应用级壳层区域
- chat workspace regions  
  chat 工作区区域
- panel hosting  
  panel 宿主
- composer docking  
  composer 停靠
- top bar / action area  
  顶部栏 / 操作区
- overlay host  
  overlay 宿主

Typical regions:  
典型区域包括：

- `leftRegion`
- `centerWorkspace`
- `rightRegion`
- `topBar`
- `composerDock`
- `overlayHost`

Must not own:  
不应该负责：

- message list rendering rules  
  message list 的渲染规则
- feature enablement  
  feature enablement
- assistant outline extraction logic  
  assistant outline 的提取逻辑

### P5-C. Content Navigation & View State

Responsible for:  
负责：

- turn navigation  
  turn 导航
- active assistant content outline  
  当前 assistant 内容大纲
- scroll-sync navigation  
  滚动同步导航
- floating or inline-side navigation  
  浮动式或贴边式导航
- runtime view toggles  
  运行时视图切换

Examples:  
示例：

- `Notebook` on/off  
  `Notebook` 开关
- `fullWidth` on/off  
  `fullWidth` 开关
- `active-message-outline`
- `turn-list`
- `artifact-outline`

Must not own:  
不应该负责：

- app navigation  
  app 级导航
- theme tokens  
  theme tokens
- low-level message rendering  
  底层 message 渲染

---

## 3. Boundary With Existing Phases

### P2 boundary remains unchanged

`P2 / MCP + Layout` already formalized:  
`P2 / MCP + Layout` 已经 formalize 的内容包括：

- `layout.variant`
- `layout.placements`
- `workspace` as a pure layout variant  
  将 `workspace` 作为纯 layout variant

This must stay true.  
这个结论必须保持不变。

`P2 layout` means chat content layout only:  
`P2 layout` 只表示 chat 内容区布局：

- bubble/docs/workspace message presentation  
  bubble/docs/workspace 的消息呈现
- role placements  
  role placement
- message-list visual behavior  
  message-list 的视觉行为

It must not grow into:  
它不应该继续扩展成：

- workspace shell layout  
  workspace shell layout
- notebook side panel  
  notebook side panel
- app sidebar  
  app sidebar
- full-width reading mode  
  full-width 阅读模式
- content navigation overlays  
  内容导航 overlay

### P4 boundary remains unchanged

`P4` is still about:  
`P4` 仍然只关注：

- `AgentPreset`
- `SkillPack`
- preset consumption  
  preset consumption

`P5` should consume stable outputs from `P2` and `P4` where needed, not change their responsibilities.  
`P5` 只应该在需要时消费 `P2` 和 `P4` 已经稳定的输出，而不是反过来改写它们的职责。

---

## 4. Design Reading From Workspace Screens

From the referenced workspace-style screens, the UI can be decomposed into:  
从前面参考的 workspace 截图来看，整个 UI 可以拆成以下几层：

1. App shell  
   应用壳层
   - global sidebar  
     全局 sidebar
   - conversation list  
     会话列表
   - global navigation  
     全局导航

2. Chat workspace  
   Chat 工作区
   - center content area  
     中间内容区
   - right notebook or assistant panel  
     右侧 notebook 或 assistant panel
   - docked composer  
     停靠式 composer
   - top-right workspace actions  
     右上角 workspace 操作区

3. Active content navigation  
   活动内容导航
   - navigation attached to the center content  
     导航附着在中间内容上
   - not necessarily a permanent left or right sidebar  
     不一定是固定的左侧栏或右侧栏
   - often floating, inline-side, or overlay-based  
     往往是浮动式、贴边式或 overlay 式

4. View state  
   视图状态
   - notebook mode  
     notebook 模式
   - full-width mode  
     全宽模式
   - right panel open/closed  
     右侧面板开关
   - active anchor / active section  
     当前锚点 / 当前章节

This means the navigation model should not be designed as "left-nav vs right-nav" first.  
这意味着导航模型不应该优先被设计成“左导航 vs 右导航”。

It should be designed as "content-attached navigation inside the center workspace", with shell regions only acting as hosts when needed.  
更合理的设计是“附着在中心工作区内容上的导航层”，而 shell regions 只在需要时充当宿主区域。

---

## 5. Navigation Model

Two different navigation types should be supported in `P5-C`.  
`P5-C` 里应该支持两种不同的导航类型。

### 5.1 User Navigation

Source:  
来源：

- turns
- user prompts  
  用户提问
- conversation search results  
  会话搜索结果
- message anchors  
  消息锚点

Purpose:  
用途：

- jump to a user turn  
  跳转到某个用户 turn
- navigate the conversation trajectory  
  浏览整条对话轨迹
- locate the question that produced the current answer  
  定位触发当前回答的提问

Examples:  
示例：

- turn timeline
- question list
- search result anchor list  
  搜索结果锚点列表

### 5.2 Assistant Navigation

Source:  
来源：

- headings inside the active assistant response  
  当前 assistant 响应中的 headings
- section anchors
- tool blocks
- artifact outline
- notebook sections

Purpose:  
用途：

- jump across assistant-generated sections  
  在 assistant 生成的章节之间跳转
- follow long-form responses  
  跟随长回答浏览
- navigate active document-like content  
  浏览当前文档化内容

Examples:  
示例：

- heading outline
- artifact block index
- notebook section navigator

### 5.3 Shared rule

User navigation and assistant navigation may share:  
用户导航和助手导航可以共享：

- the same host container  
  相同的宿主容器
- the same floating panel pattern  
  相同的浮动面板模式
- the same positioning system  
  相同的定位系统
- the same scroll-sync framework  
  相同的滚动同步框架

But they must not share the same source model.  
但它们不能共享同一个 source model。

In short:  
一句话总结：

- shared host  
  共享 host
- separate source schemas  
  分离 source schema

---

## 6. Proposed Object Model

These are draft types, not implementation commitments.  
下面这些只是草案类型，不代表已经承诺实现。

```ts
type ChatThemeConfig = {
  mode?: 'light' | 'dark' | 'system'
  appearancePreset?: 'default' | 'minimal' | 'docs'
  density?: 'compact' | 'comfortable'
  bubbleStyle?: 'rounded' | 'soft' | 'flat'
  preferredChatView?: 'bubble' | 'docs'
}

type ChatWorkspacePanelKind =
  | 'history'
  | 'mcp'
  | 'notebook'
  | 'artifacts'
  | 'outline'
  | 'sources'
  | 'custom'

type ChatWorkspacePanelConfig = {
  id: string
  kind: ChatWorkspacePanelKind
  title?: string
  closable?: boolean
  defaultOpen?: boolean
  width?: 'sm' | 'md' | 'lg' | number
}

type ChatWorkspaceRegionConfig = {
  enabled?: boolean
  panels?: ChatWorkspacePanelConfig[]
  activePanelId?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

type ChatWorkspaceShellConfig = {
  enabled?: boolean
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  topBar?: {
    enabled?: boolean
    actions?: Array<'share' | 'more' | 'view-toggle'>
  }
  composerDock?: {
    mode?: 'bottom' | 'floating-bottom'
    sticky?: boolean
  }
  overlayHost?: {
    enabled?: boolean
  }
}

type ChatContentNavigationConfig = {
  enabled?: boolean
  source?: 'turns' | 'active-message-outline' | 'active-artifact-outline'
  mode?: 'floating' | 'inline-side' | 'overlay'
  anchor?: 'content-left' | 'content-right'
  followScroll?: boolean
}

type ChatWorkspaceViewStateConfig = {
  contentView?: 'chat' | 'notebook'
  widthMode?: 'reading' | 'full'
  rightPanelOpen?: boolean
}
```

The core idea of the object model above is:  
上述对象模型的核心意图是：

- theme only owns appearance  
  theme 只管视觉
- shell only owns regions and panel hosts  
  shell 只管区域和 panel host
- panel content stays replaceable  
  panel 内容可替换、可扩展
- navigation only owns content-attached navigation  
  navigation 只管内容导航
- view state only owns runtime toggles and state  
  view state 只管运行时状态

---

## 7. Panel Extensibility

The target should not be "left is always history, right is always mcp".  
终极目标不应该是“左边永远是 history，右边永远是 mcp”。

The target should be a reusable workspace shell where users can add panels based on their own needs.  
更合理的目标是做成一个可复用的 workspace shell，让用户可以按自己的需要去添加面板。

This means the design should prefer `region host + panel registry + panel state`, not fixed business slots.  
这意味着设计上应该优先采用 `region host + panel registry + panel state`，而不是固定业务槽位。

### 7.1 Why this is feasible

This is feasible because the current architecture already separates:  
这是可行的，因为当前架构本身已经把下面几层分开了：

- capability providers such as `history` and `mcp`  
  如 `history`、`mcp` 这类能力提供者
- white-box composition  
  white-box 组合能力
- shell concerns that can be introduced later  
  后续可以引入的 shell concerns

So `P5-B` can become the host layer for panels without redefining the underlying features themselves.  
因此，`P5-B` 可以成为 panel 的宿主层，而不需要重新定义底层 feature 本身。

### 7.2 First-step built-in panels

The first implementation can still ship with a small built-in set such as:  
第一版实现仍然可以先提供一小组内建 panel，例如：

- `history`
- `mcp`

But the model must leave room for:  
但模型上必须预留给这些扩展：

- `notebook`
- `artifacts`
- `outline`
- `sources`
- `custom`

### 7.3 Minimum panel behavior

The minimum interaction goal should be basic panel open and close behavior.  
最小交互目标应该是先支持基础的 panel 打开和关闭效果。

Suggested minimum actions:  
建议的最小动作包括：

- `openPanel(region, panelId)`  
  打开某个 region 中的指定 panel
- `closePanel(region)`  
  关闭某个 region
- `toggleRegion(region)`  
  切换某个 region 的开关状态
- `setActivePanel(region, panelId)`  
  切换某个 region 当前激活的 panel

These are enough for the first version and do not require advanced panel orchestration yet.  
这些动作已经足够支撑第一版，不需要一开始就做复杂的 panel 编排系统。

### 7.4 What should wait

The first version should not rush into:  
第一版不应该急着做：

- drag-resize panel width  
  拖拽调整 panel 宽度
- multi-panel simultaneous expansion  
  多 panel 同时展开
- persisted workspace layouts  
  工作区布局持久化
- complex navigation-panel linking  
  复杂的导航与 panel 联动

These can be later extensions once the host model is proven.  
这些都可以在 host 模型被验证之后再继续扩展。

### 7.5 Design principle

The key design principle is:  
这里最关键的设计原则是：

- shell owns panel placement and open state  
  shell 负责 panel 的放置位置和开关状态
- panel content owns its own rendering logic  
  panel 内容自己负责具体渲染逻辑
- feature providers remain where they are today  
  feature provider 继续留在现有能力层

In other words, `P5-B` should host panels, not redefine the capabilities inside them.  
换句话说，`P5-B` 只应该成为 panel 的宿主层，而不是去重新定义 panel 里面的能力。

---

## 8. Component Direction

If `P5` is implemented later, it should not keep expanding `TrChat.Layout`.  
如果未来真的开始实现 `P5`，就不应该继续往 `TrChat.Layout` 上追加职责。

Preferred future layering:  
建议的未来分层：

```text
WorkspaceShell
  -> shell regions
  -> top bar actions
  -> left and right panel hosts
  -> navigation host
  -> composer dock
  -> TrChat / TrChat.Root / TrChat.PresetRoot
```

Possible future components:  
未来可能出现的组件：

- `TrChat.WorkspaceShell`
- `TrChat.WorkspaceRegion`
- `TrChat.WorkspacePanel`
- `TrChat.ContentNavigation`
- `TrChat.ViewControls`

This keeps:  
这样可以保持：

- `TrChat` as the chat runtime container  
  `TrChat` 仍然是 chat runtime container
- `WorkspaceShell` as the host layer  
  `WorkspaceShell` 是宿主层
- `Theme` as the appearance layer  
  `Theme` 是视觉层

---

## 9. Entry Criteria For P5

`P5` should only start when at least one of these becomes real.  
`P5` 应该只在下面至少一个需求真正出现时再启动。

- a real workspace-shell consumer appears  
  出现真实的 workspace-shell 消费方
- a real notebook or right-panel consumer appears  
  出现真实的 notebook 或 right-panel 消费方
- content-attached navigation becomes a product requirement  
  content-attached navigation 变成明确产品需求
- theme customization must be formalized beyond basic styling  
  theme customization 需要正式超出基础样式层

Before that, do not grow:  
在此之前，不要提前扩展：

- shell APIs into `layout`  
  把 shell API 塞进 `layout`
- navigation APIs into `theme`  
  把 navigation API 塞进 `theme`
- speculative shell structure into `chat-cli`  
  把推测性的 shell 结构提前塞进 `chat-cli`

---

## 10. Non-goals

`P5` should not initially include:  
`P5` 一开始不应该包含：

- marketplace
- remote preset install  
  remote preset install
- workflow runtime  
  workflow runtime
- broad platform navigation  
  平台级大导航
- replacing the current `TrChat` runtime architecture  
  替换当前 `TrChat` runtime 架构

It should also avoid:  
它也应该避免：

- treating all navigation as one generic tree  
  把所有导航都抽象成同一个 generic tree
- collapsing user and assistant navigation into one source schema  
  把 user navigation 和 assistant navigation 合成一个 source schema
- using `workspace` layout variant as a hidden shell bundle  
  把 `workspace` layout variant 当成隐藏的 shell bundle

---

## 11. Suggested Implementation Order When P5 Starts

1. Lock boundaries in design and review docs.  
   先在 design 和 review 文档里锁定边界。

2. Define shell and navigation host types only.  
   先定义 shell 和 navigation host 的类型。

3. Start with one runtime-only white-box validation path.  
   先从一条 runtime-only 的 white-box 验证路径开始。

4. Add one concrete navigation source:  
   然后只补一个具体的 navigation source：
   - either `turns`
   - or `active-message-outline`
   - 要么先做 `turns`
   - 要么先做 `active-message-outline`

5. Add the first minimal panel-host behavior:  
   再补第一版最小 panel-host 能力：
   - `history + mcp` as built-in examples
   - basic open / close / toggle / active-panel switching
   - `history + mcp` 作为内建示例
   - 基础的打开 / 关闭 / 切换 / 激活面板能力

6. Only then consider preset or CLI-facing consumption.  
   只有做到这里之后，再考虑 preset 或 CLI-facing 的消费面。

---

## 12. One-sentence Summary

`P5` should be treated as `Theme & Appearance + Workspace Shell & Regions + Content Navigation & View State`, while keeping `P2 layout` limited to chat content layout, keeping user-navigation and assistant-navigation as separate source models that may share the same host layer, and treating left and right workspace panels as extensible hosts instead of fixed business panels.  
`P5` 应该被明确理解为 `Theme & Appearance + Workspace Shell & Regions + Content Navigation & View State`，同时继续保持 `P2 layout` 只负责 chat 内容布局，并让 user-navigation 与 assistant-navigation 保持 source model 分离、但可以共享同一个 host layer；另外，左右 workspace panel 应该被设计成可扩展的宿主区域，而不是固定业务面板。
---

## 13. Current Screenshot Reference Rule

For the current discussion cycle, referenced screenshots should be treated as visual shell references first, not as direct product-structure specifications.

Use screenshots to guide:

- outer margin and page breathing room
- shell radius and clipped inner layout
- subtle border and shadow treatment
- the overall "workspace card inside a page" feeling

Do not use screenshots alone to freeze:

- fixed panel semantics
- fixed left/right business ownership
- final navigation source models
- final `P5-B` public API shape

Short rule:

- screenshots guide shell polish
- screenshots do not yet define shell contracts

---

## 14. First Demo Validation Scope

Before formal `P5` runtime work starts, the demo should provide a lightweight visual validation surface in `packages/chat/demo`.

The first demo goal is intentionally narrow:

- verify outer shell margin
- verify shell radius
- verify shell clipping and inner overflow behavior
- verify that the chat area reads like a refined workspace card

The first demo should not be treated as proof of:

- final shell region contracts
- final panel registry design
- final notebook or navigation behavior
- final `P5-B` extensibility API

This keeps the demo useful as a fast visual check without turning it into an architecture lock-in point.

---

## 15. Current First-step Implementation Direction

If implementation starts from the current discussion, the first step should stay presentation-led:

1. add a polished outer shell to the demo
2. add page-level spacing around the shell
3. add larger radius and cleaner clipping
4. keep the existing chat content flow intact as much as possible

Only after the visual shell reads correctly should the project decide whether to introduce:

- shell regions
- panel hosts
- panel open and close state
- extensible panel registration

Near-term execution rule:

- demo-first visual validation
- boundary confirmation
- then incremental `P5-B` structure work
