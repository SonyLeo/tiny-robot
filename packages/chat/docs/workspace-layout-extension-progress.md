# Chat Workspace 布局扩展进度

> Last updated: `2026-04-01`
> Status: `Completed with follow-ups`
> Primary doc:
> - [布局扩展实现方案](./workspace-layout-extension-implementation.md)

## 1. 当前结论

`packages/chat` 的 workspace 布局主线已经完成，当前实现状态可以概括为：

- 默认黑盒 `TrChat` 已切换到 workspace shell 路径
- 桌面端默认是“两栏”：左侧展开，右侧隐藏
- 左侧支持折叠为 rail
- 右侧工作区是正式区域，但默认关闭
- 移动端已支持左 drawer 和右 sheet
- 黑盒与白盒已经统一到同一套面板级 slot contract：
  - `left`
  - `left-rail`
  - `right`
  - `mobile-left`
  - `mobile-right`

从“功能是否落地”来看，这一轮已经不再是实现进行中，而是进入了收口和后续优化阶段。

## 2. 阶段状态

| 阶段 | 状态 | 结论 |
| --- | --- | --- |
| P0 文档冻结 | 已完成 | 实现方向与边界已冻结 |
| P0.5 Demo 原型验证 | 已完成 | 白盒原型已验证两栏 / 三栏目标形态 |
| P1 Contract 接入 | 已完成 | `shell` 类型、config、preset、slice 链路已打通 |
| P2 Workspace 壳接入 | 已完成 | 默认黑盒链路已接入 workspace shell |
| P3 左 rail / 右侧空态 | 已完成 | 默认左开右关、左 rail、右侧空态已落地 |
| P4 移动端降级 | 已完成 | 左 drawer、右 sheet、workspace state 已落地 |
| P5 Demo / 测试 / 文档同步 | 已完成 | demo、用户文档、主要测试已同步 |
| P6 Contract 收敛与原型验证 | 已完成 | slot contract 已收敛到 5 个面板级 slot |
| P7 下一轮正式实现 | 已完成 | 文档中原“下一轮”条目大部分已在代码中落地 |
| 后续优化 backlog | 进行中 | 只保留少量收口项和可选优化项 |

## 3. 已完成范围

### 3.1 Contract 与配置链

- 已新增 `src/types/workspace.ts`
- 已导出 workspace 相关公开类型
- `ChatConfig.shell` 已落地
- `presetOverrides.shell` 已落地
- `presetSlices.shell` 已落地

### 3.2 Runtime 与 UI 状态

- `chatUiContext` 已从 history-only 状态升级为 workspace state
- `history` 语义已收敛为兼容层
- `ChatRoot.vue` 已注入新的 workspace / history 状态

### 3.3 组件与布局

- 已落地 `WorkspaceShell.vue`
- 已落地 `useWorkspaceRegion.ts`
- 已落地 workspace runtime helper
- 默认黑盒渲染器已切换到 workspace shell
- 默认左侧 sidebar / rail / 右侧 panel / 右侧空态已落地
- 移动端左侧容器 `ChatWorkspaceLeftSheet.vue` 已落地
- 移动端右侧容器 `ChatWorkspaceRightSheet.vue` 已落地

### 3.4 黑盒 / 白盒 contract

- 黑盒 `TrChat` 已支持面板级 slot 透传：
  - `left`
  - `left-rail`
  - `right`
  - `mobile-left`
  - `mobile-right`
- `mobile-left -> left -> default sidebar` fallback 已落地
- `mobile-right -> right -> default right panel` fallback 已落地
- 白盒路径当前主用 `TrChat.Scaffold + TrChat.WorkspaceLayout`

说明：

- 当前白盒 demo 并不是“直接消费 `TrChat.WorkspaceShell`”的示例
- 当前白盒 demo 更接近“在 scaffold 提供的 preset/runtime 基础上手动重组页面结构”

### 3.5 Demo、文档、测试

- 黑盒 demo 已更新
- 白盒 demo 已更新
- 用户文档已补齐 workspace 面板级 slot 用法
- 已新增 docs demo 展示黑盒 workspace 面板替换
- 已新增源码级 contract 测试 `workspace-slot-contract.test.mjs`
- 已新增 Playwright 场景 `workspace-slots.spec.ts`
- `history.spec.ts` 已同步到当前 workspace / mobile-left 行为

