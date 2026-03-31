# Chat 文档契约对照表

这份文档用于把 `packages/chat` 的文档、源码、单元测试和 E2E 场景串起来看，避免出现：

- 文档写了，但源码里没有这个能力
- 源码有能力，但没有单测或场景验证
- 示例能跑，但文档里写出来的用法和真实契约不一致
- 文档里的 API、插槽、配置项可见，但没有任何自动化测试兜底

## 1. 怎么用这份对照表

每次修改 chat 文档时，按下面顺序核对：

1. 先确定文档里写的是哪一种“用户可见能力”
2. 去源码里找到唯一的契约来源
3. 去 `packages/chat/tests` 看是否有“配置投影/类型归一化/默认值”层面的单测
4. 去 `packages/test/src/chat/scenarios` 看是否有“页面里怎么用”的场景页
5. 去 `packages/test/src/chat/*.spec.ts` 或 `scenario-specs/*.spec.ts` 看是否有真正的点击、发送、切换、渲染验证

推荐判断规则：

- 配置项：必须至少有“类型/源码入口 + 单测”
- 插槽：必须至少有“默认渲染器源码 + `SurfaceApiScene` 场景 + `surface-api.spec.ts`”
- 运行时分支：必须至少有“helper/组件实现 + 单测 + E2E”
- 文档叙述：只写那些已经能在源码和测试中找到支撑的内容

## 2. 四层对照视角

### 2.1 文档层

当前 chat 主文档：

- `docs/src/components/chat.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`

当前 chat 文档示例：

- `docs/demos/chat/blackbox.vue`
- `docs/demos/chat/preset-overrides.vue`
- `docs/demos/chat/slots-header-footer.vue`
- `docs/demos/chat/scaffold-layout.vue`
- `docs/demos/chat/whitebox.vue`
- `docs/demos/chat/features-preset-overrides.vue`
- `docs/demos/chat/advanced-preset-slices.vue`
- `docs/demos/chat/shared.ts`

### 2.2 源码契约层

最关键的契约入口：

- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/scaffold.ts`
- `packages/chat/src/components/chat/Chat.vue`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatScaffold.vue`
- `packages/chat/src/components/chat/ChatRoot.vue`
- `packages/chat/src/context.ts`

### 2.3 单元测试层

最常用的单测入口：

- `packages/chat/tests/config-and-features.test.mjs`
- `packages/chat/tests/preset-slices.test.mjs`
- `packages/chat/tests/root-chat-kit.test.mjs`
- `packages/chat/tests/scaffold-runtime.test.mjs`
- `packages/chat/tests/use-chat-slices.test.mjs`

这些测试主要验证：

- `config` 归一化
- feature -> presetProps -> presetSlices 的稳定映射
- `Root` / `Scaffold` 的运行时分支
- appearance / layout / history / model 等投影结果

### 2.4 场景与 E2E 层

最关键的场景页与 Playwright 规格：

- `packages/test/src/chat/README.md`
- `packages/test/src/chat/scenarios/BlackboxScene.vue`
- `packages/test/src/chat/scenarios/WhiteboxScene.vue`
- `packages/test/src/chat/scenarios/WelcomePromptsScene.vue`
- `packages/test/src/chat/scenarios/LayoutConfigScene.vue`
- `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- `packages/test/src/chat/history.spec.ts`
- `packages/test/src/chat/feedback.spec.ts`
- `packages/test/src/chat/edge-overrides.spec.ts`
- `packages/test/src/chat/model-switch.spec.ts`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

这些场景的价值：

- `BlackboxScene`：证明默认 `TrChat` 入口能用
- `WhiteboxScene`：证明 `Root` + 叶子组件组合能用
- `WelcomePromptsScene`：证明欢迎区 prompt / slot / whitebox 分支
- `LayoutConfigScene`：证明 layout/config -> 渲染行为
- `SurfaceApiScene`：证明 slots、`Root`、`Scaffold`、`HistorySurface` 等公开 surface 真能跑

## 3. 文档页逐项映射

### 3.1 `chat.md`：`TrChat` 主线用法

#### 文档条目：`TrChat` 主入口

- 文档：`docs/src/components/chat.md`
- 源码：
  - `packages/chat/src/components/chat/Chat.vue`
  - `packages/chat/src/types/ui.ts` 中 `TrChatProps`
- 单测：
  - `packages/chat/tests/public-surface.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/BlackboxScene.vue`
  - `packages/test/src/chat/index.spec.ts`

建议：

- 这部分文档只能写“`TrChat` 是推荐入口、可直接消费 `config/runtime/callbacks/presetOverrides`”
- 不建议在这里展开实现链路描述

#### 文档条目：`config / runtime / callbacks / presetOverrides`

- 文档：`docs/src/components/chat.md`
- 源码：
  - `packages/chat/src/types/ui.ts`
  - `packages/chat/src/types/scaffold.ts`
  - `packages/chat/src/components/chat/ChatScaffold.vue`
- 单测：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
  - `packages/chat/tests/scaffold-runtime.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/BlackboxScene.vue`
  - `packages/test/src/chat/edge-overrides.spec.ts`
  - `packages/test/src/chat/model-switch.spec.ts`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

核对重点：

- `runtime.chatKit` 是否真的保留外部 provider
- `callbacks` 是否真的能从 `TrChat` 顶层触发
- `presetOverrides` 是否真的能覆盖 layout / history / feedback / sender

#### 文档条目：默认插槽

当前主文档提到的 slots：

- `header-extra`
- `footer-extra`
- `welcome`
- `sender`
- `message-list`
- `prefix`
- `suffix`
- `after`
- `content-footer`

对应源码：

- `packages/chat/src/context.ts` 中 `BUBBLE_LIST_SLOTS`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`

