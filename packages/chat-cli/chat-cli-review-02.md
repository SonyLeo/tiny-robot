# Chat CLI 检视报告 02

> 最近更新：`2026-03-27`
> 检视范围：`packages/chat-cli` 当前实现、模板目录、`packages/chat` 的上游消费 contract，以及 `packages/test` 中与脚手架相关的验证路径
> 相关文档：
> - [发布手册](./release-playbook.md)
> - [模板策略](./review/template-strategy.md)
> - [Chat CLI 设计](../../docs/chat-cli-design.md)
> - [Chat 进度](../chat/progress.md)

---

## 1. 文档角色

这份文档专门回答三个问题：

1. 当前 `chat-cli` 做到了什么
2. 当前这轮检视中，哪些问题已经处理
3. 由于 `packages/chat` 仍在持续演进，哪些问题先停在这里，不继续往下扩

它是检视报告，不是发布手册。

外部命令、演示发布、`dist-tag` 策略等内容，见：

- [release-playbook.md](./release-playbook.md)

---

## 2. 当前状态判断

截至 `2026-03-27`，`chat-cli` 已经不再是一个“纯目录复制器”。

当前它已经具备：

- registry 驱动的模板选择，而不是 CLI 入口里写死模板列表
- 模板目录复制、变量替换、工作区依赖版本替换
- 模板目录与 registry 元数据的一致性校验
- 两个稳定模板：
  - `basic`
  - `agent-mcp`
- scaffold / release / smoke 三层验证框架

同时，上一轮检视里最核心的几项模板问题，已经完成第一阶段收口：

- `basic` 已收口为黑盒 `TrChat` starter
- `agent-mcp` 已收口为 `TrChat.Scaffold` 白盒 starter
- 共享模板文件已抽到 `templates/base`
- 模板依赖闭包已增加静态校验
- 模板校验已从只会认 `whitebox-slices`，升级为 mode-aware 校验
- `postScaffoldSteps` 已真正接到 CLI 的 next steps 输出

因此，当前 `chat-cli` 的判断不再是：

- “能力不够”

而是：

- “主模板路径已基本收口，但更深的 contract 单源化和对外发布门禁，还不适合在 `chat` 主线仍持续变化时继续深入”

---

## 3. 当前实现快照

### 3.1 CLI 入口层

当前 CLI 入口在：

- `packages/chat-cli/src/index.ts`

已具备：

- 命令行参数解析
- `--template` / `--provider` / `--yes` / `--install` / `--no-install` / `--overwrite` / `--cwd`
- registry 驱动的模板选择
- 可选自动安装依赖
- mode 无关的模板生成入口

### 3.2 模板注册表层

当前 registry 在：

- `packages/chat-cli/src/templateRegistry.ts`

目前已经表达：

- 稳定模板 id
- 模板目录
- `baseTemplateDir`
- 支持的 provider
- `requiredChatFeatures`
- `contractUsage`
- `postScaffoldSteps`

也就是说，模板已经不再只是“目录名”，而是具备一定程度的模板元数据能力。

### 3.3 模板实现层

当前稳定模板：

- `packages/chat-cli/templates/basic`
- `packages/chat-cli/templates/agent-mcp`

当前共享模板层：

- `packages/chat-cli/templates/base`

模板角色目前已经比较明确：

- `basic`
  - 面向通用 agent
  - 使用黑盒 `TrChat`
- `agent-mcp`
  - 面向带 MCP 的工具型 agent
  - 使用 `TrChat.Scaffold`

### 3.4 上游 `chat` 消费 contract

`packages/chat` 已经暴露了专门面向 CLI 消费的能力面，主要在：

- `packages/chat/src/adapters/chatCli.ts`
- `packages/chat/src/capabilities.ts`

也就是说，`chat` 已经具备：

- feature key 集合
- preset prop key 集合
- preset slice key 集合
- manifest 形式的 capability 描述

但这条线还没有在 `chat-cli` 内完全收口成单一来源。

---

## 4. 检视项状态总览

这一轮检视里涉及的主要问题，当前状态如下：

