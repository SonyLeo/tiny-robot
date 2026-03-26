# Chat CLI 检视报告 02

> 最近更新：`2026-03-26`
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
2. 当前实现里有哪些具体问题和技术债
3. 后续应该按什么顺序收口，而不是继续叠加模板复杂度

它是检视报告，不是发布手册。

发布流程、外部命令、`dist-tag` 策略等内容，见 [release-playbook.md](./release-playbook.md)。

---

## 2. 当前状态判断

截至 `2026-03-26`，`chat-cli` 已经具备这些基础能力：

- registry 驱动的模板选择，而不是 CLI 入口里写死模板列表
- 模板目录复制、变量替换、工作区依赖版本替换
- 模板目录与 registry 元数据的基本一致性校验
- 两个稳定模板：
  - `basic`
  - `agent-mcp`
- scaffold / release / smoke 三层验证

这意味着：

- `chat-cli` 已经不再是“纯目录复制器”
- 但它还没有收口成“对外可长期维护的 starter 产品层”

当前最核心的问题不是“没有能力”，而是：

- 模板角色边界不清
- 公开模板承担了太多底层 contract 展示职责
- 模板实现、模板元数据、模板文档、发布验证之间存在重复和漂移风险

---

## 3. 当前实现快照

### 3.1 CLI 入口层

当前 CLI 入口集中在：

- `packages/chat-cli/src/index.ts`

它已经负责：

- 解析命令行参数
- 支持 `--template`、`--provider`、`--yes`、`--install`、`--no-install`、`--overwrite`、`--cwd`
- 通过 registry 提供模板选择
- 调用 scaffold helper 生成项目
- 可选自动安装依赖

这是目前 `chat-cli` 已经较成熟的一层。

### 3.2 模板注册表层

当前 registry 在：

- `packages/chat-cli/src/templateRegistry.ts`

它已经表达：

- 稳定模板 id
- 模板目录
- 支持的 provider
- `requiredChatFeatures`
- `contractUsage`
- `postScaffoldSteps`

也就是说，`chat-cli` 已经在尝试把模板从“目录集合”提升为“有元数据的模板集合”。

### 3.3 模板实现层

当前稳定模板：

- `packages/chat-cli/templates/basic`
- `packages/chat-cli/templates/agent-mcp`

当前这两个模板的共同点是：

- 都基于 Vue 3 + TypeScript + Vite
- 都默认走 server proxy 路径
- 都消费 `@opentiny/tiny-robot-chat`
- 都是白盒路径
- 都不是纯黑盒 starter

### 3.4 上游 `chat` 消费 contract

`packages/chat` 目前已经暴露了专门面向 CLI 消费的能力面，主要在：

- `packages/chat/src/adapters/chatCli.ts`
- `packages/chat/src/capabilities.ts`

也就是说，`chat` 已经具备：

- feature key 集合
- preset prop key 集合
- preset slice key 集合
- manifest 形式的 capability 描述

理论上，CLI 不需要再长期维护第二份“同义 contract 常量”。

---

## 4. 主要问题清单

下面这些问题都已经实际存在于当前代码中，且会直接影响：

- 模板收口
- 后续维护成本
- 对外发布可信度

### 4.1 模板目录重复度过高

当前 `basic` 与 `agent-mcp` 的重复度明显偏高。

已核对结果：

- 两个模板共有 16 个同名文件
- 其中 9 个文件内容完全相同
- 差异主要集中在：
  - `src/App.vue`
  - `src/lib/chat.ts`
  - `src/chat.config.ts`
  - `README.md`
  - 以及 `agent-mcp` 独有的 `src/lib/mcp.ts`

这说明：

- `agent-mcp` 本质上不是一个完全独立的模板体系
- 它更像是 `basic + MCP overlay`

当前完全相同的部分包括：

