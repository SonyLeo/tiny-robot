# TinyRobot 文档问答应用调研

> Last updated: `2026-04-03`
> Status: `Research draft`
> Scope: `docs/` 为主的正式文档站内容
> Goal: `为后续 docs AI 问答/RAG 应用实施提供第一版指导`

## 1. 文档目标

这份文档用于回答一个具体问题：

- 如果要基于 TinyRobot 当前仓库，给 `docs` 目录下的 VitePress 文档站接入一个 AI 文档问答能力
- 并且后续希望逐步演进为可维护、可评估、可扩展的文档助手

那么当前最稳妥的产品边界、技术路径、功能拆分和阶段性取舍应该是什么。

这份文档主要以 `docs/src` 下的正式文档页面作为知识源基线，不把 `packages/chat/docs` 里的过程性方案文档当成主语料来源。

## 2. 当前仓库现状

### 2.1 文档站已经具备较好的接入基础

当前 `docs` 目录已经是一个可运行的 VitePress 站点，并且已经有比较完整的自定义主题与 demo 体系：

- 站点配置在 [docs/.vitepress/config.mts](./.vitepress/config.mts)
- 自定义主题入口在 [docs/.vitepress/theme/index.ts](./.vitepress/theme/index.ts)
- 自定义布局在 [docs/.vitepress/theme/Layout.vue](./.vitepress/theme/Layout.vue)
- 站点导航和侧边栏在 [docs/.vitepress/themeConfig.ts](./.vitepress/themeConfig.ts)

这意味着：

- 后续可以把 AI 文档问答做成 VitePress 全局浮层、单独页面，或嵌入到自定义布局里
- 不需要引入额外站点框架

### 2.2 正式知识源目前主要是 `docs/src`

当前 `docs/src` 下共有 32 个 Markdown 页面，结构大致分为：

- `guide/`
- `components/`
- `tools/`
- `examples/`
- `migration/`

其中和后续文档问答最相关的内容包括：

- 组件说明页，如 `chat`、`history`、`sender`、`attachments`、`feedback`
- 工具说明页，如 `useMessage`、`useConversation`
- 示例页，如综合示例 `examples/assistant`
- 迁移页，用于回答“从旧版本升级到新版本”的问题

这些页面比过程文档更接近最终面向用户的知识表达，因此适合作为第一版问答语料主源。

### 2.3 文档站已经有本地搜索，但没有 AI 问答

当前站点在 [docs/.vitepress/config.mts](./.vitepress/config.mts) 中已经启用了：

```ts
search: {
  provider: 'local',
}
```

这意味着当前已经有：

- 本地全文搜索入口
- 本地索引构建能力

但还没有：

- 基于问题理解的检索增强
- 基于引用的答案生成
- 多轮上下文问答
- 问答结果评估与反馈闭环

所以后续更合理的方向不是“替换掉现有搜索”，而是：

- 保留本地搜索作为快速导航能力
- 额外增加 AI 问答层

### 2.4 当前 docs demo 已统一依赖 `/api/chat/completions`

文档站里的 chat、message、conversation 示例已经大量使用：

- `/api/chat/completions`
- `responseProvider`
- `toolPlugin`
- `mcpManager`

而文档站本地开发时，又通过 [docs/src/public/sw.js](./src/public/sw.js) 拦截 `/api/chat/completions` 并返回 mock 响应。

这给后续接入带来一个很重要的优势：

- 前端接线约定已经存在
- 文档站可以继续沿用 `/api/chat/completions` 作为统一入口
- 本地 mock 与真实后端切换成本较低

### 2.5 TinyRobot Chat 适合做“文档助手前端壳”

从 `docs/src/components/chat.md`、`chat-features.md`、`chat-advanced.md` 当前的正式文档表达来看，`@opentiny/tiny-robot-chat` 已经具备这些接入优势：

- `TrChat` 可直接快速落地完整聊天页
- `presetOverrides` 适合做文档站页面级差异
- `TrChat.Scaffold` / `TrChat.Root` 适合在后续做更深的布局接管
- `toolPlugin + mcpManager` 已有最小集成路径
- `history / feedback / attachments / messageActions / bubbleRenderers` 已有成熟入口

因此前端层不需要额外寻找第三方文档问答 UI。

## 3. 产品目标建议

如果要做 TinyRobot 文档问答，建议先把目标限定为：

- 面向 `docs/src` 正式文档内容的问答助手
- 帮用户快速定位文档、解释概念、串联相关页面
- 回答必须尽量带出处
- 优先回答“怎么接入”“配置写哪里”“这个能力怎么组合”这类问题

不建议第一版就把目标设成：