| 问题 | 当前状态 | 说明 |
|:--|:--|:--|
| 模板角色不清 | `已处理第一阶段` | `basic` 改黑盒，`agent-mcp` 改 `Scaffold` |
| 模板目录重复过高 | `已处理第一阶段` | 已引入 `templates/base`，共享文件已抽出 |
| 模板校验强绑 `whitebox-slices` | `已处理第一阶段` | 已改为 mode-aware 校验 |
| `postScaffoldSteps` 不生效 | `已处理` | 已接入 CLI next steps 输出 |
| 模板依赖闭包不完整 | `已处理第一阶段` | 已补模板顶层依赖并增加静态闭包校验 |
| 模板目录被当作 workspace 包 | `已处理` | 已从 `pnpm-workspace.yaml` 中排除 |
| `chat` / `chat-cli` 双份 contract 常量 | `暂缓` | 仍需收口，但 `chat` 主线仍在变 |
| 文档多处重复维护 | `暂缓` | 已处理局部 README，但 docs 总体还未完全同步 |
| clean install 发布门禁 | `暂缓` | 仍缺真实外部安装级验证 |

---

## 5. 已处理的检视项

### 5.1 `basic` 已从底层 contract 样例收口为黑盒 starter

上一轮最重要的问题之一是：

- `basic` 不是最小 starter
- 它更像一个 `chatCapabilitySurface.presetSlices` 的白盒示例

这一点现在已经完成第一阶段收口。

当前 `basic` 模板已改为：

- `TrChat`
- `chat.config.ts`
- `chatRuntime`

也就是说，默认模板不再强制新用户一开始就面对：

- `Root / Layout / Header / MessageList / Sender`
- `chatCapabilitySurface`
- `presetSlices`

这让 `basic` 的职责重新回到：

- 通用 agent 的最小起步模板

### 5.2 `agent-mcp` 已收口到正确的白盒层级

上一轮另一个核心问题是：

- `agent-mcp` 虽然应该保留白盒能力
- 但不应该继续停在更底层的 slices wiring 路径

这一点也已经处理到第一阶段：

- `agent-mcp` 已切到 `TrChat.Scaffold`
- MCP runtime 注入仍保留在模板层
- 页面结构仍可控
- 但不再要求模板自己维护更底层的 adapter-to-slices 路径

这让 `agent-mcp` 更符合它应有的角色：

- 工具型 agent 的白盒 starter
- 而不是底层 contract fixture

### 5.3 模板共享层已经落地

上一轮检视里很明确的一项问题是：

- `basic` 与 `agent-mcp` 目录重复度过高
- `agent-mcp` 本质上更像 `basic + MCP overlay`

这一点已经完成第一阶段修复：

- 当前共享文件已抽到 `packages/chat-cli/templates/base`
- `basic` 与 `agent-mcp` 只保留各自真正的 overlay 文件
- `scaffoldProject()` 已支持按 `base -> overlay` 顺序复制模板层
- registry 也已支持 `baseTemplateDir`

这说明模板系统已经从：

- 两个高度重复的独立目录

收口为：

- `base + overlay`

虽然还不是未来更复杂的组合式模板系统，但已经把最明显的重复清掉了。

### 5.4 模板校验逻辑已不再只绑定 `whitebox-slices`

上一轮有一个明显问题：

- `template-release-utils.mjs` 只会校验 `chatCapabilitySurface` / `slices.*` / `TrChat.Root`

这只对旧的 `whitebox-slices` 模板成立。

这一点现在已经处理：

- `blackbox-component` 路径会校验 `TrChat`
- `scaffold-slots` 路径会校验 `TrChat.Scaffold` 以及必要白盒叶子组件
- `whitebox-slices` 仍然保留兼容校验，但不再是唯一模板模式

这意味着模板治理层已经从：

- 实现细节绑定

转向：

- mode-aware 的模板模式校验

### 5.5 `postScaffoldSteps` 已真正生效

上一轮检视里提到：

- registry 里有 `postScaffoldSteps`
- 但 CLI 的 next steps 仍然是硬编码输出

这一点现在已经收口：

- `postScaffoldSteps` 已接到 CLI 输出
- `basic` 与 `agent-mcp` 可以输出不同的后续动作提示

因此这一项已不再是“只声明不驱动”的空抽象。

### 5.6 模板依赖闭包已处理到静态可验证

上一轮检视里指出：

- 模板没有显式补齐 `markstream-vue`
- 模板没有显式补齐 `dompurify` / `markdown-it`
- 模板却显式带了大概率不需要的 `@opentiny/tiny-robot-svgs`

这一点现在已经处理到第一阶段：

- 模板顶层依赖已补齐：
  - `markstream-vue`
  - `dompurify`
  - `markdown-it`
- 模板顶层显式移除了：
  - `@opentiny/tiny-robot-svgs`
- release helper 中已新增静态依赖闭包校验：
  - `validateTemplateDependencyClosure()`

这一步还不等于“真实 clean install 已被完整证明”。

