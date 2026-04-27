# Chat Test Suite Audit Baseline

Status: active working inventory.

这个文件是当前 chat 测试套件的文件级清单。

配合以下文档使用：

- `./test-governance-standard.md` — 持久设计规则
- `./test-boundary-baseline.md` — 当前 gate 策略和 boundary handoff 矩阵

## `packages/chat/tests` 目录结构

```
tests/
  runtime/           # runtime 语义、请求行为、会话状态
  contracts/         # 公开 contract 证明、source-of-truth 断言
  integration/       # 挂载 owner-path 证明
  _harness.mjs       # 最小 runner/harness
  _helpers.mjs       # 共享 import/helper（含 createMockFetch / createMockRuntime / createMockClipboard）
  _stubs/            # SSR/import 隔离 stub
  css-loader.mjs     # 挂载测试的样式 loader
  run-all.mjs        # package-local 测试 runner
```

## `packages/chat/tests` 文件清单

### Runtime

| 文件 | Status | Gate | 保护路径 | 说明 |
| --- | --- | --- | --- | --- |
| `runtime/trchat-config-entry.test.mjs` | keep | hard | `TrChat` | config-entry 分类和 target-config contract |
| `runtime/trchat-config-runtime-resolution.test.mjs` | keep | hard | `TrChat` | 同 config 下 runtime 连续性守卫 |
| `runtime/root-runtime.test.mjs` | keep | hard | `Root + Page`, `Root + primitives` | root bootstrap、sender/history/model/runtime 所有权 |
| `runtime/composables.test.mjs` | keep | hard | runtime-owned conversation/request/sender | 核心 runtime 流程证明 |
| `runtime/message-actions.test.mjs` | keep | hard | runtime message extensions | 内置/自定义 message action 所有权 |
| `runtime/message-runtime.test.mjs` | keep | hard | runtime message identity | messageId view-state、edit、copy、retry bridge |
| `runtime/message-transforms.test.mjs` | keep | hard | runtime transforms | chunk/final transform 语义 |
| `runtime/openai-compatible-transport.test.mjs` | keep | hard | transport factory | 支持的请求 transport 和错误面 |
| `runtime/provider-response-provider.test.mjs` | keep | hard | 保留高级 `TrChat.Provider` | 支持的 responseProvider 分支 |
| `runtime/render-message-normalization.test.mjs` | keep | hard | runtime render messages | 规范化 render-message/source-message 映射 |
| `runtime/chatkit-coverage.test.mjs` | keep | hard | useChatKit | sendMessage attachments optimistic turn、regenerate 边界 |
| `runtime/lifecycle-coverage.test.mjs` | keep | hard | createRuntimeFromConfig lifecycle | beforeSend/afterReceive/error 时机、dispose effectScope |
| `runtime/root-bootstrap-coverage.test.mjs` | keep | hard | createRootBootstrapState | fallback chatKit 代理行为 |

### Contracts

| 文件 | Status | Gate | 保护路径 | 说明 |
| --- | --- | --- | --- | --- |
| `contracts/public-surface.test.mjs` | keep | hard | public package surface | 导出 contract 和已退役面证明 |
| `contracts/renderer-registry.test.mjs` | keep | hard | renderer contract | runtime-owned renderer registry 证明 |
| `contracts/chat-messages.test.mjs` | keep | hard | shared copy contract | 集中文案 contract |
| `contracts/chat-ui-context.test.mjs` | keep | hard | workspace UI context contract | 响应式 host/mobile shell 行为 |
| `contracts/chat-ui-context-coverage.test.mjs` | keep | hard | workspace UI context | workspace region open/close/toggle/collapse/expand |
| `contracts/chat-messages-coverage.test.mjs` | keep | hard | shared copy contract | mcp/sidebar 分组的部分覆盖合并 |
| `contracts/mcp-panel-positioning.test.mjs` | keep | hard | MCP UI contract | panel 定位和 MCP affordances |
| `contracts/workspace-slot-contract.test.mjs` | keep | hard | workspace slot contract | 桌面/移动端 slot 规则和 owner region inputs |
| `contracts/appearance-runtime.test.mjs` | keep | hard | official display config | appearance/runtime contract 对齐 |
| `contracts/theme-token-contract.test.mjs` | keep | hard | appearance/theming | theme token contract |

### Integration

| 文件 | Status | Gate | 保护路径 | 说明 |
| --- | --- | --- | --- | --- |
| `integration/root-page-mounted.test.mjs` | keep | hard | `Root + Page`, `Root + primitives`, 保留高级 provider | 挂载 owner-path、granular 组合、保留 `TrChat.Provider(responseProvider)` 叶组合证明 |
| `integration/trchat-entry-root-page.test.mjs` | keep | hard | `TrChat` | `TrChat` 到 Root+Page 的 handoff 证明 |