- 通用型大模型聊天机器人
- 对整个 monorepo 代码库做精准代码问答
- 覆盖 process docs、PR 历史、issue 讨论、commit 语义
- 一上来就做多知识库路由、多 agent 编排

第一版更适合把产品定位成：

- `文档问答 + 引用跳转 + 相关页面推荐`

而不是：

- `全知全能的项目 Copilot`

## 4. 业界最佳实践调研结论

这部分主要参考了 VitePress、LangChain、OpenAI、LlamaIndex 的官方资料。

### 4.1 不要把 AI 问答等同于“把搜索结果丢给模型”

主流框架对生产 RAG 的建议都在收敛到几条共识：

- 索引构建和在线问答要分开
- 检索、重排、生成最好拆开看待
- 要保留文档元数据与引用链路
- 要有评估与反馈闭环

LlamaIndex 的 production RAG 指南明确强调：

- retrieval chunks 和 synthesis chunks 不一定相同
- 应根据不同问题动态检索
- 需要在检索阶段和生成阶段分别优化

OpenAI 官方也把 retrieval 和 evaluation 单独列为实践主题，说明“能答”不等于“答得稳定可维护”。

### 4.2 第一版优先 two-step RAG，而不是 agentic graph

LangChain 官方在 JS RAG 文档中给出的主流实现路径有两类：

1. two-step RAG chain
2. tool-based RAG agent

对 TinyRobot 当前场景，第一版更适合：

- `用户提问 -> 检索 -> 拼上下文 -> 生成回答`

而不是一开始就上：

- query rewrite
- 多路知识源路由
- 多工具调用
- 持久化 graph state
- checkpoint 恢复

理由很简单：

- 当前问题域相对聚焦，主要围绕正式文档站内容
- 前端约定和 demo 入口已经足够清晰
- 当前最重要的是“把文档问答做对”，不是“把工作流做复杂”

### 4.3 文档问答必须保留 citation 和 metadata

这是后续可维护性的关键。

无论是 OpenAI 还是 LlamaIndex 的官方实践，都指向同一个方向：

- 检索结果必须带结构化 metadata
- 最终回答最好能映射回 source document / section / anchor

对当前仓库来说，metadata 至少应该包含：

- page title
- route/path
- heading / anchor
- section summary
- doc category
- source type
- updatedAt / version tag

第一版就应该把 citation 作为正式需求，而不是后补优化项。

### 4.4 要把间接提示注入当真实风险处理

LangChain 官方在 RAG 文档里明确把 indirect prompt injection 当成风险。

对 TinyRobot 文档问答来说，这意味着：

- 检索到的文档内容是“数据”，不是“更高优先级指令”
- 系统 prompt 中需要明确说明“仅把文档内容作为参考资料”
- 对 demo、示例代码、迁移说明的文本也不能默认完全可信

尤其当未来把 `docs/demos`、外链内容、用户上传片段也纳入检索时，这个风险会更明显。

### 4.5 评估要前置，不要等上线后凭感觉调

OpenAI 官方的评估最佳实践强调：

- 从小数据集开始
- 明确定义任务成功标准
- 反复跑评估再迭代

对当前项目，第一版就应该准备一小批评估问题集，例如：

- “如何接入 TrChat？”
- “history 和 feedback 在哪里配置？”
- “runtime 和 config 的区别是什么？”
- “MCP 最小接入步骤是什么？”
- “attachments 现在解决了什么，没有解决什么？”

评估维度至少包括：

- 是否命中文档范围
- 是否引用正确页面
- 是否存在幻觉
- 是否遗漏关键前置条件

## 5. 技术选型判断

## 5.1 前端层

推荐：

- 继续使用 `@opentiny/tiny-robot-chat`
- 文档站层通过 VitePress 自定义主题接入

理由：

- 当前仓库已经有现成的 chat public surface
- 文档 demo 已统一使用 `/api/chat/completions`
- 后续可以自然扩展出 citations、source panel、history、feedback

### 5.2 RAG 后端框架

第一推荐：

- `LangChain.js`

原因：

- 与当前 monorepo 的 Node/TS 技术栈一致
- 比 Python 路线更容易直接并入现有工程体系
- 对第一版 docs QA 来说，能力足够

暂不推荐第一版直接引入：

- `LangGraph`

原因：

- 目前不需要 graph state、checkpoint、复杂工作流
- 现阶段主要问题是知识源治理、检索质量、citation 和产品落地

保留的第二阶段选项：

- 当后续出现多知识源路由、多步工具编排、失败恢复、人工审核节点时，再考虑 `LangGraph`

### 5.3 向量与检索存储

第一版建议优先考虑：

- `Postgres + pgvector`

原因：

- 足够主流
- 工程复杂度可控
- 可以同时承载业务数据和 RAG 索引数据

但要注意：