- `index.html`
- `package.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `_gitignore`
- `assets/brand.svg`
- `server/chat-proxy.example.ts`
- `src/main.ts`
- `src/styles/index.css`

这类重复会带来几个问题：

- 模板越多，重复文件越多
- 相同文件的小修小改必须手工同步两份
- README 与实现容易出现“一个模板已改，另一个模板还停在旧结构”的漂移
- 后续如果再增加第三个模板，重复会继续线性扩大

结论：

- 当前模板体系已经具备明显的 `base + overlay` 特征
- 但代码实现上仍然停留在“两个独立目录复制”

### 4.2 公开模板承担了底层 contract 展示职责

当前 `basic` 模板不是“最小 starter”，而是偏向“底层 contract 样例”。

原因是它公开暴露了这一整条链路：

- `chat.config.ts`
- `createChatAdapterFromConfig()`
- `createChatCliCapabilitySurface()`
- `chatCapabilitySurface.presetSlices`
- `TrChat.Root / Layout / Header / MessageList / Sender / History`

这条链路本身没有错，但它更适合：

- 内部 demo
- contract fixture
- 高阶使用者

而不是普通 starter。

直接结果是：

- `basic` 的起步复杂度偏高
- 新用户会更早暴露在 `Root / Layout / Header / slices` 这些概念上
- 模板本身在承担“教用户理解底层实现”的额外职责

这会让 `basic` 偏离它最应该承担的角色：

- 通用 agent 的最小起步模板

### 4.3 `chat` 与 `chat-cli` 各自维护了一套 contract 常量

当前 `packages/chat` 已经在这些文件里定义了 CLI 消费 contract：

- `packages/chat/src/adapters/chatCli.ts`
- `packages/chat/src/capabilities.ts`

但 `packages/chat-cli` 又在：

- `packages/chat-cli/src/templateRegistry.ts`

里维护了一份自己的 key 集合，包括：

- `CHAT_CLI_REQUIRED_FEATURE_KEYS`
- `CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS`
- `CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS`

短期看，这能工作。

长期看，它会产生三个问题：

1. contract 漂移风险
   - `chat` 新增或删除能力 key 后，CLI 需要手工同步

2. 验证标准重复
   - `chat` 的 manifest 与 `chat-cli` 的 registry 各自有一套“合法 key 列表”

3. ownership 不清
   - 表面上说“chat 是能力源头”，但 CLI 又实际上持有第二份能力面定义

这类重复定义在项目早期常见，但后续必须收口。

### 4.4 几块抽象目前没有产生实际收益

当前 `packages/chat-cli/src/templateRegistry.ts` 中定义了一些抽象：

- `planned`
- `blackbox-props`
- `postScaffoldSteps`

但在当前代码里，这几块并没有真正形成收益闭环。

#### `planned`

当前模板列表里没有使用到更复杂的 planned 生命周期控制逻辑。

它目前更像是“预留抽象”，而不是已经有消费方的字段。

#### `blackbox-props`

当前稳定模板实际都不是这个模式。

它没有形成：

- 对应模板
- 对应校验逻辑
- 对应 README / CLI 引导

所以它当前更像未兑现抽象，而不是成熟模式。

#### `postScaffoldSteps`

虽然 registry 里有这个字段，但 CLI 的实际 next steps 仍写死在：

- `packages/chat-cli/src/index.ts`

这意味着：

- registry 声明的步骤和 CLI 真正输出的步骤可能不一致
- 字段存在，但没有真正驱动行为

这类抽象如果继续累积，会让代码出现“字段很多，但只有一部分真的生效”的现象。

### 4.5 文档重复维护成本偏高

当前与 `chat-cli` 相关的文档至少有三层：

- `packages/chat-cli/README.md`
- `docs/src/components/chat-cli.md`
- 每个模板目录内自己的 `README.md`

而且它们当前都在重复解释同一组概念：

- white-box slices
- server proxy
- provider 选择
- 生成后先改哪些文件

这会导致：

- 一次概念调整要改三到四处
- 文档之间容易出现“用词不同但表达同一件事”
- 模板 README 很容易滞后于主文档

更关键的是，当前 `basic` 模板本身未来大概率要从白盒 slices 转成黑盒 starter。

如果文档层不先分工，后续会出现：

- `chat-cli` README 说黑盒
- docs 页面还在强调 slices
- 模板 README 继续沿用旧术语

因此文档问题并不是“可有可无的文案问题”，而是后续改造中的同步成本问题。

### 4.6 依赖声明没有完全收口

当前模板的 `package.json` 与上游包的 peer contract 之间，仍然存在闭包风险。

上游要求大致如下：

- `@opentiny/tiny-robot-chat` 的 peer 里要求 `markstream-vue`
- `@opentiny/tiny-robot` 的 peer 里要求 `dompurify` 和 `markdown-it`

但当前模板：

- `packages/chat-cli/templates/basic/package.json`
- `packages/chat-cli/templates/agent-mcp/package.json`

没有显式补齐这些依赖。

同时，它们却显式声明了：

- `@opentiny/tiny-robot-svgs`

而模板源码并没有直接 import 它。

这带来两个问题：

1. 真正需要的 peer 没收口
2. 可能不需要的依赖却在模板里显式声明

短期在 monorepo 内部不一定暴露。

但一旦走真实外部安装，就会直接影响：

- 安装是否顺利
- 构建是否成功
- 模板是否真的能脱离 monorepo 独立运行

### 4.7 当前 smoke 路径会掩盖 clean install 问题

当前 smoke 测试在：

- `packages/test/src/chat-cli/smoke.spec.ts`

它会把仓库根目录的 `node_modules` 通过 symlink 链接给生成项目使用。

这对于本地快速验证是有价值的。

但它不能证明：

- 生成项目在 workspace 外也能正确安装
- 模板依赖闭包真的完整
- 缺失的 peer 依赖会被及时暴露

这意味着当前 smoke 测试更像：

- “本仓库工具链兼容性验证”

而不是：

- “对外发布后的 clean install 验证”

如果未来把这层区别不写清楚，就容易出现一个错误判断：

- “smoke 过了，所以可以放心发布”

这在 starter CLI 上风险很高。

### 4.8 当前 template validation 过于绑定 `whitebox-slices`

当前 `scripts/template-release-utils.mjs` 中的校验逻辑重点是：

- 是否引用 `chatCapabilitySurface`
- 是否引用 `TrChat.Root`
- 是否引用 `slices.<key>`

这种校验只对当前白盒 slices 路径成立。

问题在于：

- 一旦 `basic` 改成黑盒 `TrChat`
- 或 `agent-mcp` 改成 `TrChat.Scaffold`

当前校验体系就会不再适用。

这说明当前模板治理逻辑实际上绑定的是：

- “当前模板实现方式”

而不是：

- “模板宣称自己采用的消费模式”

因此模板治理层也需要跟着从“实现细节校验”升级到“mode-aware 校验”。

---

## 5. 结构性判断

### 5.1 当前最需要解决的不是“模板不够多”

当前 `chat-cli` 最大的问题不是模板数量不够。

恰恰相反，当前最应该做的是：

- 先把已有两个模板角色收口清楚
- 再考虑是否扩展更多模板

如果现在继续增加模板，会把这些问题一起放大：

- 重复目录
- 重复文档
- contract 双份定义
- 校验逻辑绑定实现细节
- 发布验证仍不覆盖 clean install

### 5.2 当前最合理的模板角色划分已经比较明确

结合现有 `chat` 公开入口和讨论结果，后续最合理的角色划分应该是：

- `basic`
  - 面向通用 agent
  - 黑盒 `TrChat`
  - 最小起步模板

- `agent-mcp`
  - 面向带 MCP 的工具型 agent
  - 白盒 `TrChat.Scaffold`
  - 保留结构定制能力

- 更底层 `whitebox-slices`
  - 保留在 demo / test / internal fixture
  - 不继续作为默认公开模板

这个划分和当前 `chat` 包的接入层级是一致的：

- `TrChat`
- `TrChat.Scaffold`
- 更底层 adapter / preset / slices

### 5.3 模板系统已经具备向 `base + overlay` 演进的条件

当前 `basic` 与 `agent-mcp` 的差异已经说明：

- `agent-mcp` 本质上是 `basic + MCP overlay`

所以后续真正合理的模板体系，不应再继续是两个完全独立目录。

更合理的实现方向应当逐步走向：

- `base`
- `basic overlay`
- `agent-mcp overlay`

但这是实现层的收口方式。

在对外心智模型上，依旧可以保持只有两个模板 id。

---

## 6. 推荐改造方向

### 6.1 第一优先级：先收口模板角色

建议优先做这两件事：

1. 把 `basic` 改为黑盒 `TrChat`
2. 把 `agent-mcp` 改为 `TrChat.Scaffold`

这是最关键的收口动作，因为它直接决定：

- 模板角色是否清晰
- 文档是否容易讲
- registry mode 是否容易表达

### 6.2 第二优先级：去掉或兑现无收益抽象

建议处理：

- `planned`
- `blackbox-props`
- `postScaffoldSteps`

原则很简单：

- 已有消费方的，继续保留并打通
- 暂无消费方的，要么删掉，要么延后

不要继续累积“名义上存在、实际上没驱动任何行为”的字段。

### 6.3 第三优先级：让 contract 重新单源化

后续需要逐步收口成：

- `packages/chat` 是能力 contract 的单一来源
- `chat-cli` 消费它，而不是复制它

不一定要一步到位，但必须明确这是后续方向。

### 6.4 第四优先级：把发布验证从 monorepo smoke 扩展到 clean install

必须补上一条真正外部可验证的链路：

- 干净目录
- 真正从 registry 创建
- 真正安装依赖
- 真正执行 build

不然 `chat-cli` 永远只能算“本仓库内可验证”，而不是“对外可发布”。

---

## 7. 推荐执行顺序

建议按这个顺序执行：

1. `basic` 改黑盒
2. `agent-mcp` 改 `Scaffold`
3. registry mode 与 template validation 改为新模式
4. 模板 README 与 docs 分工重新收口
5. 增加 clean install 发布门禁
6. 再考虑是否做 `base + overlay`
7. 最后再考虑更多模板扩展

这个顺序的核心思路是：

- 先让公开产品层说得清
- 再让实现层去重
- 最后再做模板体系扩展

---

## 8. 一句话结论

当前 `chat-cli` 的问题不是“能力不够”，而是“公开模板、底层 contract、文档解释、发布验证”还没有完全分层。

后续最重要的动作不是再加模板，而是：

> 把 `basic` 收口为真正的黑盒 starter，把 `agent-mcp` 收口为真正的 `Scaffold` 白盒 starter，把更底层的 `whitebox-slices` 还给 demo / test / internal fixture。

