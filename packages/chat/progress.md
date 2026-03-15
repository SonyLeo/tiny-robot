# Chat Kit 进度追踪

> 用于快速查看 `packages/chat` 本轮实施范围的完成情况。
> 详细评审与方案背景见 `packages/chat/chat-kit-review.md`。

## 当前状态
- 总体进度：`100%（本轮实施范围）`
- 当前阶段：`已完成，进入维护收口`
- 最近完成项：`B5 docs variant`、`useModelSelector` 一致性修复与单测补齐、组件内部命名收敛（源码去 `Tr` 前缀，对外 API 保持 `Tr*`）
- 下一步：按需做尾项整理、文档维护和后续增强
- 最近更新：`2026-03-15`

## 阶段清单

| 阶段 | 状态 | 进度 | 说明 |
|:--|:--|:--|:--|
| Phase 1 | 已完成 | `100%` | `Root + Layout`、MCP 单实例、模型切换单 owner、内部导出整理 |
| Phase 2A | 已完成 | `100%` | `config/adapter` 契约、server proxy provider |
| Phase 2B | 已完成 | `100%` | `useModelSelector`、MCP bridge、demo/template 对齐 |
| Phase 2C | 已完成 | `100%` | 模型切换回归、icon 扩展点 |
| Phase 2D | 已完成 | `100%` | provider icon 迁移到 `@opentiny/tiny-robot-svgs`、样式收敛为 CSS |
| Phase 2E | 已完成 | `100%` | chat 文案抽取到 `messages.ts`，作为后续国际化基座 |
| Phase 3A | 已完成 | `100%` | `useChatKit` 拆分为 conversation / request / messages slices |
| Phase 3B | 已完成 | `100%` | 结构化错误、`lastError`、`retry()`、demo `/mock-error` |
| Phase 3C | 已完成 | `100%` | optimistic 状态、rollback、demo `/mock-optimistic` |
| Phase 3D | 已完成 | `100%` | 统一消息动作入口、blackbox / whitebox action log |
| Phase 3E | 已完成 | `100%` | `docs variant`、demo 切换、warning 修复、样式对齐 |

## 本轮已落地能力
- 黑盒 / 白盒链路统一到 `Root + Layout` 体系，demo 可直接验证主链路。
- MCP 改为单实例接入，工具面板和实际工具调用不再脱节。
- 模型切换 owner 收敛，`useModelSelector` 已补一致性修复和单测。
- `config -> adapter -> preset UI` 契约已落地，并已接入 demo 与 chat-cli 模板。
- icon 资源迁移到 `@opentiny/tiny-robot-svgs`，样式收敛为 CSS。
- chat 文案已抽取到 `messages.ts`，作为后续整体国际化基座。
- `useChatKit` 已完成内部切片，并补齐 unit guardrails。
- 结构化错误、retry、optimistic、rollback、message action、docs variant 均已落地并验证。
- 组件源码层已收敛为按领域分组的无前缀命名；`Tr*` 统一保留在 public export 和组件运行时名称层。

## 当前验证基线
- `packages/chat/tests/use-chat-slices.test.mjs`
  作用：内部 composable 护栏，覆盖编辑、重试、optimistic、rollback、model selector
- `packages/test/src/chat/index.spec.ts`
  作用：blackbox / whitebox / edge 场景回归，覆盖 docs variant
- `packages/test/src/chat/model-switch.spec.ts`
  作用：模型切换回归
- `packages/chat/demo`
  作用：手动验证 `/mock-error`、`/mock-optimistic`、feedback action、docs variant

## 已验证命令
- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts`
- `pnpm.cmd -F docs build`

## 后续可选项
- 继续做导出面收口、demo 展示优化和文档维护。
- 国际化当前只完成“文案抽取基座”，尚未进入 runtime i18n。
- `chat-kit-review.md` 中剩余未落地的内容，可视为后续增强项，而非本轮阻塞项。