但至少现在已经从：

- “问题只停留在 review 里”

前进到了：

- “问题已进入模板静态门禁”

### 5.7 模板目录已不再被 workspace 误识别

当前仓库里一个非常现实的阻塞是：

- `packages/chat-cli/templates/**` 会被 `pnpm-workspace.yaml` 当成工作区包

这会直接导致：

- `pnpm install` 去解析模板项目的对外依赖
- 进而在未发布版本上卡死

这一点已处理：

- 模板目录现在已从 workspace 定义中排除

这项修复不属于模板设计问题，但它直接关系到：

- 本地安装
- 发布前验证
- 后续 clean install 门禁落地

所以它应视为本轮已处理的实际问题。

---

## 6. 暂缓处理的检视项

下面这些问题并不是“不重要”，而是因为当前 `packages/chat` 仍在持续更新，不适合继续深挖。

当前阶段建议先收口到这里。

### 6.1 `chat` / `chat-cli` 双份 contract 常量仍未完全单源化

这是当前最明确的剩余结构性问题之一：

- `packages/chat` 已有自己的 CLI contract / manifest
- `packages/chat-cli` 仍维护了一份自己的 key 集合

这个问题后续一定要收口。

但当前不建议继续深推，原因是：

- `chat` 主线还在更新
- 上游 contract 仍可能继续变化
- 现在过早强行收口，容易出现“刚收一次，随后又要重新开口”的反复

因此这项建议暂缓，等 `packages/chat` 相关 contract 更稳定后再继续处理。

### 6.2 docs 总体重复维护问题仍未完全解决

当前已处理的是：

- 模板 README 已和新模板角色基本对齐
- `packages/chat-cli/README.md` 已做过局部收口

但更完整的 docs 分工仍未收完，包括：

- `docs/src/components/chat-cli.md`
- docs 站点里对模板角色、whitebox / blackbox 路径的表达
- 一些旧术语和新模板模式之间的同步

这条线依赖：

- 模板形态已经稳定
- `chat` 侧相关文档表述不再频繁变化

因此当前阶段不建议再把 review 扩展到 docs 全量收口。

### 6.3 clean install 发布门禁仍未完整落地

虽然模板依赖闭包已经补了静态校验，但这还不等于：

- 对外真实创建项目
- 对外真实安装依赖
- 对外真实执行 build

当前还缺的是：

- 完整 clean install 级别的发布门禁

但这条线已经明显更偏发布与环境问题，而不是模板本体 review。

因此它应该继续归到：

- 发布手册
- 发布验证
- CI / release gate

而不再继续扩展到这份 review 文档里。

---

## 7. 为什么检视先收口到这里

当前 `chat-cli` 相关 review 之所以建议先停在这里，不是因为问题都处理完了，而是因为：

- 模板主形态已经收口
- 目录去重已经完成第一阶段
- 静态依赖闭包门禁已经补上
- 再往下的关键问题，已经明显依赖 `packages/chat` 主线的继续稳定

也就是说，当前继续深挖的收益会迅速下降，反而更容易：

- 和 `chat` 正在推进的主线互相干扰
- 提前固化还没完全稳定的上游 contract
- 让 review 文档和真实主线再次漂移

因此当前更合理的策略是：

- `chat-cli` review 先在这里收口
- `chat` 主线继续推进
- 等上游 contract 更稳定后，再回头处理：
  - contract 单源化
  - docs 总体收口
  - clean install 发布门禁的正式化

---

## 8. 当前建议的停止线

在 `packages/chat` 仍持续更新的前提下，当前 `chat-cli` 的相关检视建议先停在这里：

- 不继续扩展新的模板模式
- 不继续发明新的 CLI 专属 chat 抽象
- 不急着把 `chat` / `chat-cli` 的 contract 常量彻底合并
- 不急着把 docs 全量重写

后续动作建议限定为：

- 跟随上游 `chat` 稳定 contract 做消费侧修正
- 维持现有两个公开模板的正确性
- 在需要发布时继续补发布门禁与外部验证

---

## 9. 一句话结论

截至 `2026-03-27`，`chat-cli` 这轮 review 里最重要的模板问题已经处理到一个合理阶段：

> `basic` 已收口为黑盒 starter，`agent-mcp` 已收口为 `Scaffold` 白盒 starter，共享模板层与静态依赖闭包门禁也已经落地。由于 `packages/chat` 仍在持续更新，更深的 contract 单源化与整体文档收口，建议先停在这里，等上游进一步稳定后再继续处理。