对应场景 / E2E：

- 场景：`packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- E2E：`packages/test/src/chat/scenario-specs/surface-api.spec.ts`

核对方式：

1. 文档里写了哪个 slot
2. 去 `ChatDefaultRenderer.vue` 看有没有真的消费
3. 去 `SurfaceApiScene.vue` 看有没有对应场景
4. 去 `surface-api.spec.ts` 看有没有断言

#### 文档条目：`TrChat.Scaffold`

- 文档：`docs/src/components/chat.md`
- 源码：
  - `packages/chat/src/components/chat/ChatScaffold.vue`
  - `packages/chat/src/types/scaffold.ts`
  - `packages/chat/src/helpers/scaffoldRuntime.ts`
- 单测：
  - `packages/chat/tests/scaffold-runtime.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - 文档 demo：`docs/demos/chat/scaffold-layout.vue`
  - 测试场景：`packages/test/src/chat/scenarios/SurfaceApiScene.vue`
  - E2E：`packages/test/src/chat/scenario-specs/surface-api.spec.ts`

必须确认：

- slot props 是否真的暴露 `chatKit / adapter / presetProps / presetSlices / currentModel / selectModel`
- 模型切换后 provider 是否真的切换
- 外部传入 `runtime.chatKit` 时，provider 是否不会被重写

#### 文档条目：`TrChat.Root`

- 文档：`docs/src/components/chat.md`
- 源码：
  - `packages/chat/src/components/chat/ChatRoot.vue`
  - `packages/chat/src/helpers/resolveRootChatKit.ts`
  - `packages/chat/src/types/ui.ts` 中 `TrChatRootProps`
- 单测：
  - `packages/chat/tests/root-chat-kit.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/WhiteboxScene.vue`
  - `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

必须确认两个分支都还活着：

- `chatKit` 分支
- `responseProvider` 分支

### 3.2 `chat-features.md`：功能配置页

#### 文档条目：`attachments`

- 源码：
  - `packages/chat/src/types/ui.ts`
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/BlackboxScene.vue`
  - `packages/test/src/chat/attachments.spec.ts`

#### 文档条目：`senderActions`

- 源码：
  - `packages/chat/src/types/ui.ts`
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/BlackboxScene.vue`
  - `packages/test/src/chat/sender-actions.spec.ts`

#### 文档条目：`welcomePrompts`

- 源码：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/WelcomePromptsScene.vue`
  - `packages/test/src/chat/scenario-specs/welcome-prompts.spec.ts`

#### 文档条目：`history`

- 源码：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/history.spec.ts`
  - `packages/test/src/chat/scenarios/BlackboxScene.vue`

#### 文档条目：`feedback`

- 源码：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/feedback.spec.ts`
  - `packages/test/src/chat/scenarios/BlackboxScene.vue`

#### 文档条目：`mcp`

- 源码：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/McpFeatureScene.vue`
  - `packages/test/src/chat/scenario-specs/mcp-feature.spec.ts`

#### 文档条目：`contentLayout`

- 源码：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/LayoutConfigScene.vue`
  - `packages/test/src/chat/scenario-specs/layout-config.spec.ts`

注意：

- 文档里现在把 `contentLayout` 明确归类为 layout，不归到 `features`
- 这类“不是 feature 的 feature 页内容”尤其要有单测和场景一起兜住

### 3.3 `chat-advanced.md`：补充资料页

#### 文档条目：`TrChat.HistorySurface`

