# Chat Test Boundary Baseline

Status: active post-closure process baseline.

这个文件固定了哪些测试在 post-closure cleanup 期间保护官方 chat package 路径。

配合以下文档使用：

- `./test-governance-standard.md` — 持久层模型、smoke/scenario 分割、selector/helper/scene 规则
- `./test-suite-audit-baseline.md` — 每个测试文件的详细清单

## Role

用这个文件回答：

- 哪些测试是删除兼容代码前的硬门禁
- 哪些 e2e 用例必须在官方路径上保持绿色

## Official Gate Surfaces

post-closure cleanup gate 围绕三个官方入口层级：

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

## Layer Split

### `packages/chat/tests`

这是主要的 pre-delete gate，用于：

- 快速 runtime 和 contract 反馈
- 挂载 owner-path 证明
- `TrChat` config-entry 分类证明
- 最近 owner 边界的 source-contract 证明

### `packages/test/src/chat`

这是较慢的 user-path gate，用于：

- 用户可见的端到端行为
- `TrChat` 和 whitebox scene 接线
- 完整页面交互流程
- 删除批次后的回归证明

## `packages/chat/tests` Hard Gate

| 区域 | 文件 | 说明 |
| --- | --- | --- |
| runtime entry | `runtime/trchat-config-entry.test.mjs`, `runtime/trchat-config-runtime-resolution.test.mjs`, `runtime/root-runtime.test.mjs`, `runtime/composables.test.mjs`, `runtime/provider-response-provider.test.mjs`, `runtime/openai-compatible-transport.test.mjs` | TrChat config-entry contract、runtime 连续性守卫、transport factory |
| message extension | `runtime/message-actions.test.mjs`, `runtime/message-runtime.test.mjs`, `runtime/message-transforms.test.mjs`, `runtime/render-message-normalization.test.mjs` | message id、actions、renderer、transform、normalized render |
| coverage | `runtime/chatkit-coverage.test.mjs`, `runtime/lifecycle-coverage.test.mjs`, `runtime/root-bootstrap-coverage.test.mjs` | attachments optimistic turn、lifecycle hooks、dispose、fallback chatKit |
| source contracts | `contracts/public-surface.test.mjs`, `contracts/renderer-registry.test.mjs`, `contracts/chat-messages.test.mjs`, `contracts/chat-ui-context.test.mjs`, `contracts/chat-ui-context-coverage.test.mjs`, `contracts/chat-messages-coverage.test.mjs`, `contracts/workspace-slot-contract.test.mjs`, `contracts/appearance-runtime.test.mjs`, `contracts/mcp-panel-positioning.test.mjs`, `contracts/theme-token-contract.test.mjs` | 公开面、workspace UI context、region 接线、renderer 所有权、共享文案、theme tokens、MCP affordances |
| mounted proof | `integration/trchat-entry-root-page.test.mjs`, `integration/root-page-mounted.test.mjs` | TrChat、Root+Page、Root+primitives、保留高级 provider 的挂载证明 |

## `packages/test/src/chat` Gate

### Smoke Gate（`smoke-specs/`）

| 文件 | 保护路径 |
| --- | --- |
| `smoke-specs/index.spec.ts` | entry ladder |
| `smoke-specs/history.spec.ts` | `TrChat` / Root+Page / granular |
| `smoke-specs/request-lifecycle.spec.ts` | `TrChat` / Root+Page / granular |
| `smoke-specs/attachments.spec.ts` | `TrChat` / granular |
| `smoke-specs/feedback.spec.ts` | `TrChat` / Root+Page / granular |
| `smoke-specs/model-switch.spec.ts` | `TrChat` / Root+Page |

### Scenario Gate（`scenario-specs/`）

| 文件 | 保护路径 |
| --- | --- |
| `scenario-specs/sender-actions.spec.ts` | `TrChat` / Root+Page / granular |
| `scenario-specs/layout-config.spec.ts` | `TrChat` / Root+Page / granular |
| `scenario-specs/mcp-feature.spec.ts` | 保留高级 + granular |
| `scenario-specs/message-transforms.spec.ts` | `TrChat` / Root+Page / granular |
| `scenario-specs/renderer-registry.spec.ts` | `TrChat` / Root+Page / granular |
| `scenario-specs/sender-extensions.spec.ts` | granular + 保留高级 provider |
| `scenario-specs/surface-api.spec.ts` | 官方 ladder + 保留高级 provider |
| `scenario-specs/welcome-prompts.spec.ts` | `TrChat` / Root+Page |
| `scenario-specs/workspace-slots.spec.ts` | `TrChat` workspace |
| `scenario-specs/whitebox-slots.spec.ts` | `Root + Page` |
| `scenario-specs/error-retry.spec.ts` | `TrChat` |
| `scenario-specs/message-edit.spec.ts` | `TrChat` |
| `scenario-specs/message-list-config.spec.ts` | `Root + primitives` |

## Validation Baseline

### 删除前必须运行

```bash
pnpm -F @opentiny/tiny-robot-chat type-check
pnpm -F @opentiny/tiny-robot-chat test
```

### 触及 demo 级别或用户可见流程时

```bash
# smoke
pnpm -F tiny-robot-test test:chat:smoke
pnpm -F tiny-robot-test test:chat:smoke:full

# scenario
pnpm -F tiny-robot-test test:chat:scenario
pnpm -F tiny-robot-test test:chat:scenario:full
```

两个命令分别指向 `src/chat/smoke-specs/` 和 `src/chat/scenario-specs/` 目录。

## Immediate Gate Policy

1. 每个 cleanup slice 必须保持 `packages/chat/tests` hard-gate 绿色
2. 任何改变用户可见行为的 slice 应在删除下一层前重跑最近的保留 Playwright scenario
3. legacy-only Playwright 覆盖不应单独阻止删除
4. 使用 `test-suite-audit-baseline.md` 作为有序的 landing queue

## Change Rule

如果 cleanup slice 改变了这个分类：

1. 先更新这个文件
2. 更新 `packages/test/src/chat/README.md`
3. 如果 gate 命令或推进顺序改变，更新活跃的 cleanup 计划
