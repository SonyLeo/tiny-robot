**发现**
- **中：体积门禁的依赖排除检查可能使用过期报告。** `check-size.mjs:8` 读取磁盘上的 `bundle-report-baseline.json`，但未校验它与 `dist-web-component` 中被测文件属于同一次构建；`check-size.mjs:21-23` 因而可能对新产物使用旧的依赖组并误报通过。**已观察到的是校验缺口，不是本次报告失配。** 建议让构建与检查共用一次生成的报告，或记录并校验产物关联信息。

**对照结论**
- 完整 Chat 的 `inline` 与默认 `baseline` 在所给配置中保持相同入口、聚合导入及依赖处理；相关差异是 `inlineDynamicImports` 和输出目录（`vite.web-component.config.ts:9-16,23-55,128-133`）。最小复现的 `aggregate-used`／`aggregate-split-used` 也仅改变该输出选项（`reproduce-size.mjs:12-16,28-35,47-53`）。两组结果支持“配置是当前构建的大包触发条件”，**不证明具体上游 Vite/Rollup 缺陷**。直接子包导入对照则改变了导入路径，不能作为单变量证据。
- `size-check.json` 四个 JS 的 gzip 相加为 **650,224** 字节，包含三个延迟文件；CSS 为 **55,718** 字节。与旧包合计 **2,537,773** 字节相比，新包合计 **705,942** 字节，下降约 **72.2%**（`check-size.mjs:10-15`；`BUNDLE-SIZE.md:72-78`）。这是逐文件 gzip 之和，并非实测网络传输量。
- 保留聚合导入、仅调整 WC 输出配置是可辩护的窄修复：它在完整产物上优于直接导入实验，同时避免改动共享组件（`BUNDLE-SIZE.md:72-76,86-90`）。

**未验证边界**：迁移测试通过 `route.fulfill` 从本地产物供给资源（`chat-web-component.spec.ts:15-27`），并只断言至少三个 JS 响应（`:42-46`）。它验证了所触发的相对路径与 Markdown 渲染，**不等于**独立宿主安装或全部延迟分支的资源、生命周期验收；部署仍须保留完整产物目录（`BUNDLE-SIZE.md:84`）。