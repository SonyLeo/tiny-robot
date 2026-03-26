# 聊天模块单元测试矩阵

## 目的

本文件将 `packages/chat/tests` 的单元覆盖映射到当前活跃实现面，方便确认边界、检查已覆盖场景，并判断哪些责任需要交由 E2E。

当前单元测试文件数量：12。

## 覆盖概览

| 领域 | 测试文件 | 核心验证 | 置信度 |
|:--|:--|:--|:--|
| 能力清单 | `capability-manifest.test.mjs` | 对外元数据表面 | 高 |
| chat-cli 合约 | `chat-cli-contract.test.mjs` | 消费契约的稳定性 | 高 |
| 可复用逻辑 | `composables.test.mjs` | 运行时状态、重试、model selector、附件 | 高 |
| 配置与功能 | `config-and-features.test.mjs` | 配置归一、功能投影 | 高 |
| 消息默认 | `messages.test.mjs` | 消息拷贝默认与覆盖 | 高 |
| 预设切片 | `preset-slices.test.mjs` | 白盒/默认 slice 生成 | 高 |
| 预设解析 | `presets.test.mjs` | 预设合并链、内置预设目录 | 高 |
| Provider 工厂 | `provider-factories.test.mjs` | provider 工厂与错误映射 | 高 |
| 公开表面 | `public-surface.test.mjs` | 保留公开导出与已移除分支回归 | 高 |
| 根 chatKit | `root-chat-kit.test.mjs` | 根运行时解析 | 高 |
| Scaffold 默认 | `scaffold-defaults.test.mjs` | Scaffold 输出与覆盖优先级 | 高 |
| 聚合导入 | `use-chat-slices.test.mjs` | 当前测试套件入口 | 低 |

## 详细矩阵

### 1. 能力清单

`packages/chat/tests/capability-manifest.test.mjs`

| 用例 | 验证内容 | 当前边界 |
|:--|:--|:--|
| `createChatCapabilityManifest` 生成稳定 metadata | 版本、feature/preset/slice 键、内置 Preset/Skill Pack | 对外元数据合同 |
| `CHAT_CAPABILITY_MANIFEST` 导出默认实例 | 常量与工厂输出一致性 | 公共常量稳定 |

缺口：未验证下游消费者实际使用该形状。

### 2. Chat CLI 合约

`packages/chat/tests/chat-cli-contract.test.mjs`

| 用例 | 验证内容 | 当前边界 |
|:--|:--|:--|
| `createChatCliCapabilitySurface` 暴露 contract | feature/preset/slice 键、adapter -> surface 输出形状 | chat-cli 消费层 |

缺口：没有 UI 级别的渲染验证。

### 3. Composables 与运行时

`packages/chat/tests/composables.test.mjs` 覆盖多个核心运行时路径，包括 `useChatKit`、`useModelSelector`、`useChatRequest`、`useChatConversation`、`useChatMessages`、`useChatAttachments`。

残留缺口：尚无组件级单元测试确保 leaf 组件渲染时消耗 scaffold 默认；也缺少 sender/header/history 的 DOM 级覆盖。

### 4. 配置与功能解析

`packages/chat/tests/config-and-features.test.mjs` 关注配置归一、feature 投影、prompt 优先级、legacy 兼容、mcp runtime 处理。缺口为 `TrChat` 黑盒接口的单元测试尚未增加。

### 5. 消息默认

`packages/chat/tests/messages.test.mjs` 验证 `resolveChatMessages` 的覆盖/默认合并，缺口为未做 UI 快照/渲染层验证。

### 6. 预设切片

`packages/chat/tests/preset-slices.test.mjs` 包括 layout variant、appearance、sender passthrough、mcp runtime 等输出。缺口是未通过白盒渲染验证这些 slice 的实际呈现。

### 7. 预设解析

`packages/chat/tests/presets.test.mjs` 覆盖 skill pack/preset 合并、继承、错误、内置目录、createPresetConsumptionFromAgentPreset 等。缺口是缺少组件层面的消费渲染测试。

### 8. Provider 工厂

`packages/chat/tests/provider-factories.test.mjs` 验证 provider 匹配、代理请求、错误格式化。缺口是未在浏览器级别覆盖真实代理。

### 9. 根 chatKit 解析

`packages/chat/tests/root-chat-kit.test.mjs` 覆盖 `getRootChatKitResolution` 与 `resolveRootChatKit`，缺口是 `ChatRoot` 提供层未做 mount 验证。

### 10. Scaffold 默认

`packages/chat/tests/scaffold-defaults.test.mjs` 验证 `createPresetConsumptionFromAgentPreset` 为叶子组件输出默认，缺口是未做渲染层消耗验证。

### 11. 聚合

`packages/chat/tests/use-chat-slices.test.mjs` 仅负责套件导入，本身无断言。

## 当前单元覆盖边界

优势：

- 配置归一与预设切片
- 运行时组合逻辑
- provider 封装
- 预设合并语义
- Scaffold 默认输出

弱点：

- Component 渲染在 scaffold 上下文中的行为
- `TrChat` 黑盒端到端呈现
- `TrChat.Scaffold` 的白盒叶子 fallback
- 历史/MCP/模型切换的 UI 交互

## 推荐交由 E2E 的场景

1. 以 `TrChat` 形式驱动 `config/runtime/callbacks/presetOverrides`
2. `TrChat.Scaffold` 的白盒组合 + 叶子默认
3. Welcome 提示到消息列表的转换
4. Sender 发送到助手回复
5. 模型选择与 provider 切换
6. 历史抽屉开关与会话切换
7. MCP 面板打开与管理器行为
8. 附件/发送器动作的呈现
9. 反馈交互

## 使用建议

- 修改代码前先用 `chat-implementation.md` 确认边界
- 决定新增测试时优先考虑：
  - 是否更新已有单元
  - 是否补充新单元
  - 是否更适合做浏览器级 E2E
