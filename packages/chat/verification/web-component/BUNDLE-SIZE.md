# Chat Web Component 体积问题

更新：2026-09-27。本记录对应验证切片及本次构建配置修复，不代表正式发布或 Angular 验收。

## 结论

应在正式开发前处理。已定位到 `packages/chat/vite.web-component.config.ts` 的 `build.rollupOptions.output.inlineDynamicImports: true`：强制合成单个 JS 文件时，当前聚合依赖图的最终产物包含大量无关组件代码及样式。允许动态模块拆分后，全部 JS + CSS gzip 从 2,538 kB 降至 706 kB，减少约 72.2%。这是两种输出布局的总产物差值；分块后的压缩边界也会影响 gzip，不能将全部差值当作 tree shaking 裁剪量。完整样式仍随产物提供。

最终修复只改变 Web Component 验证构建的默认输出策略。组件聚合导入和依赖声明保持原样，不再需要分析插件替换导入来得到小包。本轮曾验证子包导入方案，随后根据配置对照的收益和改动范围撤回了本轮的共享组件修改。

## 哪些配置有关

| 位置 | 已核实事实 | 对体积的影响 |
| --- | --- | --- |
| `packages/chat/vite.config.ts` | Vue、TinyRobot、kit 等是 external | 普通 Vue 库文件不包含这些依赖，库文件小不能代表宿主实际加载量 |
| `packages/components/vite.config.ts` | external 精确包名 `@opentiny/vue` | 普通 Vue 组件库的打包边界保持原样 |
| `packages/chat/vite.web-component.config.ts` | 将工作区入口映射到源码，且不 external Vue/UI 依赖 | 让原生宿主无需安装 Vue，也暴露了完整依赖成本；该分发要求仍保留 |
| 同上 `inlineDynamicImports: true` | 强制将动态依赖合并输出 | 已由单变量对照验证为大包的关键触发配置；默认改为 `false` |
| 同上 `cssCodeSplit: false` | 将保留的样式合并为一个文件 | 只负责合并，不会按当前 DOM 或 `v-if` 删除未显示组件的样式 |

没有找到项目显式关闭 tree shaking 的配置。完整大包的 Rollup 模块信息显示 `@opentiny/vue/index.js` 的 `moduleSideEffects` 为 `false`，因此不能把问题归结为丢失该包的 `sideEffects` 声明。

真实组件采用“具名导入后使用”的形式。强制合并时，这种形式会保留大量组件初始化及样式；单纯直接转导出同一个符号则可以裁剪。允许拆分后，具名导入再使用也能裁剪。这些差异来自当前 Vite/Rollup 与依赖产物的组合，不能用转导出实验代替真实 Vue 组件用法，也不能只看 `sideEffects` 字段。本次已定位配置触发条件，尚未将其认定为某个上游工具的缺陷。

## 最小复现

依赖已安装的仓库中，在 `packages/chat` 执行：

```powershell
node verification/web-component/reproduce-size.mjs
```

脚本通过真实 Vite 生产构建比较以下导入，不加载 Chat，也不加载 Vue SFC 插件。结果写入 `tooltip-size-report.json`，包括实际文件字节、gzip、模块组和解析信息。

```ts
// 会产生大包的使用形式
import { TinyTooltip } from '@opentiny/vue'
export const Tooltip = TinyTooltip

// 修复后的使用形式，实际仍引用同一个子包组件
import TinyTooltip from '@opentiny/vue-tooltip'
export const Tooltip = TinyTooltip
```

在 OpenTiny Vue 3.31.0、Vite 5.4.21、Rollup 4.62.4、Vue 3.5.42 的本次环境中：

| Tooltip 实验 | JS gzip kB | CSS gzip kB |
| --- | ---: | ---: |
| 聚合入口导入后使用 | 1,897.8 | 158.3 |
| 子包入口导入后使用 | 139.3 | 7.3 |
| 聚合入口直接转导出 | 139.4 | 7.3 |
| 聚合入口导入后使用，统一设置 `moduleSideEffects: false` | 1,780.0 | 158.3 |
| 聚合入口导入后使用，仅允许动态模块拆分 | 150.5 | 7.3 |

统一忽略副作用没有解决该复现，且可能删除真正需要执行的初始化，因此未用于修复。将入口换成绝对路径也未改善“导入后使用”的结果。

## 完整 Chat 复现和检查

修复后仍可在同一源码上重现旧构建配置。`inline` 只恢复强制单文件输出，产物进入独立目录；不会修改源码。