- 一开始可以一套库
- 逻辑上仍应分开文档、chunk、embedding、问答业务数据

不建议第一版就上：

- 重型独立检索平台
- 复杂的多服务搜索集群

## 6. 推荐的目标架构

## 6.1 总体分层

推荐架构如下：

```text
docs/src markdown
  -> 文档抽取与切块
  -> embedding / metadata / index build
  -> RAG backend
  -> /api/chat/completions
  -> TinyRobot Chat UI in VitePress
```

按职责可拆成三层：

1. 内容层
   - 以 `docs/src/**/*.md` 为主语料
   - 负责抽取标题、段落、代码块、锚点、分类

2. 检索与生成层
   - 负责 chunk、embedding、检索、重排、生成、citation

3. 前端体验层
   - 负责问答 UI、来源展示、跳转、反馈、会话历史

## 6.2 第一版知识源范围

第一版建议只纳入：

- `docs/src/guide`
- `docs/src/components`
- `docs/src/tools`
- `docs/src/examples`
- `docs/src/migration`

第一版不建议默认纳入：

- `packages/chat/docs`
- `dist`
- `node_modules`
- `.vitepress/.temp`
- 任意生成产物

对 `docs/demos` 的建议是：

- 第一版不直接把 demo 源码全文作为主知识源
- 只把它当“由正式文档页面显式引用的补充材料”

原因：

- demo 代码片段容易稀释说明文档语义
- 用户大多数问题首先仍然是“概念/接入/配置”而不是“逐行理解 demo 源码”

## 6.3 第一版在线链路

推荐第一版在线链路：

1. 用户提问
2. 后端对 query 做轻量清洗
3. 按 metadata 过滤正式文档范围
4. 检索 topK chunk
5. 可选 rerank
6. 将证据拼入 prompt
7. 调 chat model 生成答案
8. 返回 answer + citations + related pages

这个链路足够支撑：

- 单轮问答
- 多轮追问
- 引用跳转
- “你可能还想看”的相关推荐

## 7. 功能范围建议

## 7.1 MVP 必做

- 文档问答输入框
- 基于 `docs/src` 正式内容的 RAG 检索
- SSE 流式回答
- 回答引用来源
- 点击来源跳转到具体页面/锚点
- 最小对话历史
- 最小反馈能力
- 后端评估问题集

### 7.2 第一版建议做但可稍后补

- 当前页面上下文增强
  - 例如把当前页面 route 作为检索 bias
- 相关页面推荐
- 无结果时的降级策略
  - 推荐搜索关键词
  - 推荐对应文档分类
- 常见问题提示词

### 7.3 第二阶段再做

- 多知识库联合问答
  - 正式文档 + demo + API schema + blog
- 查询改写
- 多轮任务型工作流
- graph state / checkpoint
- 文档版本感知
- 管理台与内容热更新

## 8. 前端接入建议

## 8.1 第一版优先做成独立 AI 问答入口

推荐两种形态二选一：

1. 全局浮动入口
   - 挂到 VitePress 自定义布局
2. 独立页面
   - 如 `/guide/ask-ai` 或 `/examples/assistant` 升级版

第一版更推荐：

- 浮动入口 + 抽屉 / 弹层聊天面板

原因：

- 对现有文档站侵入小
- 更容易和当前浏览文档场景结合

## 8.2 先用 `TrChat`，不要一开始就白盒重组

第一版前端建议直接使用：

- `TrChat`

配合：

- `presetOverrides`
- `runtime.storage`
- `callbacks`

只有在后续明确需要“右侧来源面板 / 三栏布局 / workspace 化”时，再升级到：

- `TrChat.Scaffold`
- `TrChat.Root`
- workspace slots

## 8.3 前端需要为文档问答新增的展示能力

第一版建议在消息层面增加两个能力：

1. citation 展示
   - 在回答末尾展示来源链接
   - 支持跳转到具体页面与锚点

2. related pages 展示
   - 不是最终答案的一部分
   - 更像“进一步阅读”

后续如需更强表达，可再考虑：

- 用 `messageActions`
- 或 `bubbleRenderers`
- 或 workspace 右侧面板

## 9. 后端设计建议

## 9.1 统一沿用 `/api/chat/completions`

当前 docs demo 已经把它当作统一约定，因此第一版建议继续复用：

- `POST /api/chat/completions`

后端职责：

- 接受前端 chat 请求
- 做 RAG 检索
- 调模型生成
- 返回 OpenAI-compatible SSE

这样可以最大程度复用当前示例和 chat 组件接入方式。

## 9.2 索引任务独立于在线问答

至少拆成两个流程：

1. 索引构建
   - 扫描 `docs/src`
   - 切块
   - 生成 embeddings
   - 更新检索索引

2. 在线问答
   - 检索
   - 拼上下文
   - 生成回答