## 4. 当前验证状态

以下项目可以视为已通过：

- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat build`
- [x] `pnpm -F @opentiny/tiny-robot-chat-demo build`
- [x] `pnpm -F tiny-robot-test test -- src/chat/index.spec.ts`
- [x] `pnpm -F tiny-robot-test test -- src/chat/history.spec.ts`
- [x] `pnpm -F tiny-robot-test test -- src/chat/scenario-specs/workspace-slots.spec.ts`
- [x] `packages/chat/tests/workspace-slot-contract.test.mjs`

说明：

- `@opentiny/tiny-robot-chat-demo` 的 `build` 脚本本身已包含 `vue-tsc --noEmit`，因此可视为已覆盖 demo type-check
- 当前没有单独的 `workspace-shell.spec.ts`
- 但其主要覆盖目标，已经由源码级 contract 测试、workspace slot 场景测试、history 场景测试和入口 smoke 测试共同承担

## 5. 与旧进度文档相比需要修正的事实

下列旧表述已经不再准确：

- `P5 Demo / 测试 / 文档同步` 不应继续标记为“进行中”
- `history.spec.ts` 不应继续标记为未完成或超时存疑
- `chat-demo type-check` 不应继续单列为未完成
- “白盒 demo 已改为消费正式 `TrChat.WorkspaceShell` 公共 API”这条表述不准确
- “下一轮正式实现方案”中列出的绝大多数实现项已经完成，不应继续保留为当前执行计划

## 6. 建议的下一步

当前不建议继续把 workspace 主题当成一个“大型进行中改造”来推进，更合适的下一步是收口。

建议按下面顺序处理：

1. 更新 `workspace-layout-extension-implementation.md`
   - 去掉仍停留在 planning / draft 口吻的段落
   - 改成实现对齐的状态说明文档

2. 在用户文档里补一条白盒说明
   - 明确“白盒路径手动接管 footer 后，默认 footer tools 不会自动渲染”
   - 避免将来再次把 `TrModelSelector` / `TrMcpTrigger` 的手动接线误判为布局 bug

3. 评估是否还需要单独补 `workspace-shell.spec.ts`
   - 如果需要，目标应聚焦纯 shell 容器行为
   - 如果不需要，可以在进度文档中明确说明“已有覆盖已足够”

4. 只保留小规模 backlog，不再重开大实现
   - 例如：`components/workspace/runtime.ts` 是否改名为更清晰的 `regionRuntime.ts`
   - 例如：workspace 目录职责说明是否需要在实现文档中再收口一次

## 7. 明确不建议现在做的事

当前不建议再主动推进：

- 新增更细粒度的 workspace 公共 slot
- 引入复杂的左侧 tab / panel host contract
- 引入复杂的右侧 portal / artifact stack
- 在 contract 已稳定的情况下做大规模目录迁移
- 为了“文档看起来还在推进”而人为继续扩 scope

## 8. 维护建议

从现在开始，这份文档更适合承担“状态回写”和“backlog 收口”职责，而不是继续充当实施计划。

建议后续维护规则改成：

- 只记录当前代码已经发生的事实
- backlog 只保留小而明确的后续项
- 不再在本文件中保留大段尚未发生的阶段计划

## 9. 更新记录

### 2026-03-28

- 冻结 workspace 布局扩展方向
- 完成白盒原型验证
- 打通 `shell` contract 与 workspace 基础壳接线
- 完成左 rail、右侧空态、移动端左 drawer / 右 sheet
- 完成亮色 / 暗色主题作用域修正

### 2026-03-31

- 收敛 workspace slot contract 到 5 个面板级 slot
- 完成黑盒 `TrChat` 的 workspace slot 透传
- 完成 `mobile-left / mobile-right` fallback
- 新增 `ChatWorkspaceLeftSheet.vue`
- 新增 workspace slot 高层测试与相关用户文档

### 2026-04-01

- 根据最新代码与测试结果重写进度文档
- 将整体状态从“进行中”收口为“主线完成，保留少量后续项”
- 修正文档中关于 `history.spec.ts`、demo type-check、whitebox demo 接入口径等过期描述
