# TinyRobot Chat CLI 检视报告

> 面向 `packages/chat-cli` 的当前实现评估  
> 背景：`packages/chat` 的目标不是只提供一个组件包，而是为 `chat-cli` 提供稳定的会话应用基座。  
> 本文重点回答三个问题：
>
> 1. 当前 `chat-cli` 做到了什么
> 2. 它和 `packages/chat` 的目标相比还差什么
> 3. 下一步应该如何优化，才能真正成为"可发布、可维护、可扩展"的脚手架
>
> 模板体系的专项调研与实施方案见：`packages/chat-cli/review/template-strategy.md`

| 检视属性 | 内容 |
|:--|:--|
| 检视范围 | `packages/chat-cli` 全部源码 + `templates/basic` 模板 + `scripts/` |
| 对标基座 | `packages/chat` 已落地的 adapter/provider/preset 契约 |
| 检视时间 | 2026-03-15 |
| 检视方法 | 逐文件代码审读 + 业界脚手架对标 + `packages/chat` 契约一致性校验 |

---

## 0、当前落地状态补充

以下内容基于 2026-03-16 的当前仓库状态补充，用于区分“历史问题”与“已经完成的收口项”。

当前已经完成：

- 默认模板已切到更安全的 server proxy 路径
- 模板结构已收敛为 `App.vue + chat.config.ts + lib/chat.ts`
- CLI 已支持非交互 flags、项目名注入、目录覆盖保护
- `packages/test/src/chat-cli` 已建立 scaffold / release / smoke 三层测试基线
- 用户文档 [chat-cli.md](/d:/OpenTinyRepository/tiny-robot/docs/src/components/chat-cli.md) 已补齐，并已挂入 VitePress 侧边栏

因此，本文后续章节中提到的部分问题，已经从“待解决问题”转变为“本轮已完成项的设计依据”。阅读时建议把它理解为：

- 前半部分：为什么当时需要改
- 后半部分：这些问题如何被收敛成可执行方案

仍然保留为后续增强项的内容主要有：

- 真正的模板 `install` 冒烟测试
- 更完整的交互流程测试
- `add` / `migrate` / 多模板能力

---

## 一、结论摘要

当前的 `packages/chat-cli` 更像是一个 **基础模板复制器**，而不是一个真正成熟的 **AI Chat 脚手架**。

它已经具备：

- 交互式创建项目
- 复制基础 Vue + TinyRobot Chat 模板
- 选择 Provider 并生成基础 `.env.example`
- 可选自动安装依赖

但距离“基于 `packages/chat` 快速生成可用 agent 应用”的目标，仍有明显差距。

### 总体判断

| 维度 | 评价 | 说明 |
|:--|:--|:--|
| 基础可用性 | 中 | 能创建项目，但更偏 demo 级起步模板 |
| 与 `packages/chat` 契约一致性 | 中偏低 | 仍然以内联 `App.vue` 组装为主，没有真正消费 `manifest/config -> adapter -> preset` 的长期契约 |
| 生产安全模型 | 低 | 默认仍然生成浏览器直连 API Key 的方案 |
| 自动化与 CI 友好性 | 低 | 缺少非交互 flags、dry-run、overwrite/cwd 等能力 |
| 模板扩展能力 | 低 | 只有一个基础模板，且没有模板元数据与生成策略层 |
| 发布稳健性 | 中偏低 | 模板版本替换依赖外部脚本，当前包内没有形成强约束 |
| 可测试性 | 低 | 几乎没有 CLI 自身测试与模板生成验证 |
| 生成流程一致性 | 中偏低 | 交互项对输出结果影响过浅，CLI 提示与模板 README 存在割裂 |
| 跨平台兼容性 | 低 | 输出指令依赖 Unix shell、未处理 Windows 路径边界 |

一句话概括：

> **现在的 `chat-cli` 已经能“把一个聊天页面跑起来”，但还不能稳定承担“模板产品化入口”的职责。**

> **状态更新**：上述判断对应的是本轮改造前的起点评估。结合当前实现，`chat-cli` 已经从“基础模板复制器”明显前进到了“可发布、可测试、可文档化的基础脚手架”，但距离平台级生成器仍有差距。