```powershell
# 在 packages/chat 执行：重现大包
$env:CHAT_WC_ANALYSIS_VARIANT = 'inline'
pnpm exec vite build --config vite.web-component.config.ts

# 构建当前源码修复包，并运行体积门禁
$env:CHAT_WC_ANALYSIS_VARIANT = 'baseline'
pnpm exec vite build --config vite.web-component.config.ts
node verification/web-component/check-size.mjs
```

| 完整 Chat 实际文件测量 | JS 原始 kB | JS gzip kB | CSS 原始 kB | CSS gzip kB |
| --- | ---: | ---: | ---: | ---: |
| 聚合导入 + 强制单文件 | 9,136.9 | 2,349.7 | 1,444.2 | 188.1 |
| 子包导入 + 强制单文件，仅作方案对照 | 2,742.9 | 764.8 | 519.2 | 66.7 |
| 聚合导入 + 允许拆分，最终修复 | 2,467.5 | 650.2 | 449.1 | 55.7 |

最终对照报告为 `bundle-report-inline.json` 和 `bundle-report-baseline.json`，阶段中的聚合单文件报告另保留在 `bundle-report-aggregate.json`。模块贡献值是压缩前估计，不可直接作为 gzip 节省量。表格汇总目录内全部 JS 文件各自的 gzip 字节，包含延迟加载文件，而非只计算入口。Vite 控制台长度与 UTF-8 文件字节存在差别，表格统一按磁盘字节 / 1000 计算。gzip 是计算值，验证服务器发送未压缩文件，不能视为已测线上下载量。

`check-size.mjs` 检查 JS gzip <= 1,000 kB、CSS gzip <= 100 kB，并检查 ECharts、zrender、grid、fluent-editor、Quill 未重新进入模块报告。它先核对报告和产物中全部 JS/CSS 文件名及逐文件 SHA-256，避免依赖排除检查误用旧报告。通过记录为 `size-check.json`。门禁目前只覆盖 JS/CSS，不检查其他格式资源。

运行 `node verification/web-component/server.mjs`，访问 `/` 使用修复包，访问 `/?bundle=inline` 使用大包。两个页面均为不加载宿主 Vue/项目全局样式的原生 HTML。

当前修复包包含一个入口、三个延迟加载 JS 文件和一个 CSS 文件。宿主仍只导入 `index.js`，内部携带 Vue；部署必须保留整个产物目录及相对路径。不能只复制入口文件。新增浏览器用例将模块和资源映射到 `/relocated/chat/`，检查 CSS、Markdown/DOMPurify 文件返回 200，并确认 Markdown 实际渲染为 `<strong>`。

## 修复范围和验收

- Web Component 默认设置 `inlineDynamicImports: false`，保留完整 CSS 和现有原生 DOM 接口。
- 增加最小复现、解析信息报告、全部文件体积门禁和相对资源路径浏览器用例。
- `gpt-6-sol high` 独立复核指出旧版体积门禁未绑定报告与产物；现已用逐文件 SHA-256 修复。重新构建和正常门禁通过，内存中篡改报告哈希的负向检查确认会拒绝旧报告，且未改动磁盘报告。原始意见保留在 `INDEPENDENT-REVIEW.md`。
- 子包导入实验的共享组件源码、manifest 和 external 改动已撤回；最终依赖声明与本轮开始时一致。
- 实验中使用 `pnpm --filter @opentiny/tiny-robot install --offline --ignore-scripts` 安装及恢复仓库依赖。本次没有下载包或修改全局环境。本地 `pnpm-lock.yaml` 被仓库规则忽略，不会出现在 Git diff 中。
- 组件库 `pnpm run build` 通过，包含类型检查、生产构建和类型声明生成。
- Web Component Chromium 验收包含原有 10 条和新增相对资源路径用例；普通 Vue 回归包含附件、Mention、Suggestion 36 条。具体最终运行结果见 `RESULTS.md`。
- 既有 Shadow DOM 的 4 个修改文件保持原样；没有修改 kit 或 Angular 任务的业务代码。

本记录当时尚未覆盖 Angular 独立安装；后续正式包已完成原生 HTML、Angular 21 和实际 Chrome 的 tarball 消费及本机启动记录，见 [RESULTS.md](./RESULTS.md)。MCP 面板完整交互、全部组件回归、其他浏览器及线上冷启动性能尚未验证。剩余 JS 仍包含 Vue、Tiptap/ProseMirror 和 Markdown 等真实 Chat 依赖；本次解决打包配置触发的过量依赖，不把约 706 kB gzip 视为最终性能承诺。
