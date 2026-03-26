# Chat CLI 发布手册

> 最近更新：`2026-03-26`
> 适用范围：`packages/chat-cli` 及其依赖的发布顺序、演示发布流程、后续自动化发布方向
> 相关文档：
> - [检视报告 02](./chat-cli-review-02.md)
> - [模板策略](./review/template-strategy.md)
> - [Chat CLI 设计](../../docs/chat-cli-design.md)

---

## 1. 文档角色

这份文档只处理发布问题，不处理模板设计问题。

它主要回答：

1. 对外应该给用户什么命令
2. 明天演示时如何以最低风险发布
3. 当前仓库下，依赖包和 CLI 应该按什么顺序发布
4. 后续正式化时，发布链路应如何升级

模板结构与技术债，请看：

- [chat-cli-review-02.md](./chat-cli-review-02.md)

---

## 2. 当前发布对象

当前如果要让外部用户真正运行 `create-tiny-robot`，实际涉及的已发布包至少包括：

- `@opentiny/tiny-robot-svgs`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`
- `create-tiny-robot`

原因很简单：

- CLI 本身只是生成器
- 生成出的模板项目，最终安装的是线上 npm 包，而不是本地 workspace

因此 `chat-cli` 的发布从来都不是“单包发布”。

它是一个带依赖链的发布问题。

---

## 3. 对外推荐命令

### 3.1 当前包名下最适合文档化的命令

当前 CLI 包名是：

- `create-tiny-robot`

基于 npm / pnpm / bun / yarn 的 create 规则，推荐的对外命令如下。

#### npm

```bash
npm create tiny-robot@latest
```

#### npm 指定模板

```bash
npm create tiny-robot@latest my-agent -- --template basic --provider openai
```

```bash
npm create tiny-robot@latest my-agent-mcp -- --template agent-mcp --provider openai
```

#### pnpm

```bash
pnpm create tiny-robot
```

#### bun

```bash
bun create tiny-robot
```

#### yarn

```bash
yarn dlx create-tiny-robot@latest
```

### 3.2 为什么建议文档里显式带 `@latest`

推荐文档里优先写：

- `npm create tiny-robot@latest`

而不是省略版本标签。

原因：

- 避免执行到本地或代理缓存的旧版本
- 演示时更容易表达“这是当前最新版本”
- 与 `create-vue`、`create-next-app` 这类 starter 的官方文档习惯一致

### 3.3 非交互模式建议保留

对外示例中建议继续保留：

- `--yes`
- `--no-install`

因为现代 starter CLI 的常见能力就是：

- 可交互
- 也可用于 CI、脚本、录屏演示、批量创建

---

## 4. 当前仓库下的安全发布顺序

### 4.1 为什么不能先发 CLI

当前模板项目生成后会安装：

- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-svgs`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot-chat`

因此如果先发布 CLI，而模板里写入的版本在 registry 上还不存在，就会出现：

- `npm install` 找不到版本
- 模板用户拿到 CLI 却无法完成安装

所以当前安全顺序必须固定为：

1. `@opentiny/tiny-robot-svgs`
2. `@opentiny/tiny-robot-kit`
3. `@opentiny/tiny-robot`
4. `@opentiny/tiny-robot-chat`
5. 重跑模板版本替换
6. `create-tiny-robot`

### 4.2 为什么中间要重跑模板准备

`packages/chat-cli/package.json` 已经定义了：

- `prepare:templates`
- `prepublishOnly`

这说明 CLI 模板本身依赖：

- 模板目录中的依赖版本被正确替换

因此库包版本一旦确定，CLI 在真正 publish 前应至少再执行一次：

```bash
pnpm -F create-tiny-robot prepare:templates
```

这样模板中写入的依赖版本才会与已经发布到 npm 的版本一致。

---

## 5. 明日演示型发布流程

如果目标是：

- 明天给别人演示
- 让对方真的能执行一条命令创建项目

那么推荐按下面流程走。

### 5.1 第一步：冻结版本集合

先确认：

- 这次要发的包就是那 5 个
- 版本号已经定
- 不再混入与演示无关的改动

当前仓库使用的是：

- `lerna` independent versioning

但没有现成的一键自动发布链路，因此明日演示建议走手工可控流程。

### 5.2 第二步：先做本地包级验证

推荐命令：

```bash
pnpm build:svgs
```

```bash
pnpm build:kit
```

```bash
pnpm build:components
```

```bash
pnpm build:chat
```

```bash
pnpm -F create-tiny-robot typecheck
```

```bash
pnpm -F create-tiny-robot prepare:templates
```

```bash
pnpm -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts
```

这一步的目的不是“证明外部发布一定成功”，而是先把明显构建问题挡住。

### 5.3 第三步：每个待发布包先 `npm pack --dry-run`

对每个待发包都执行：

```bash
npm pack --dry-run
```

重点检查：

- `dist` 是否在包里
- 不该带的源文件是否被排除
- CLI 包内是否带上了 `templates` 和 `dist`
- 模板 README 与示例文件是否进入打包结果

这是触网前最有效的快速检查。

### 5.4 第四步：先发布库包

当前这些包是 scoped public package：

- `@opentiny/tiny-robot-svgs`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`

首次公开发布或显式公开发布时，npm 官方建议使用：

```bash
npm publish --access public
```

建议按顺序逐个发布。

### 5.5 第五步：重新准备 CLI 模板

库包发布完成后，再次执行：

```bash
pnpm -F create-tiny-robot prepare:templates
```

作用：

- 把模板中的 `workspace:*` 和版本号替换成最终对外可安装的版本
- 确保 CLI 发布时内置模板是最新包版本

### 5.6 第六步：CLI 先发 `next`

明日演示不建议直接把 CLI 首发到 `latest`。