> **[检视意见]** 整体判断与实际代码审读一致。补充两点关键发现：
>
> 1. `chat` 包已具备 `createServerProxyFactory` + `createChatAdapterFromConfig` + `createPresetChatProps` 的完整三层契约，但 `chat-cli` 模板中的 `App.vue` 仍手动构造 `Authorization: Bearer ${apiKey}` 的 `headers` 传给 `createChatAdapterFromConfig`。这等于 **绕过了 `chat` 包为生产安全设计的 `serverProxy` 路径**，在契约层面形成了"背道而驰"。参考 [adapters/config.ts:161-167](file:///d:/OpenTinyRepository/tiny-robot/packages/chat/src/adapters/config.ts#L161-L167)，`createChatAdapterFromConfig` 内部已统一使用 `createServerProxyFactory`，即已默认走代理路径——但模板注入的 `Authorization` header 把它又变回了浏览器直连。
> 2. CLI 工具函数层面（`emptyDir`、`copyTemplateFiles`、`renameSpecialFiles`）存在使用已弃用 Node.js API（`rmdirSync`）和错误静默降级（warn 而非 fail）的问题，这些在发布产品中会成为真实的工程隐患。

---

## 二、当前实现概览

### 2.1 CLI 入口

当前主流程集中在：

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)

它负责：

- 解析 `-h / -v`
- 通过 prompts 收集项目名、模板、provider、是否安装依赖
- 复制 `templates/basic`
- 重命名 `_gitignore` / `_env.example`
- 根据 provider 更新 `.env.example`
- 执行安装命令

### 2.2 当前模板

当前只有一个模板：

- [templates/basic](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic)

模板核心接入文件：

- [App.vue](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/src/App.vue)

它当前的做法是：

- 从 `VITE_API_KEY`、`VITE_API_PROVIDER`、`VITE_MODEL`、`VITE_BASE_URL` 读取配置
- 在前端直接构造 `createChatAdapterFromConfig(...)`
- 通过 `Authorization: Bearer ${apiKey}` 直接从浏览器请求模型接口

这说明：

- 它已经开始使用 `packages/chat` 的 `adapter + preset` 能力
- 但还没有真正形成“脚手架配置契约”的完整链路

---

## 三、与业界最佳实践对比

### 3.1 现代脚手架的常见特征

参考：

- `create-vue` 官方 README：支持交互模式，也支持通过 flags 跳过 prompts，便于自动化与 CI  
  来源：https://github.com/vuejs/create-vue
- `shadcn` CLI：除了 `init` 之外，还有 `add`、`--yes`、`--overwrite`、`--cwd`、`--dry-run`、`--view` 等能力  
  来源：https://ui.shadcn.com/docs/cli
- Vercel AI SDK / Vercel Academy：明确强调聊天系统应分为 backend + frontend，服务端负责持有 secret 与 provider 调用  
  来源：https://vercel.com/academy/ai-sdk/basic-chatbot

行业里一个成熟 CLI 通常有这些特征：

1. **可交互，也可非交互**
   - 交互适合新手
   - flags 适合自动化、文档、CI、批量生成

2. **模板不是静态复制，而是配置驱动**
   - 模板有元数据
   - 生成逻辑知道该替换哪些变量、该生成哪些文件

3. **默认路径符合生产安全模型**
   - secret 在服务端
   - 前端只请求代理接口

4. **模板具有升级和扩展能力**
   - 不只是 `init`
   - 还能 `add feature`、`sync config`、`migrate`

5. **脚手架本身有测试护栏**
   - 至少要验证生成目录、文件替换、依赖版本、构建是否成功

对照这些标准，`chat-cli` 当前最大的问题不是“不能用”，而是：

> **它生成的是一个能跑的前端模板，但还不是一个面向真实项目生命周期的脚手架系统。**

> **[检视意见]** 补充两项业界上述列表遗漏的共识：
>
> 6. **生成项目具有项目身份** — `package.json.name`、README 标题、HTML `<title>`、welcome 文案应注入用户输入的项目名。`create-vue` / `create-next-app` 均已做到。当前 `chat-cli` 生成的项目名始终是 `tiny-robot-chat-app`。
> 7. **错误路径的防御性设计** — 文件系统操作使用原子或事务式策略（全部成功才保留，失败则清理半成品目录）。`chat-cli` 当前对 `copyFileSync` / `renameSync` 失败采用 `warn + 继续`，可能留下不完整的项目目录。

### 3.2 与同类 AI Chat CLI 的横向功能对比

> **[检视意见]** 补充与同类 AI Chat 脚手架的横向功能对比。

