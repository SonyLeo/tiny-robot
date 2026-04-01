# Chat Workspace 布局扩展进度

> Last updated: `2026-03-31`
> Status: `In progress`
> Primary doc:
> - [布局扩展实现方案](./workspace-layout-extension-implementation.md)

## 1. 当前结论

当前默认布局已经切换到：

- 桌面端默认两栏
- 左侧栏默认展开，可折叠为 rail
- 右侧工作区默认隐藏
- 内部结构按三栏 workspace shell 实现
- 移动端已支持左侧 drawer 降级

## 2. 阶段状态

| 阶段 | 状态 | 目标 | 备注 |
| --- | --- | --- | --- |
| P0 文档冻结 | 已完成 | 冻结实现方向、状态模型、实施顺序 | 已完成 |
| P0.5 Demo 原型验证 | 已完成 | 用白盒 demo 验证截图对应布局 | 已确认通过 |
| P1 Contract 接入 | 已完成 | 新增 `shell` 类型与 config/preset 链路 | 已打通 |
| P2 Workspace 壳接入 | 已完成 | 接入 `WorkspaceShell`，默认左开右关 | 已接入默认黑盒链路 |
| P3 左侧 rail / 右侧空态 | 已完成 | 完成截图对应交互 | 已落地 |
| P4 移动端降级 | 已完成 | 左 drawer、右 modal/sheet | 左 drawer 与右 sheet 已落地 |
| P5 Demo / 测试 / 文档同步 | 进行中 | demo、测试、说明文档更新 | 包级验证已通过，用户文档与黑盒示例继续补齐 |

## 3. 任务清单

### P1 Contract 接入

- [x] 新增 `src/types/workspace.ts`
- [x] 导出 `shell` 相关类型
- [x] `ChatConfig` 支持 `shell`
- [x] `presetOverrides` 支持 `shell`
- [x] `presetSlices` 支持 `shell`

### P2 Workspace 壳接入

- [x] 新增 `components/workspace/WorkspaceShell.vue`
- [x] 新增 `useWorkspaceRegion.ts`
- [x] 新增 `runtime.ts`
- [x] `ChatDefaultRenderer.vue` 切换到 `WorkspaceShell`

### P3 左侧 rail / 右侧空态

- [x] 新增 `ChatWorkspaceSidebar.vue`
- [x] 新增 `ChatWorkspaceSidebarRail.vue`
- [x] 新增 `ChatWorkspaceRightPanel.vue`
- [x] 新增 `ChatWorkspaceRightEmpty.vue`
- [x] `ChatHeader.vue` 收敛 left/right toggle
- [x] 默认左开右关

### P4 移动端降级

- [x] `chatUiContext` 升级为 workspace state
- [x] `ChatRoot.vue` 注入新状态
- [x] 左侧移动端 drawer
- [x] 右侧移动端 modal/sheet

### P5 Demo / 测试 / 文档同步

- [x] 黑盒 demo 更新
- [x] 白盒 demo 更新
- [x] 新增 `workspace-slot-contract.test.mjs`
- [x] 新增更高层行为测试或 `workspace-shell.spec.ts`
- [x] 更新 `history.spec.ts` 断言
- [x] 更新主说明文档

### P6 Contract 收敛与原型验证

- [x] 收敛 workspace slot 设计到 `left / left-rail / right / mobile-left / mobile-right`
- [x] 新增 `SidebarShell = brand + content` 的内部原型
- [x] 白盒 demo 原型验证“brand + 功能区”左侧控制台
- [x] `SidebarShell` 先保持内部组件，不立即公开导出
- [x] 移动端左侧 override 采用 `mobile-left -> left -> default sidebar` fallback

### P7 下一轮正式实现

- [x] 黑盒 `TrChat` 接入面板级 workspace slot 透传
- [x] `ChatWorkspaceLayout` 接入 `mobile-left`
- [x] `ChatHistory.vue` 收敛为 workspace mobile-left 兼容层
- [x] 明确并冻结 workspace 目标目录拓扑
- [x] 规划移动端左侧容器拆分（不复制内容组件）
- [x] 统一 `mobile-left / mobile-right` fallback
- [x] 补 workspace 专项测试
- [x] 同步用户文档与示例

## 4. 关键决策

- 默认用户体验先做成两栏，不默认常驻三栏。
- 左侧栏默认内容是 history，但左侧栏语义不是 history。
- 右侧工作区从 V1 起就是正式区域，只是默认关闭。
- V1 不引入复杂左侧 tab/panel host。
- V1 不引入复杂右侧 portal 栈，只提供正式空态容器。
- workspace 公开扩展粒度收敛到 `left / left-rail / right / mobile-left / mobile-right`。
- 左侧公共抽象优先收敛为 `SidebarShell = brand + content`，不再继续拆细公共 slot。
- 黑盒 `TrChat` 也应支持同一套面板级 slot，尽量与白盒保持一致行为和 fallback。
- 当前最需要收敛的是职责边界，不急于做大规模目录迁移。
- 移动端相关部分优先拆分“容器层”，不拆分“内容层”。