更稳的方式是：

```bash
npm publish --tag next
```

理由：

- 先把 CLI 发到 `next`
- 再做真实外部安装验证
- 验证通过后再提升到 `latest`

这样即便有问题，也不会第一时间影响默认用户。

### 5.7 第七步：必须做 workspace 外部的 clean install 验证

这一步非常关键。

不要只看 monorepo 内部 smoke。

必须在一个干净目录中执行真正用户命令：

```bash
npm create tiny-robot@next demo-agent -- --template basic --provider openai --yes --no-install
```

进入生成目录后再执行：

```bash
npm install
```

```bash
npm run build
```

然后再验证 MCP 模板：

```bash
npm create tiny-robot@next demo-agent-mcp -- --template agent-mcp --provider openai --yes --no-install
```

进入目录后：

```bash
npm install
```

```bash
npm run build
```

如果还来得及，建议再补一个启动验证：

```bash
npm run dev
```

这一步是最接近真实用户场景的验证。

### 5.8 第八步：验证通过后再切 `latest`

验证通过后，再决定是否：

- 重新发布稳定版本到 `latest`
- 或通过 `dist-tag` 提升

无论采用哪种方式，原则都是：

- `next` 用于预发布验证
- `latest` 只给真正稳定可用版本

---

## 6. 为什么当前 smoke 不能替代发布验证

当前 `packages/test/src/chat-cli/smoke.spec.ts` 的思路是：

- 生成模板项目
- 把 monorepo 根目录 `node_modules` 通过 symlink 链给生成项目
- 然后运行类型检查与构建

这很适合本地快速回归。

但它不能替代真实发布验证，因为它不能证明：

- 外部 npm 安装链完整
- 模板依赖闭包已经完全收口
- registry 上的版本真的能被解析和安装

因此要明确区分两类验证：

- monorepo smoke
  - 验证仓库内部工具链兼容
- clean install smoke
  - 验证外部用户创建项目后能正常安装和构建

后者必须进入发布门禁。

---

## 7. 长期正式发布建议

当前为了明日演示，可以接受以手工发布为主。

但后续应尽量升级为更现代的发布模式。

### 7.1 建议引入 trusted publishing

npm 目前推荐在受支持场景下使用 trusted publishing，而不是长期保存 automation token。

如果基于 GitHub Actions，后续应优先考虑：

- `id-token: write`

这样能减少：

- 长期 token 泄漏风险
- token 轮换管理成本
- 为自动化绕过 2FA 带来的额外操作

### 7.2 建议引入 provenance

provenance 的意义是：

- 让发布包的构建来源与构建流程可追踪

对于 starter CLI 和基础库来说，这是一个长期值得补齐的发布质量项。

如果后续切到：

- GitHub Actions
- trusted publishing

那么 provenance 也能顺势纳入。

### 7.3 建议把 `next` / `latest` 策略固定下来

建议长期固定为：

- `next`
  - 预发布
  - 候选版本
  - 演示先行版本
- `latest`
  - 已通过 clean install 与生成项目验证
  - 推荐给普通用户

starter CLI 比普通库更依赖这个纪律，因为错误会直接出现在“创建项目”第一步。

### 7.4 建议把 clean install 验证做成正式脚本或 CI job

后续建议补一条正式脚本，至少做到：

1. 在临时目录中运行 `npm create tiny-robot@<tag>`
2. 进入目录执行 `npm install`
3. 执行 `npm run build`
4. 对两个模板都跑一遍

一旦这个脚本存在，它就可以：

- 手工发布前复用
- CI 中复用
- 回归测试中复用

---

## 8. 文档与对外演示建议

### 8.1 对外文档建议优先展示 npm

如果是面对普通外部用户或录屏演示，建议优先展示：

```bash
npm create tiny-robot@latest
```

原因：

- 更广泛
- 更直观
- 与主流 starter 展示方式一致

### 8.2 CLI 文档里建议同时给出非交互命令

建议保留一条明确的“演示命令”：

```bash
npm create tiny-robot@latest my-agent -- --template basic --provider openai --yes --no-install
```

这样对方可以一眼看到：

- 模板名
- provider
- 非交互能力
- 不自动安装能力

### 8.3 推荐先演示 `basic`，再演示 `agent-mcp`

演示顺序建议：

1. `basic`
   - 展示“最小起步”
2. `agent-mcp`
   - 展示“工具型 agent 的额外结构”

这样更符合用户心智，也更容易解释模板边界。

---

## 9. 建议后的发布待办

### 9.1 明日前建议完成

1. 确认五个包的版本与发布顺序
2. 跑完 build / typecheck / release / smoke
3. 每个包做 `npm pack --dry-run`
4. 先发库包，再发 CLI
5. CLI 先打 `next`
6. 在干净目录完成两套模板的真实安装与构建
7. 验证通过后再决定是否切 `latest`

### 9.2 后续应补齐

1. clean install 脚本化
2. `next -> latest` 流程文档化
3. CI publish
4. trusted publishing
5. provenance

---

## 10. 参考来源

以下建议基于官方文档与当前仓库结构整理：

- npm `init/create`
  - https://docs.npmjs.com/cli/v9/commands/npm-init/?v=true
- pnpm `create`
  - https://pnpm.io/cli/create
- bun `create`
  - https://bun.sh/docs/runtime/templating/create
- yarn `dlx`
  - https://yarnpkg.com/cli/dlx
- create-next-app CLI
  - https://nextjs.org/docs/app/api-reference/cli/create-next-app
- npm dist-tags
  - https://docs.npmjs.com/adding-dist-tags-to-packages/
- npm scoped public package
  - https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- npm trusted publishing
  - https://docs.npmjs.com/trusted-publishers
- npm provenance
  - https://docs.npmjs.com/generating-provenance-statements