| 能力 | `create-tiny-robot` | Vercel AI SDK (`ai` CLI) | LobeChat (clone) | `create-t3-app` |
|:--|:--|:--|:--|:--|
| 交互式创建 | ✅ | ✅ | N/A | ✅ |
| 非交互 flags | ❌ | ✅ `--example` | N/A | ✅ `--CI` |
| 默认安全模型 | ❌ 浏览器直连 | ✅ Server Route | ✅ 服务端持有 Key | ✅ Server Side |
| 配置文件化 | ❌ 内联代码 | ✅ `.env` + route | ✅ 多层 config | ✅ env schema |
| 多 provider 支持 | 有限 | ✅ 工厂式 | ✅ 全平台 | N/A |
| `add` 增量命令 | ❌ | ❌ | N/A | ❌ |
| 项目名注入 | ❌ | ✅ | N/A | ✅ |
| 生成项目可直接部署 | ⚠️ 仅 dev 可跑 | ✅ | ✅ | ✅ |
| CLI 自身测试 | ❌ | ✅ | N/A | ✅ |
| 版本管理 | 外部脚本 | npm publish 集成 | Docker tag | 正式 release 流程 |

**关键差距**：在非交互模式、安全模型、配置文件化三个维度上与业界标杆差距最大，而这三点恰好是「从 demo 级工具到产品化脚手架」的核心门槛。

补充参考：
- `create-next-app`：`--example`、`--ts`、`--use-npm/pnpm/yarn/bun` 等精细化 flags（https://nextjs.org/docs/api-reference/cli/create-next-app）
- `create-t3-app`：`--CI` 非交互模式 + 完整 server/client 分层（https://create.t3.gg）

---

## 四、当前主要问题

以下按优先级拆分。

### P0-1 默认生成浏览器直连 API Key 的项目，安全模型和 `chat` 包目标冲突

**位置**

- [templates/basic/src/App.vue](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/src/App.vue)
- [templates/basic/_env.example](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/_env.example)
- [templates/basic/README.md](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/README.md)

**问题**

模板默认生成的是：

- `VITE_API_KEY`
- 浏览器端 `Authorization: Bearer ...`
- 直接请求 `https://api.openai.com/v1` 或 `https://api.deepseek.com/v1`

这和 `packages/chat` 目前已经明确下来的方向不一致：

- `chat` 包已经提供 `createServerProxyProvider`
- review 文档也已经把“默认走 BFF / server proxy”作为建议主路径

但 `chat-cli` 仍然把“浏览器直连 provider”作为默认输出，这会直接导致：

1. 用户把脚手架生成项目误当成生产方案
2. API Key 暴露风险被扩大
3. `chat` 包的安全边界虽然文档上说明了，但 CLI 没有贯彻

**建议**

- CLI 默认生成 **server proxy 模式**
- 浏览器直连仅作为 `--mode demo` 或 `--unsafe-browser-provider` 的显式选项
- 默认模板至少生成：
  - `src/chat.config.ts` 或 `chat.config.json`
  - `src/lib/chat.ts`
  - `server/` / `api/` 示例代理文件

这项我建议定为 **chat-cli 的 P0**。

---

### P0-2 没有真正落地 `manifest/config -> adapter -> preset` 的契约

**位置**

- [templates/basic/src/App.vue](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/src/App.vue)

**问题**

虽然模板已经在用：

- `createChatAdapterFromConfig`
- `createPresetChatProps`

但配置仍然写死在 `App.vue` 里：

- `welcome`
- `prompts`
- `models`
- `providers`
- `defaults`

这意味着：

- 模板生成之后，用户要改配置仍然要改 Vue 代码
- CLI 无法围绕一个稳定配置文件继续演进
- 后续想支持多模板、多模型、多 provider、多场景复用，会很快失控

**建议**

把当前模板收敛成：

```txt
src/
  App.vue
  chat.config.ts
  lib/
    chat.ts
```

推荐职责：

- `chat.config.ts`
  - 只放声明式配置
- `lib/chat.ts`
  - 负责 `createChatAdapterFromConfig()` 和 `createPresetChatProps()`
- `App.vue`
  - 只消费 `chatPreset`

也可以进一步走文件化配置：

```txt
chat.config.json
```

然后由 CLI 和 runtime 共用 schema。

**目标**

让 `chat-cli` 生成的项目真正建立在 `packages/chat` 的长期公共契约上，而不是“在模板里手写一段 adapter 组装代码”。

---

### P0-3 `custom` provider 选项的语义不成立

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)
- [templates/basic/src/App.vue](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/src/App.vue)

**问题**

CLI 提供了：

- `openai`
- `deepseek`
- `custom`，提示是 `Bring your own responseProvider`

但实际模板逻辑并没有生成“自定义 responseProvider”的工程结构。  
它仍然假设：

- `type: 'openai-compatible'`
- `Authorization: Bearer ${apiKey}`
- `baseURL` 默认回退到 OpenAI 风格地址

也就是说这个 `custom` 其实不是 “bring your own responseProvider”，而是：

> “用一套 openai-compatible 直连方案去伪装成 custom”

这会误导用户。

**建议**

二选一：

1. **短期修正文案**
   - 把 `custom` 改成 `OpenAI Compatible`