## 5. 下一轮实施方案

### 5.1 实施目标

下一轮不再扩展新的细粒度公共 slot，而是把当前方案正式落地为：

- 结构级 contract 固定为 `left / left-rail / right / mobile-left / mobile-right`
- 黑盒 `TrChat` 支持同一套面板级 slot 的透传能力
- 左侧默认实现稳定在 `SidebarShell + default content`
- 移动端左侧具备 `mobile-left` 覆盖能力
- `ChatHistory.vue` 从“左栏容器”进一步收缩为“drawer / mobile-left 兼容层”
- workspace 目录拓扑先冻结目标结构，再按阶段迁移

### 5.2 实施顺序

建议按以下顺序推进：

1. 先完成黑盒 `TrChat` 的面板级 slot 透传 contract
2. 再完成 `mobile-left` contract
3. 再完成 `ChatHistory.vue` 的 mobile-left 接线与 fallback
4. 再冻结 workspace 目标目录拓扑与容器拆分方案
5. 再补测试
6. 最后补用户文档和 demo 说明

原因：

- 产品主推黑盒接入，因此黑盒下的 workspace 自定义能力需要先闭环
- `mobile-left` 是当前桌面/移动端体验断层的唯一关键缺口
- 目录整理应建立在 contract 与容器边界已经稳定的前提上
- 先确认 contract 和 fallback，再补测试，能避免测试跟着未冻结语义反复调整
- 文档和 demo 说明应建立在最终 contract 已稳定的前提上

### 5.3 代码落点

下一轮正式实现预计主要修改以下文件：