### Support Files

| 文件 | Status | 说明 |
| --- | --- | --- |
| `run-all.mjs` | support | package-local 测试 runner |
| `_harness.mjs` | support | 最小 runner/harness |
| `_helpers.mjs` | support | 共享 import/helper，含 `createMockFetch` / `createMockRuntime` / `createMockClipboard` |
| `css-loader.mjs` | support | 挂载测试的样式 loader |
| `_stubs/empty-module.mjs` | support | SSR/import stub |
| `_stubs/markstream-vue.mjs` | support | SSR/import stub |
| `_stubs/tiny-robot.mjs` | support | 挂载 contract 测试用的组件 stub |

---

## `packages/test/src/chat` 目录结构

```
src/chat/
  smoke-specs/       # smoke 级别 Playwright spec（入口、历史、生命周期、附件、feedback、模型切换）
  scenario-specs/    # feature 级别 Playwright spec
  scenarios/         # Vue scene 组件和共享 demo fixture
  index.vue          # demo 入口和 chatMode 路由
  mockChatApiPlugin.ts
  mockProvider.ts
  selectors.ts
  testHelper.ts
  README.md
```

## `packages/test/src/chat` 文件清单

### Smoke Specs（`smoke-specs/`）

| 文件 | Status | Gate | 保护路径 | 说明 |
| --- | --- | --- | --- | --- |
| `smoke-specs/index.spec.ts` | keep | smoke | entry ladder | 顶层场景切换和官方入口可见性 |
| `smoke-specs/history.spec.ts` | keep | smoke | `TrChat` / Root+Page / granular | history、reset、mobile drawer、会话流程 |
| `smoke-specs/request-lifecycle.spec.ts` | keep | smoke | `TrChat` / Root+Page / granular | send、abort、retry、optimistic state、lifecycle logs |
| `smoke-specs/attachments.spec.ts` | keep | smoke | `TrChat` / granular | upload、pending list、send/reset 清空 |
| `smoke-specs/feedback.spec.ts` | keep | smoke | `TrChat` / Root+Page / granular | assistant feedback 可见性和自定义操作 |
| `smoke-specs/model-switch.spec.ts` | keep | smoke | `TrChat` / Root+Page | 下拉行为、模型切换连续性、provider 对齐 |
| `smoke-specs/openChatSmokeScene.ts` | support | none | smoke chat-entry bootstrap | 共享 smoke-only chat-entry 和 mode-switch helper |

### Scenario Specs（`scenario-specs/`）

| 文件 | Status | Gate | 保护路径 | 说明 |
| --- | --- | --- | --- | --- |
| `scenario-specs/sender-actions.spec.ts` | keep | scenario | `TrChat` / Root+Page / granular | sender config 和 sender affordance 证明 |
| `scenario-specs/layout-config.spec.ts` | keep | scenario | `TrChat` / Root+Page / granular | display/layout contract；含 light/dark/system/no-mode appearance 变体 |
| `scenario-specs/mcp-feature.spec.ts` | keep | scenario | 保留高级 + granular | MCP trigger 和 panel 行为 |
| `scenario-specs/message-transforms.spec.ts` | keep | scenario | `TrChat` / Root+Page / granular | 官方路径上的可见 transform 行为 |
| `scenario-specs/renderer-registry.spec.ts` | keep | scenario | `TrChat` / Root+Page / granular | 真实浏览器中的 renderer registry |
| `scenario-specs/sender-extensions.spec.ts` | keep | scenario | granular + 保留高级 provider | sender suggestion/extensibility 流程 |
| `scenario-specs/surface-api.spec.ts` | keep | scenario | 官方 ladder + 保留高级 provider | slots、provider branch、granular 组合、runtime diagnostics |
| `scenario-specs/welcome-prompts.spec.ts` | keep | scenario | `TrChat` / Root+Page | prompt 渲染、prompt send、welcome slot 边界 |
| `scenario-specs/workspace-slots.spec.ts` | keep | scenario | `TrChat` workspace | 桌面和移动端 workspace region 的 slot/fallback 行为；含 7.10 region 交互覆盖 |
| `scenario-specs/whitebox-slots.spec.ts` | keep | scenario | `Root + Page` | TrChat.Page slot 透传：header-extra、footer-extra、sender、message-list、welcome、variant、emit |
| `scenario-specs/error-retry.spec.ts` | keep | scenario | `TrChat` | error 状态显示、retry 替换错误消息、regenerate 重新生成 |
| `scenario-specs/message-edit.spec.ts` | keep | scenario | `TrChat` | 进入编辑模式、保存触发重发、取消恢复原内容 |
| `scenario-specs/message-list-config.spec.ts` | keep | scenario | `Root + primitives` | 自定义 role-configs avatar、group-strategy 分组、auto-scroll |