2. **长期补齐真正 custom**
   - 生成 `responseProvider.ts`
   - `App.vue` 使用 `useChatKit({ responseProvider })` 或黑盒 `TrChat :response-provider`

目前更建议先做方案 1，避免错误心智。

---

### P1-1 CLI 过度依赖交互，几乎不可自动化

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)

**问题**

当前 CLI 基本只有：

- `-h`
- `-v`

这意味着：

- 文档里没法优雅给出一条可复制命令直接生成目标项目
- CI / 自动化环境中很难使用
- 后续也不利于 IDE / GUI 封装

对比 `create-vue` 和 `shadcn`，当前缺少至少这些能力：

- `--template`
- `--provider`
- `--yes`
- `--install / --no-install`
- `--cwd`
- `--overwrite`
- `--defaults`
- `--dry-run`

**建议**

Phase 1 就补齐下面这一批：

```bash
create-tiny-robot my-app \
  --template basic \
  --provider openai \
  --yes \
  --install \
  --cwd ./playground
```

这会极大提升脚手架的工程化程度。

---

### P1-2 模板选择体验不完整，当前更像“占位菜单”

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)

**问题**

当前模板列表里有：

- `basic`
- `with-context`
- `with-mcp`
- `with-rag`

但后三个都只是 `coming soon`，用户选了还会被取消退出。

这在探索阶段可以接受，但对于正式 CLI，会显得：

- 交互流程被打断
- 可用能力边界不清晰
- “模板系统”看起来已经存在，实际上并没有

**建议**

短期：

- 只显示可用模板

中期：

- 为模板加 `manifest`
- 由 CLI 读取模板元数据后自动展示 label / description / status

例如：

```json
{
  "name": "basic",
  "status": "stable",
  "features": ["history", "storage", "adapter"]
}
```

这样模板系统才可扩展。

---

### P1-3 生成项目仍然保留 monorepo 心智，发布链路不够稳

**位置**

- [templates/basic/package.json](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/package.json)
- [scripts/update-versions.mjs](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/scripts/update-versions.mjs)
- [package.json](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/package.json)

**问题**

模板里的依赖当前仍然是：

- `workspace:*`

虽然已经有 [update-versions.mjs](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/scripts/update-versions.mjs) 用于发布前替换版本，但问题在于：

1. 这个约束没有体现在 `package.json` 的正式发布脚本里
2. 它看起来依赖“外部 release 流程记得执行”
3. 一旦漏掉，用户生成项目后依赖会直接失效

这不是模板代码问题，而是 **发布稳健性问题**。

**建议**

- 把版本替换纳入正式发布链路
- 至少保证：

```json
"prepublishOnly": "pnpm run prepare:templates && pnpm run build"
```

更稳的做法是：

- 发布前自动校验模板里不存在 `workspace:*`
- CI fail fast

---

### P1-4 生成项目不是“项目名感知”的

**位置**

- [templates/basic/package.json](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/package.json)

**问题**

模板 package 名固定为：

- `tiny-robot-chat-app`

这意味着用户生成 `my-agent-app` 后，目录名变了，但包名没变。  
这会让模板更像“复制一个示例项目”，而不是“真正初始化一个新项目”。

**建议**

生成时替换：

- `package.json.name`
- README 标题
- 可选的品牌标题 / welcome title

至少把项目名注入到模板变量里。

---

### P1-5 缺少跨平台友好的后续指引

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)

**问题**

CLI 当前输出：

```bash
cp .env.example .env.local
```

这对 Windows 用户不友好。  
脚手架既然已经知道当前包管理器，理论上也应该更谨慎处理 shell 指令的跨平台体验。

**建议**

改成不依赖单一 shell 的写法，例如：

- 文案写成“复制 `.env.example` 为 `.env.local`”
- 或根据平台输出不同命令

这是小问题，但对新手非常真实。

---

### P1-6 没有 CLI 自身测试，无法证明“生成结果可用”

**位置**

- `packages/chat-cli` 当前无测试目录

**问题**

现在 `chat-cli` 基本没有覆盖这些最关键的场景：

- 生成空目录
- 覆盖已有目录
- 模板复制后特殊文件重命名
- `provider` 对 `.env.example` 的替换
- 版本替换结果
- 生成项目能否 `install + build`

这会导致一个典型问题：

> `packages/chat` 已经越来越稳定，但 `chat-cli` 作为交付入口却没有同等护栏。

**建议**

至少补三层测试：

1. **单元测试**
   - `inferPackageManager`
   - `getCommand`
   - `getTemplateVariables`
   - `renameSpecialFiles`
   - `copyTemplateFiles`