- `packages/chat/src/components/chat/Chat.vue`
- `packages/chat/src/components/chat/ChatScaffold.vue`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatWorkspaceLayout.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/chat/workspace/ChatWorkspaceSidebarShell.vue`
- `packages/chat/src/components/chat/workspace/ChatWorkspaceSidebar.vue`
- `packages/chat/src/components/chat/workspace/ChatWorkspaceRightSheet.vue`
- `packages/chat/src/components/workspace/runtime.ts`（命名与职责评估）
- `packages/chat/src/types/workspace.ts`

测试与文档预计涉及：

- `packages/chat/tests/*workspace*`
- `packages/chat/tests/public-surface.test.mjs`
- `docs/src/components/chat.md`
- `docs/src/components/chat-advanced.md`

### 5.4 具体改动范围

#### A. `ChatWorkspaceLayout.vue`

- 增加 `mobile-left` slot
- 保持 `left / left-rail / right / mobile-right` 现有 contract 不变
- 明确结构级 fallback：
  - `mobile-left` 未提供时复用 `left`
  - `mobile-right` 未提供时复用 `right`

#### B. 黑盒 slot 透传链

- `TrChat`、`ChatScaffold`、`ChatDefaultRenderer` 透传 `left / left-rail / right / mobile-left / mobile-right`
- 黑盒与白盒尽量保持同名 slot、同语义、同 fallback
- workspace 模式外，这些 slot 不生效

#### C. `ChatHistory.vue`

- 在 workspace + mobile 模式下，优先消费 `mobile-left`
- 若未提供 `mobile-left`，则回退 `left`
- 若 `left` 也未提供，则继续渲染默认 `ChatWorkspaceSidebar`
- 保持非-workspace 模式下原有 history drawer 行为不变

#### D. 左侧默认实现

- `ChatWorkspaceSidebarShell.vue` 继续作为内部原型，不在这一轮立即承诺公开 API
- `ChatWorkspaceSidebar.vue` 保持“默认 history sidebar”定位
- 不在这一轮继续拆分 brand / toolbar / footer 等公共 slot

#### E. 目录与容器层规划

- 冻结 workspace 目标目录拓扑
- 明确 `components/workspace` 只保留基础设施职责
- 明确 `components/chat/workspace` 逐步承载 chat 语义下的 workspace 结构与默认面板
- 明确移动端左侧未来应新增独立容器，而不是继续把容器语义留在 `ChatHistory.vue`
- 本轮先规划，不立即进行大规模路径迁移

#### F. 测试

最少应补以下断言：

- 黑盒 `TrChat` 下 `left / right / mobile-left / mobile-right` 能透传到 workspace 渲染链
- workspace 模式下 `mobile-left` 能覆盖默认左 drawer
- 未提供 `mobile-left` 时能回退到 `left`
- `left` 与 `mobile-left` 都缺失时回退默认 sidebar
- `mobile-right` 未提供时能回退到 `right`
- 默认黑盒 `TrChat` 行为不发生公开 surface 回归

### 5.5 暂不做的内容

下一轮明确不做：

- 把 `SidebarShell` 直接公开为正式公共组件
- 给黑盒 `TrChat` 增加更细粒度的 workspace slot
- 在 contract 尚未完全落稳前做大规模目录迁移
- 为移动端复制一套独立的 sidebar / right panel 内容组件
- 引入更细的左侧 tab/panel host contract
- 引入 `workspace-right-empty` 这类额外细粒度公共 slot

### 5.6 开工前确认点

正式实现前只需要再确认以下 3 点：

- 黑盒 `TrChat` 是否按与白盒一致的 slot 名称直接透传 `left / left-rail / right / mobile-left / mobile-right`
- `mobile-left` 是否按“可选覆盖，默认复用 `left`”实现
- `SidebarShell` 是否先保持内部组件
- 当前白盒 demo 是否继续只作为原型验证，不作为最终公开 API 示例
- workspace 目录整理是否仅冻结目标结构，不在本轮立即大规模搬路径

## 6. 验证清单

- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat build`
- [ ] `pnpm -F @opentiny/tiny-robot-chat-demo type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat-demo build`
- [x] `pnpm -F tiny-robot-test test -- src/chat/index.spec.ts`
- [ ] `pnpm -F tiny-robot-test test -- src/chat/history.spec.ts`

当前备注：

- `history.spec.ts` 本轮执行时在测试页面 `beforeEach` 阶段超时，表现为无法定位 `text=Chat 组件`，暂未确认是否由本轮布局改造直接引起。
- 亮色/暗色主题问题已定位并修复：原因是 workspace 壳层与白盒原型存在硬编码颜色，同时左右工作区不在原有 `TrChat.Layout` 的 scoped `ThemeProvider` 作用域内。
- 白盒 demo 已改为消费正式 `TrChat.WorkspaceShell` 公共 API。
- 专项 `workspace-shell.spec.ts` 仍未补齐。
- 黑盒 `TrChat` 已支持 `left / left-rail / right / mobile-left / mobile-right` 面板级 slot 透传。
- `mobile-left` 已按 `mobile-left -> left -> default sidebar` 落地，并引入 `ChatWorkspaceLeftSheet.vue` 作为移动端左侧容器。
- 用户文档已补齐黑盒 workspace 面板级 slot 用法，并新增 docs demo 展示黑盒面板替换。
- 已新增 Playwright 场景 `workspace-slots.spec.ts`，覆盖黑盒面板级 slot 渲染与移动端 fallback 行为。
- `history.spec.ts` 已同步到新的 workspace / mobile-left 行为，黑盒桌面与移动端路径均已覆盖。

## 7. 更新记录

### 2026-03-28

- 新建布局扩展实现文档。
- 新建进度跟踪文档。
- 确认默认目标为“左开右关、左可折叠、右可按需展开”。
- 完成白盒 demo 原型验证，并据此收敛正式实现方向。
- 完成 `shell` contract 接入、workspace 基础壳、默认黑盒渲染接线。
- 完成左 rail、右侧空态和移动端左 drawer 的首轮实现。
- 完成 workspace 亮色/暗色主题修复，并将作用域提升到 `WorkspaceShell`。
- 完成右侧移动端 sheet。
- 完成白盒 demo 用法升级，改为消费 `TrChat.WorkspaceShell`。
- 通过 `@opentiny/tiny-robot-chat` type-check / build。
- 通过 `@opentiny/tiny-robot-chat-demo` build。
- 通过 `packages/test/src/chat/index.spec.ts`。

### 2026-03-31

- 收敛 workspace slot 方案，不再主推 `workspace-left-brand / toolbar / content / footer` 这类细粒度 slot。
- 明确后续结构级 contract 以 `left / left-rail / right / mobile-left / mobile-right` 为准。
- 明确左侧公共抽象收敛为 `SidebarShell = brand + content`，业务逻辑留在面板内部实现。
- 补充下一轮正式实现方案、代码落点、测试范围和开工前确认点。
- 根据产品反馈补充黑盒方案：主推 `TrChat` 也应支持与白盒一致的面板级 slot 行为。
- 补充 workspace 目标目录拓扑与移动端容器拆分建议，明确先收敛职责、后迁移路径。
- 完成黑盒 `TrChat` 的面板级 workspace slot 透传。
- 完成 `mobile-left` 与 `mobile-right` 的结构级 fallback 接线。
- 新增 `ChatWorkspaceLeftSheet.vue`，将移动端左侧容器语义从 `ChatHistory.vue` 中抽离。
- 新增 `workspace-slot-contract.test.mjs`，补齐当前 contract 的源码级保护。
- 更新 `chat.md` 与 `chat-advanced.md`，补齐黑盒 workspace 面板替换说明。
- 新增 `docs/demos/chat/workspace-panel-slots.vue`，展示黑盒 `TrChat` 下的 workspace 面板级定制。
- 新增 `packages/test/src/chat/scenarios/WorkspaceSlotsScene.vue` 与 `scenario-specs/workspace-slots.spec.ts`，补齐黑盒 workspace slot 的高层行为测试。
- 更新 `packages/test/src/chat/history.spec.ts`，同步黑盒桌面 history sidebar 与移动端 left drawer 的当前行为。
