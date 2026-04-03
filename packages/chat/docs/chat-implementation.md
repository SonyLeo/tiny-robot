# Chat Implementation

> Last updated: `2026-04-01`
> Status: `Current source-of-truth summary`
> Scope: `packages/chat`

`packages/chat` 当前已经从“大而全的 chat 工具层”收敛为一个稳定的 chat-first facade:

- 向外提供黑盒入口 `TrChat`
- 向外提供白盒/半白盒装配入口 `TrChat.Scaffold`、`TrChat.Root`、`TrChat.Layout`
- 通过 `useChatKit` 承接 chat 级运行时
- 在 UI 层提供 workspace、history、attachments、feedback、MCP、model selector 等组合能力

当前实现说明拆分为两份细化文档：

1. [UI Rendering](./chat-ui-rendering.md)
   讲清楚 `TrChat -> TrChat.Scaffold -> TrChat.Root -> ChatDefaultRenderer` 到叶子组件的渲染装配链，以及 workspace / stacked 两条 UI 路径如何汇合。
2. [Runtime Chain](./chat-runtime-chain.md)
   讲清楚 `useChatKit` 所在的运行时链、`responseProvider` 的进入路径、`useChatConversation / useChatRequest / useChatMessages` 的职责分工，以及 runtime annotations 的用途。

对应的 docs 改造规划文档：

1. [Chat Docs Refactor Plan](./chat-docs-refactor-plan.md)
   聚焦 `docs/src/components/chat*.md` 与 `docs/demos/chat/*` 的文档分层、示例组织、MCP 最小案例和图片分析案例落点。
2. [Chat Multimodal Upload Plan](./chat-multimodal-upload-plan.md)
   记录 phase 2 中“只改 `packages/chat`、不改 `packages/kit`”前提下，如何支持 Qwen 等 OpenAI-compatible 多模态模型图片上传的实现方案。

对应的详细代码解析文档：

1. [UI Rendering Code Analysis](./chat-ui-rendering-code-analysis.md)
   从设计思路、接入场景和关键源码协作关系角度，详细解析 UI 渲染链。
2. [Runtime Chain Code Analysis](./chat-runtime-chain-code-analysis.md)
   从 provider、conversation、request、retry、optimistic turn、edit rollback 和 runtime annotations 角度，详细解析运行时链。

建议阅读顺序：

1. [src/index.ts](../src/index.ts)
2. [UI Rendering](./chat-ui-rendering.md)
3. [Runtime Chain](./chat-runtime-chain.md)
4. [UI Rendering Code Analysis](./chat-ui-rendering-code-analysis.md)
5. [Runtime Chain Code Analysis](./chat-runtime-chain-code-analysis.md)

当前代码边界可以概括为：

- 它是 `components + kit` 之上的 chat 产品层 facade
- 它不是 `packages/kit` 的完整替代品
- 它不再保留额外的 chat-cli 专用工具化层

如果后续继续扩展，优先判断是否可以沿这四条稳定扩展面承接：

- `runtime`
- `messageActions`
- `bubbleRenderers`
- `messageTransforms`

## 2026-04 Runtime Notes

- `useChatKit.retry()` only applies to the current active conversation. Switching conversations clears transient error and retry state.
- `structuredData` is a pre-send assembly input for sender/template/mention workflows. It is handled before `chatKit.sendMessage(...)` and is not part of the chat runtime request contract.
- `shell` is treated as a reactive UI config. Runtime workspace state syncs to declarative shell changes, while unrelated config updates should not overwrite user-driven expand/collapse state.