2. **集成测试**
   - 在临时目录运行 CLI
   - 校验生成文件树

3. **冒烟测试**
   - 对生成结果执行 `install + build`

如果当前不想引入很重的测试框架，最少也应该有 Node 层集成测试。

---

### P1-7 Provider 选择对生成结果的影响过浅，当前交互价值不足

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)
- [templates/basic/src/App.vue](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/src/App.vue)
- [templates/basic/_env.example](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/_env.example)

**问题**

当前 CLI 虽然有 Provider 选择步骤，但它对生成结果的实际影响非常有限：

- 只是在 `.env.example` 中替换 `VITE_API_PROVIDER`
- 模板代码本身没有因为 Provider 变化生成不同文件结构
- `custom` 甚至只是错误语义的占位项

这意味着当前这一步交互更像是：

> “收集一个初始环境变量默认值”

而不是：

> “根据用户选择生成不同接入方案”

一个成熟脚手架里的选择项，应该能显著影响输出结果，例如：

- 生成 server proxy 还是浏览器直连
- 生成单模型还是多模型配置
- 是否生成 provider 适配文件
- 是否需要额外的 env 字段

当前 Provider prompt 对工程结构影响太弱，会让用户误以为自己在做“架构选择”，实际上只是改了一行 env 默认值。

**建议**

短期：

- 如果仍只有一个模板与一种接入模式，可以先把 provider prompt 降级为更明确的“默认 provider”

中期：

- 让 provider 选择真正影响生成结果：
  - `openai` / `deepseek` 生成不同默认 model
  - `openai-compatible` 生成自定义 `baseURL` 配置
  - `server-proxy` 生成代理示例
  - `browser-direct` 明确标注为 demo-only

这样交互才有真实价值。

---

### P1-8 生成项目文档与 CLI 运行时上下文不一致，容易误导新手

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)
- [templates/basic/README.md](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/templates/basic/README.md)

**问题**

CLI 运行时已经会推断包管理器：

- `npm`
- `pnpm`
- `yarn`
- `bun`

但生成后的模板 README 仍然固定写：

```bash
npm install
npm run dev
```

同时 CLI 完成提示中还输出：

```bash
cp .env.example .env.local
```

这带来两个问题：

1. **新手体验割裂**
   - CLI 识别了当前使用的包管理器
   - 但落地文档却退回到硬编码的 `npm`

2. **跨平台体验不稳定**
   - `cp` 对 Windows 用户不友好
   - README 和 CLI 提示之间也不一致

**建议**

- 生成 README 时注入当前包管理器对应命令
- CLI 完成提示避免硬编码 Unix 风格命令
- README 里把“复制 `.env.example` 为 `.env.local`”写成平台无关说明，必要时分别给 Windows / Unix 示例

对于新手来说，这类细节比架构术语更直接影响“我能不能把项目顺利跑起来”。

---

### P2-1 模板复制策略过于静态，不利于扩展

**位置**

- [src/index.ts](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/src/index.ts)

**问题**

当前模板复制方式本质上是：

- 递归 copy 文件
- rename 特殊文件
- 正则替换 `.env.example`

这适合非常小的模板，但一旦进入：

- 多模板
- 多变体
- 按 provider 生成不同文件
- 选择性生成 server proxy / MCP / RAG / docs variant

就会迅速失去控制。

**建议**

引入简单的模板元数据和变量替换层，例如：

```txt
templates/
  basic/
    template.json
    files/
```

其中 `template.json` 描述：

- 模板名
- 需要的变量
- 可选 feature
- 后处理步骤

这样 CLI 才能从“复制目录”升级到“按配置生成项目”。

---

### P2-2 缺少 `add` / `upgrade` 能力，chat-cli 目前只覆盖 init 阶段

**问题**

当前 `chat-cli` 只做 `create`，但对一个真正的 chat 基座来说，后续还会有很多增量场景：

- 给现有项目加 MCP
- 给现有项目加 docs variant
- 给现有项目加 server proxy
- 升级旧模板到新契约

行业里，成熟 CLI 往往不是只做初始化，还会做增量生成。`shadcn` 的 `init + add` 模式就是典型例子。  
来源：https://ui.shadcn.com/docs/cli

**建议**

后续演进成：

- `create-tiny-robot`：初始化项目
- `tiny-robot add mcp`
- `tiny-robot add proxy`
- `tiny-robot add docs-variant`
- `tiny-robot migrate`

这会让 `chat` 包和 `chat-cli` 的关系更像“平台 + 生成器”，而不是“一次性模板”。

---

## 五、chat-cli 与 chat 包之间最核心的结构性问题

这个问题最值得单独强调：