### Shared Fixtures And Helpers

| 文件 | Status | 说明 |
| --- | --- | --- |
| `index.vue` | support | demo/test-app 入口，保持精简 |
| `mockChatApiPlugin.ts` | support | 浏览器测试的 app 级 transport stub |
| `mockProvider.ts` | support | 保留高级 provider 的 provider fixture |
| `selectors.ts` | keep | 共享 locator contract |
| `testHelper.ts` | keep | 共享 actions/waits，含 `clickCloseBtn` |
| `README.md` | keep | 套件使用指南 |

### Scene Fixtures（`scenarios/`）

| 文件 | Status | 消费 spec | 说明 |
| --- | --- | --- | --- |
| `scenarios/officialSceneConfig.ts` | keep | 所有 scene | 规范 scene config 默认值 |
| `scenarios/useStableSceneRuntime.ts` | keep | 多个 scene | 共享稳定 runtime-resolution helper |
| `scenarios/useSceneWelcomeState.ts` | keep | 多个 scene | 共享 welcome/message-list 切换 helper |
| `scenarios/TrChatScene.vue` | keep | smoke-specs/index, history, request-lifecycle, attachments, feedback, model-switch, sender-actions | 官方 `TrChat` 根场景 |
| `scenarios/WhiteboxScene.vue` | keep | smoke-specs/index, history, request-lifecycle, feedback, model-switch, sender-actions | 官方 `Root + Page` 根场景 |
| `scenarios/GranularScene.vue` | keep | smoke-specs/index, history | 官方 `Root + primitives` 根场景 |
| `scenarios/LayoutConfigScene.vue` | keep | scenario-specs/layout-config | layout/display 场景 fixture；含 light/system/no-mode 变体 |
| `scenarios/McpFeatureScene.vue` | keep | scenario-specs/mcp-feature | MCP 场景 fixture |
| `scenarios/MessageTransformsScene.vue` | keep | scenario-specs/message-transforms | transform 场景 fixture |
| `scenarios/RendererRegistryScene.vue` | keep | scenario-specs/renderer-registry | renderer 场景 fixture |
| `scenarios/SenderExtensionsScene.vue` | keep | scenario-specs/sender-extensions | sender extension 场景 fixture |
| `scenarios/SurfaceApiScene.vue` | keep | scenario-specs/surface-api, sender-actions | 共享高级/叶组合 fixture |
| `scenarios/WelcomePromptsScene.vue` | keep | scenario-specs/welcome-prompts | welcome prompts fixture |
| `scenarios/WorkspaceSlotsScene.vue` | keep | scenario-specs/workspace-slots | workspace slot fixture（含 mobile-override 变体） |
| `scenarios/WhiteboxSlotsScene.vue` | keep | scenario-specs/whitebox-slots | TrChat.Page slot 透传 fixture；含 close emit 变体 |
| `scenarios/ErrorRetryScene.vue` | keep | scenario-specs/error-retry | error/retry/regenerate 场景 fixture |
| `scenarios/MessageEditScene.vue` | keep | scenario-specs/message-edit | 消息编辑场景 fixture；预置 initialMessages |
| `scenarios/MessageListConfigScene.vue` | keep | scenario-specs/message-list-config | role-configs/group-strategy/auto-scroll 场景 fixture |
| `scenarios/FeedbackScene.vue` | keep | smoke-specs/feedback | feedback replace mode 场景 fixture |
| `scenarios/WorkspaceInteractionScene.vue` | keep | scenario-specs/workspace-slots | 单实例全宽 workspace 交互场景（避免 grid 布局导致 isMobile=true） |

## 当前清理建议

### 冻结的 Gate 命令

```bash
# smoke
pnpm -F tiny-robot-test test:chat:smoke
pnpm -F tiny-robot-test test:chat:smoke:full

# scenario
pnpm -F tiny-robot-test test:chat:scenario
pnpm -F tiny-robot-test test:chat:scenario:full
```

两个命令现在分别指向 `src/chat/smoke-specs` 和 `src/chat/scenario-specs` 目录，不再逐个列出文件。

### 安全保留

- 所有当前 hard-gate package tests
- 当前 smoke gate
- 当前 scenario gate
- 官方 scene fixture 和 support helper

### 暂不退役

- 任何仍被保留 smoke/spec 文件依赖的 scene 或 helper
- `mockProvider.ts`（`surface-api.spec.ts`、`sender-extensions.spec.ts`、`mcp-feature.spec.ts` 仍依赖）
- 剩余 `_stubs/*` 文件（挂载集成测试仍需要）