- 源码：
  - `packages/chat/src/components/history/ChatHistorySurface.vue`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

#### 文档条目：`TrModelSelector`

- 源码：
  - `packages/chat/src/components/model-selector/ModelSelector.vue`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/WhiteboxScene.vue`
  - `packages/test/src/chat/model-switch.spec.ts`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

#### 文档条目：`TrMcpTrigger` / `TrChatMcpPanel`

- 源码：
  - `packages/chat/src/components/mcp-trigger/*`
  - `packages/chat/src/components/chat/ChatMcpPanel.vue`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/McpFeatureScene.vue`
  - `packages/test/src/chat/scenario-specs/mcp-feature.spec.ts`

#### 文档条目：`TrChatFeedback`

- 源码：
  - `packages/chat/src/components/chat/ChatFeedback.vue`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/WhiteboxScene.vue`
  - `packages/test/src/chat/feedback.spec.ts`

#### 文档条目：配置加工与投影能力

- 源码：
  - `packages/chat/src/adapters/*`
  - `packages/chat/src/presets/*`
- 单测：
  - `packages/chat/tests/config-and-features.test.mjs`
  - `packages/chat/tests/preset-slices.test.mjs`
  - `packages/chat/tests/use-chat-slices.test.mjs`
- 场景 / E2E：
  - `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

注意：

- 这一块最容易写得比测试覆盖更多
- 文档应该优先写“什么时候才需要它”，其次才是 API 列表

## 4. 插槽与配置最常见的对照方法

### 4.1 看插槽

以 `header-extra` 为例：

1. 文档里出现：`docs/src/components/chat.md`
2. 默认 renderer 是否消费：`packages/chat/src/components/chat/ChatDefaultRenderer.vue`
3. 场景页是否演示：`packages/test/src/chat/scenarios/SurfaceApiScene.vue`
4. E2E 是否断言：`packages/test/src/chat/scenario-specs/surface-api.spec.ts`

如果缺任何一层，这个文档项就不够稳。

### 4.2 看配置项

以 `presetOverrides.showHistory` 为例：

1. 类型定义：`packages/chat/src/types/ui.ts`
2. 归一化/投影：`packages/chat/tests/config-and-features.test.mjs`
3. 切片结果：`packages/chat/tests/preset-slices.test.mjs`
4. 用户行为：`packages/test/src/chat/history.spec.ts`

### 4.3 看运行时分支

以 `runtime.chatKit` 为例：

1. 类型入口：`packages/chat/src/types/scaffold.ts`
2. 实现：`packages/chat/src/components/chat/ChatScaffold.vue`
3. helper 单测：`packages/chat/tests/scaffold-runtime.test.mjs`
4. 场景/E2E：`packages/test/src/chat/scenarios/SurfaceApiScene.vue` + `surface-api.spec.ts`

这是最典型的“光看文档和源码不够，必须跑测试”的能力。

## 5. 当前最推荐的维护 checklist

每次新增或修改 chat 文档时，建议按下面 checklist 走：

### 5.1 先列出这次改动提到的文档项

按三类记录：

- 配置项
- 插槽
- 组件 surface / 运行时分支

### 5.2 给每一项找到唯一源码入口

优先查：

- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/scaffold.ts`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatScaffold.vue`
- `packages/chat/src/components/chat/ChatRoot.vue`

### 5.3 看是否已有单测

优先查：

- `packages/chat/tests/config-and-features.test.mjs`
- `packages/chat/tests/preset-slices.test.mjs`
- `packages/chat/tests/root-chat-kit.test.mjs`
- `packages/chat/tests/scaffold-runtime.test.mjs`

没有就补。

### 5.4 看是否已有场景和 E2E

优先查：

- `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- `packages/test/src/chat/scenarios/BlackboxScene.vue`
- `packages/test/src/chat/scenarios/WhiteboxScene.vue`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`

没有就补。

### 5.5 最后再写 prose

推荐顺序始终是：

1. 契约存在
2. 测试存在
3. 示例存在
4. 再把它写进文档

## 6. 当前仍然容易漂移的地方

这几个点最容易出现“文档说了，但没被持续兜住”：

- demo 标题和真实能力边界不一致
- 文档里的用户语言改了，但场景页 `data-testid` / spec 名称没同步
- `chat.md` 里出现了新的 slot 名，但没有同步去 `SurfaceApiScene.vue`
- 文档把“推荐做法”和“底层实现细节”混在一起，导致难以判断该补哪种测试

如果要长期把 chat 文档维持稳定，最稳的方式不是多写 prose，而是让每一个文档项都能落回这四层：