> **`packages/chat` 已经在往“稳定契约层”演进，但 `chat-cli` 还停留在“复制一个能跑的前端模板”。**

当前两者的落差主要体现在：

### 5.1 `chat` 已经有 adapter 契约，但 CLI 还没有真正围绕配置文件设计

`chat` 包现在已经具备：

- `loadChatConfig`
- `createChatAdapterFromConfig`
- `createPresetChatProps`

但 `chat-cli` 还没有把这些能力变成：

- 可编辑配置文件
- 可升级模板结构
- 可复用生成策略

### 5.2 `chat` 已经明确安全边界，但 CLI 仍默认生成不安全路径

`chat` 的设计和 review 已经明确：

- 生产应优先 server proxy / BFF

但 CLI 还在默认输出：

- 浏览器直连
- `VITE_API_KEY`

这是当前最明显的战略不一致。

### 5.3 `chat` 已经支持黑盒 / 白盒 / docs variant / retry / optimistic / MCP

但 CLI 模板还没形成“能力档位”：

- `basic`
- `agent`
- `with-mcp`
- `docs-chat`
- `knowledge-base`

也就是说，`chat` 包的能力已经长出来了，但 CLI 还没有把它们组织成产品化模板。

---

## 六、建议的优化方向

### Phase 1：把它变成“可靠脚手架”

目标：先让 `chat-cli` 成为一个**可以放心发布和维护**的脚手架。

建议落地：

1. 默认生成 server proxy 模板
2. 补齐 CLI flags：
   - `--template`
   - `--provider`
   - `--yes`
   - `--cwd`
   - `--install`
   - `--overwrite`
3. 生成项目名感知的 `package.json`
4. 把版本替换纳入正式发布链路
5. 为 CLI 增加最小测试基线

### Phase 2：把它变成“配置驱动生成器”

目标：真正建立 `chat-cli` 和 `packages/chat` 的长期契约。

建议落地：

1. 生成 `chat.config.ts` / `chat.config.json`
2. `App.vue` 只消费 `chatPreset`
3. 把 welcome / prompts / models / providers 从模板代码移出
4. 为模板增加 metadata
5. 建立 schema version

### Phase 3：把它变成“平台级生成工具”

目标：支持后续增量生成与迁移。

建议落地：

1. `add` 子命令
2. `migrate` 子命令
3. 模板 feature 组合
4. 生成服务端代理、MCP、RAG、docs variant 等能力包

---

## 七、建议的目标结构

一个更理想的基础模板，建议接近这样：

```txt
my-chat-app/
├── src/
│   ├── App.vue
│   ├── chat.config.ts
│   └── lib/
│       └── chat.ts
├── server/
│   └── chat-proxy.ts
├── .env.example
├── package.json
└── README.md
```

职责建议：

- `chat.config.ts`
  - 模型、provider、文案、欢迎语、prompt 等声明式配置
- `lib/chat.ts`
  - `createChatAdapterFromConfig()` / `createPresetChatProps()`
- `App.vue`
  - 只做页面消费
- `server/chat-proxy.ts`
  - 演示服务端持有 secret 的推荐路径

---

## 八、最终判断

如果站在“现在就发布给用户”的角度，我对当前 `chat-cli` 的判断是：

- **可以用于内部验证**
- **不建议直接作为正式对外脚手架主入口**

最主要的原因有三点：

1. 默认安全模型不对
2. 配置契约还没有真正落地
3. 脚手架缺少自动化、测试和升级能力

但好消息是：

> `packages/chat` 这边的基础已经比之前稳很多了，`chat-cli` 现在最缺的不是底层能力，而是把这些能力产品化、模板化、发布化。

所以 `chat-cli` 下一阶段的重点，不应该是“继续堆一个新模板”，而应该是：

- 先把 **契约**
- **安全默认值**
- **CLI 工程能力**

这三件事补齐。

---

## 九、建议优先级

### P0：必须优先处理

- 默认改为 server proxy / BFF 模式
- 配置文件化，真正落地 `config -> adapter -> preset`
- 修正 `custom` provider 语义

### P1：应尽快补齐

- CLI flags 和非交互模式
- 模板版本发布护栏
- 项目名注入
- CLI 测试
- 让 provider 选择真正影响生成结果
- 修正 README / CLI 提示的包管理器与跨平台指引

### P2：中期增强

- 模板元数据
- `add` / `migrate`
- 多模板和 feature 组合

---

## 十、具体实现方案

> 本节用于把前面的检视意见收敛成可执行计划。  
> 原则：**先修默认安全路径和稳定契约，再补 CLI 工程能力，最后再做平台化增强。**

### 10.1 实施边界

本轮建议先只做 **Phase 1 + Phase 2A**，不要一口气把 `add / migrate / 多模板体系` 全部做完。

