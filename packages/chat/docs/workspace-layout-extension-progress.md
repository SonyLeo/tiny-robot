# Chat Workspace 布局扩展进度

> Last updated: `2026-03-28`
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
| P5 Demo / 测试 / 文档同步 | 进行中 | demo、测试、说明文档更新 | demo 已通过，专项测试待补 |

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

- [ ] 黑盒 demo 更新
- [x] 白盒 demo 更新
- [ ] 新增 `workspace-shell.spec.ts`
- [ ] 更新 `history.spec.ts` 断言
- [x] 更新主说明文档

## 4. 关键决策

- 默认用户体验先做成两栏，不默认常驻三栏。
- 左侧栏默认内容是 history，但左侧栏语义不是 history。
- 右侧工作区从 V1 起就是正式区域，只是默认关闭。
- V1 不引入复杂左侧 tab/panel host。
- V1 不引入复杂右侧 portal 栈，只提供正式空态容器。

## 5. 验证清单

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

## 6. 更新记录

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