不要把“每次问答现切文档、现做 embedding”放进在线链路。

## 9.3 模型接入阶段

大模型通常会在三个阶段出现：

1. `embedding 阶段`
   - 用于给 chunk 建向量

2. `answer synthesis 阶段`
   - 用于根据检索结果生成最终答案

3. `optional rerank / rewrite 阶段`
   - 第二阶段再考虑

对当前项目，第一版只需要稳定做好前两个阶段即可。

## 10. 数据拆分建议

这里的“拆分”首先指逻辑拆分，不是第一天就上多套数据库。

第一版建议至少区分这几类数据：

- `documents`
  - 原始文档页面元数据
- `document_chunks`
  - 切块后的文本
- `chunk_embeddings`
  - 向量与检索辅助字段
- `conversations`
  - 问答会话
- `messages`
  - 用户与助手消息
- `feedback`
  - 点赞/点踩/无帮助原因
- `index_runs`
  - 索引构建任务记录

关键原则：

- 文档索引数据和会话业务数据不要混成一个概念
- 即使先放在一套库里，也要逻辑上拆表或拆 schema

## 11. 评估与验收建议

## 11.1 第一版必须准备评估集

建议先手工整理 30 到 50 个问题，覆盖：

- 接入问题
- 配置问题
- 迁移问题
- 组件能力边界问题
- chat 进阶组合问题

## 11.2 第一版验收标准

至少满足：

- 大多数问题能落在 `docs/src` 范围内回答
- 回答能附带正确来源
- 不应频繁引用 process docs
- 不应把 demo mock 内容误答成产品正式能力
- 失败时能明确说“当前文档未覆盖”

## 12. 实施优先级建议

### Phase 0: 研究与样本准备

- 固定第一版知识源范围
- 整理评估问题集
- 选定 embedding 模型与 chat 模型
- 选定存储方案

### Phase 1: MVP

- 建立文档索引脚本
- 搭建 `LangChain.js` 后端
- 接通 `/api/chat/completions`
- 在 VitePress 中挂载 `TrChat`
- 返回 citations
- 完成第一轮评估

### Phase 2: 产品化增强

- 当前页面上下文增强
- related pages
- 反馈闭环
- 更好的 citation UI
- 检索质量优化

### Phase 3: 工作流升级

- 多知识源
- query rewrite
- rerank 强化
- Graph workflow
- checkpoint / persistence

## 13. 当前建议结论

基于当前仓库现状与官方最佳实践，当前最推荐的方向是：

- 以前端 `TinyRobot Chat + VitePress 自定义主题` 为 UI 载体
- 以 `docs/src` 正式文档页面作为第一版知识源
- 以后端 `LangChain.js + Postgres/pgvector` 作为第一版 RAG 实现
- 继续沿用 `/api/chat/completions` 作为前后端统一协议
- 第一版优先做 `two-step RAG + citation + evaluation`
- 暂不引入 `LangGraph`、多知识库路由和复杂编排

一句话总结：

- **先把“基于正式文档的可引用问答”做对，再做“更聪明的复杂工作流”。**

## 14. 参考资料

### 仓库内参考

- [docs/.vitepress/config.mts](./.vitepress/config.mts)
- [docs/.vitepress/theme/index.ts](./.vitepress/theme/index.ts)
- [docs/.vitepress/theme/Layout.vue](./.vitepress/theme/Layout.vue)
- [docs/.vitepress/themeConfig.ts](./.vitepress/themeConfig.ts)
- [docs/src/components/chat.md](./src/components/chat.md)
- [docs/src/components/chat-features.md](./src/components/chat-features.md)
- [docs/src/components/chat-advanced.md](./src/components/chat-advanced.md)
- [docs/src/tools/message.md](./src/tools/message.md)
- [docs/src/tools/conversation.md](./src/tools/conversation.md)
- [docs/src/examples/assistant.md](./src/examples/assistant.md)
- [docs/src/public/sw.js](./src/public/sw.js)

### 官方外部参考

- VitePress custom theme
  - https://vitepress.dev/guide/custom-theme
- VitePress default theme search
  - https://vitepress.dev/reference/default-theme-search
- LangChain JS RAG
  - https://docs.langchain.com/oss/javascript/langchain/rag
- LangGraph overview
  - https://docs.langchain.com/oss/javascript/langgraph/overview
- LangGraph persistence
  - https://docs.langchain.com/oss/javascript/langgraph/persistence
- OpenAI retrieval guide
  - https://platform.openai.com/docs/guides/retrieval
- OpenAI evals guide
  - https://platform.openai.com/docs/guides/evals
- LlamaIndex production RAG
  - https://developers.llamaindex.ai/python/framework/optimizing/production_rag/