原因：

- `packages/chat` 现在已经具备可消费的 adapter 契约
- `chat-cli` 当前最需要的是“把默认生成结果变正确”
- 过早进入平台化，会把问题从“脚手架收口”变成“工具平台重写”

### 10.2 Phase 1：默认安全模型与模板收口

**目标**

让 `chat-cli` 生成的基础模板从“demo 级前端直连示例”升级成“默认安全、默认可维护”的基础项目。

**建议改动**

1. 调整模板结构

目标结构：

```txt
templates/basic/
  src/
    App.vue
    chat.config.ts
    lib/
      chat.ts
  server/
    chat-proxy.example.ts
  README.md
  _env.example
```

2. 收敛 `App.vue` 责任

- `App.vue` 不再内联 `welcome / prompts / providers / models`
- `App.vue` 只负责：
  - import `chatPreset`
  - 渲染 `<TrChat v-bind="chatPreset" />`

3. 新增 `chat.config.ts`

建议内容：

- 默认 model
- provider id
- brand / welcome / prompts
- 是否显示 history

4. 新增 `src/lib/chat.ts`

职责：

- 从 `chat.config.ts` 读取声明式配置
- 调用 `createChatAdapterFromConfig`
- 调用 `createPresetChatProps`

5. 默认生成 server proxy 路径

- 模板默认不再使用 `VITE_API_KEY`
- 改为：
  - `VITE_CHAT_API_ENDPOINT=/api/chat`
- `chat.config.ts` 默认 provider 指向代理 endpoint

6. 浏览器直连改为显式的危险模式

- 如果保留直连模式，必须通过明确选项触发：
  - `--mode demo`
  - 或 `--unsafe-browser-provider`

**涉及文件**

- `packages/chat-cli/src/index.ts`
- `packages/chat-cli/templates/basic/src/App.vue`
- `packages/chat-cli/templates/basic/_env.example`
- `packages/chat-cli/templates/basic/README.md`
- 新增：
  - `packages/chat-cli/templates/basic/src/chat.config.ts`
  - `packages/chat-cli/templates/basic/src/lib/chat.ts`
  - `packages/chat-cli/templates/basic/server/chat-proxy.example.ts`

**验收标准**

1. 新生成项目默认不包含 `VITE_API_KEY`
2. `App.vue` 中不再出现 `Authorization: Bearer`
3. `App.vue` 中不再直接内联 provider 配置
4. 用户只需改 `chat.config.ts` 就能调整欢迎语、prompt、默认模型
5. 生成 README 明确区分 development/demo 与 production 推荐路径

### 10.3 Phase 2A：CLI 工程能力补齐

**目标**

让 CLI 具备真正可自动化、可测试、可发布的工程基础。

**建议改动**

1. 增加核心 flags

建议最小集：

- `--template`
- `--provider`
- `--yes`
- `--install`
- `--no-install`
- `--overwrite`
- `--cwd`

2. 调整交互逻辑

- 已通过 flags 提供的值，不再重复 prompt
- `--yes` 时走默认值
- 无效组合尽早 fail，而不是进入半交互状态

3. 项目名注入

至少替换：

- `templates/basic/package.json` 的 `name`
- README 标题
- 可选默认 brand title

4. README 与 CLI 提示统一

- README 根据包管理器输出对应命令
- CLI 不再输出硬编码 `cp .env.example .env.local`
- 用平台无关描述或分平台提示替代

5. 发布护栏

- `prepublishOnly` 集成 `update-versions.mjs` 与校验脚本
- 加一条校验：模板中不得残留 `workspace:*`

**涉及文件**

- `packages/chat-cli/src/index.ts`
- `packages/chat-cli/src/packageManager.ts`
- `packages/chat-cli/package.json`
- `packages/chat-cli/scripts/update-versions.mjs`
- `packages/chat-cli/scripts/validate-templates.mjs`
- `packages/chat-cli/templates/basic/package.json`
- `packages/chat-cli/templates/basic/README.md`

**验收标准**

1. 可以通过一条命令无交互生成项目
2. 生成项目 package name 与目录名一致
3. README 和 CLI 输出的命令与用户包管理器一致
4. 发布前模板依赖版本能被自动替换并校验

**当前实现补充**

- 已支持 `--template`、`--provider`、`--yes`、`--install`、`--no-install`、`--overwrite`、`--cwd`
- 已支持基于项目名注入：
  - `templates/basic/package.json.name`
  - README 标题
  - `chat.config.ts` 的 brand title
- README 里的安装、开发、构建命令会随包管理器一起替换
- 已新增发布护栏脚本：
  - `scripts/update-versions.mjs`
  - `scripts/validate-templates.mjs`

### 10.4 Phase 2B：测试基线

**目标**

给 `chat-cli` 建立最小护栏，避免脚手架入口成为整个链路里最脆弱的一环。

**建议改动**

1. 单元测试

- `inferPackageManager`
- `getCommand`
- `getTemplateVariables`
- `renameSpecialFiles`
- `copyTemplateFiles`
- `applyTemplateVariables`

2. 集成测试

- 在临时目录执行模板生成辅助逻辑
- 校验：
  - 文件是否生成
  - `_gitignore` / `_env.example` 是否重命名
  - provider / model 占位符是否被替换
  - 模板是否默认走安全的 server proxy 路径

3. 冒烟测试

- 对生成模板执行一次 `install + build`

**建议目录**

```txt
packages/test/src/chat-cli/
  scaffold.spec.ts
  release.spec.ts
  smoke.spec.ts
```

**验收标准**

1. `packages/test` 内已有框架可以直接回归 `chat-cli` 代码生成逻辑
2. 至少一条模板生成链路可在临时目录完整验证
3. 能明确校验默认输出不再暴露浏览器侧 API Key

**当前实现补充**

- 已新增 `packages/chat-cli/src/scaffold.ts`，把生成辅助逻辑从 CLI 入口中拆出
- 已新增 `packages/test/src/chat-cli/scaffold.spec.ts`
- 已新增 `packages/chat-cli/scripts/template-release-utils.mjs`
- 已新增 `packages/test/src/chat-cli/release.spec.ts`
- 已新增 `packages/test/src/chat-cli/smoke.spec.ts`
- 当前已覆盖：
  - provider 默认变量映射
  - 项目名与标题注入
  - 包管理器命令注入
  - `inferPackageManager` / `getCommand`
  - `_gitignore` / `_env.example` 重命名
  - 模板文件复制过滤
  - 占位符替换
  - `basic` 模板的安全化生成结果
  - 一条命令的无交互生成验证
  - CLI `--help` / `--version` 输出
  - 非空目录默认拒绝覆盖
  - `--overwrite` 清理并重建目录
  - workspace 包版本收集与模板依赖替换
  - `workspace:*` 残留校验
  - 生成模板在本地工具链下完成 smoke build

### 10.5 暂不进入本轮的内容

以下内容建议保留到后续阶段，不在本轮先做：

- `add` 子命令
- `migrate` 子命令
- 多模板元数据体系
- MCP / RAG / docs variant 模板族
- GUI / IDE 集成

原因不是它们不重要，而是：

> 在默认安全路径、配置契约、CLI 工程能力还没收口之前，平台化扩展会过早放大复杂度。

### 10.6 推荐实施顺序

建议按下面顺序推进：

1. Phase 1：模板默认安全化 + 配置文件化
2. Phase 2A：flags / 项目名注入 / 发布护栏
3. Phase 2B：测试基线

如果你希望阶段更细，还可以拆成：

- Phase 1A：模板安全模型
- Phase 1B：`chat.config.ts + lib/chat.ts`
- Phase 2A：flags 与输出一致性
- Phase 2B：测试

---

## 十一、确认后建议先做什么

如果你确认按这份方案推进，我建议第一步先做：

1. `Phase 1`
2. 只生成 server proxy 基础模板
3. 暂不引入多模板
4. 完成后你手动验证：
   - 新项目结构是否更清楚
   - 默认是否不再暴露 API Key
   - 修改 `chat.config.ts` 是否能驱动页面

这一步确认方向正确后，再继续 `Phase 2A`。

---

## 十二、参考资料

- Vue 官方 `create-vue`：https://github.com/vuejs/create-vue
- shadcn CLI：https://ui.shadcn.com/docs/cli
- create-next-app：https://nextjs.org/docs/app/api-reference/create-next-app
- Vercel Academy - Basic Chatbot：https://vercel.com/academy/ai-sdk/basic-chatbot

---

## 十三、当前收口结论

结合当前代码、测试与文档状态，可以把 `chat-cli` 的本轮实施结果概括为：

- 已完成基础模板安全化
- 已完成 `config -> adapter -> preset` 的模板落地
- 已完成 CLI 非交互能力和发布护栏
- 已完成 `packages/test/src/chat-cli` 下的生成、发布、smoke 三层回归
- 已完成面向使用者的正式文档和站点侧边栏接入

当前更适合把 `chat-cli` 定义为：

> **一个已经具备正式使用基础的 Chat 项目初始化脚手架，而不是只用于内部 demo 的模板复制工具。**

后续如果继续投入，建议转向平台化增强，而不是回头重做本轮已经完成的主链路。
