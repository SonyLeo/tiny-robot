# ContentNav → Anchor 重命名重构计划

> 将 `content-nav`（内容导航）组件重命名为 `anchor`（锚点）。

---

## 一、修改范围评估

### 1. 组件源码目录（共 15 个源文件）

**目录重命名：**

- `packages/components/src/content-nav/` → `packages/components/src/anchor/`

**目录内文件清单：**

| # | 原文件 | 新文件 | 修改内容 |
|---|--------|--------|----------|
| 1 | `index.vue` | `index.vue` | 组件名 `TrContentNav` → `TrAnchor`；import 子组件名；所有 `ContentNav*` 类型引用 |
| 2 | `index.ts` | `index.ts` | 导出名 `ContentNav` → `Anchor`；组件注册名 `TrContentNav` → `TrAnchor` |
| 3 | `index.type.ts` | `index.type.ts` | 12 个公开类型重命名（`ContentNavItem` → `AnchorItem`，`ContentNavProps` → `AnchorProps`，`ContentNavEmits` → `AnchorEmits`，`ContentNavSlots` → `AnchorSlots`，`ContentNavSearchOptions` → `AnchorSearchOptions`，`ContentNavSearchMatcher` → `AnchorSearchMatcher`，`ContentNavHighlightSegment` → `AnchorHighlightSegment`，`ContentNavPlacement` → `AnchorPlacement`，`ContentNavExpandTrigger` → `AnchorExpandTrigger` 等） |
| 4 | `internal.type.ts` | `internal.type.ts` | 18 个内部类型重命名（`ContentNavFilteredItem`、`ContentNavOverlayProps`、`ContentNavOverlayExpose`、`ContentNavListProps`、`ContentNavListEmits`、`ContentNavListSlots`、`ContentNavItemProps`、`ContentNavItemEmits`、`ContentNavItemSlots`、`ContentNavActiveSyncOptions`、`ContentNavFloatingOffsetOptions`、`ContentNavOverlayInteractionsOptions`、`ContentNavControllerOptions`、`ContentNavTargetFeedbackOptions`、`ContentNavSearchProps`、`ContentNavSearchEmits`、`ContentNavItemSlotProps`、`ContentNavMarkerSlotProps`） |
| 5 | `defaults.ts` | `defaults.ts` | 函数名：`defaultContentNavSearchMatcher` → `defaultAnchorSearchMatcher`，`defaultContentNavActiveResolver` → `defaultAnchorActiveResolver`，`ensureContentNavSegments` → `ensureAnchorSegments` |
| 6 | `components/ContentNavItem.vue` | `components/AnchorItem.vue` | 文件重命名；CSS 类名 `tr-content-nav__*` → `tr-anchor__*`；CSS 变量引用 |
| 7 | `components/ContentNavList.vue` | `components/AnchorList.vue` | 文件重命名；CSS 类名 `tr-content-nav__*` → `tr-anchor__*` |
| 8 | `components/ContentNavOverlay.vue` | `components/AnchorOverlay.vue` | 文件重命名；CSS 类名 `tr-content-nav` → `tr-anchor`；`data-testid="content-nav-overlay"` → `data-testid="anchor-overlay"` |
| 9 | `components/ContentNavSearch.vue` | `components/AnchorSearch.vue` | 文件重命名；CSS 类名；`data-testid="content-nav-search"` → `data-testid="anchor-search"` |
| 10 | `composables/useActiveSync.ts` | 同名 | 6 个 scroll 工具函数引用重命名；类型引用 |
| 11 | `composables/useNavController.ts` | 同名 | `defaultContentNavSearchMatcher`、`ensureContentNavSegments` 引用；类型引用 |
| 12 | `composables/useOverlayInteractions.ts` | 同名 | `queryContentNavItemById` → `queryAnchorItemById`；类型引用 |
| 13 | `composables/useFloatingOffset.ts` | 同名 | CSS 选择器字符串 `.tr-content-nav__surface` → `.tr-anchor__surface`，`.tr-content-nav__panel` → `.tr-anchor__panel`；类型引用 |
| 14 | `composables/useTargetFeedback.ts` | 同名 | 类型引用 `ContentNavTargetFeedbackOptions` → `AnchorTargetFeedbackOptions` |
| 15-a | `utils/scroll.ts` | 同名 | 类型 `ContentNavScrollRoot` → `AnchorScrollRoot`；6 个函数重命名（`resolveContentNavScrollRoot`、`getContentNavScrollTop`、`getContentNavClientHeight`、`getContentNavScrollHeight`、`getContentNavViewportTop`、`scrollContentNavTo`） |
| 15-b | `utils/target.ts` | 同名 | 常量 `CONTENT_NAV_TARGET_ATTRIBUTE`（值 `data-content-nav-id` → `data-anchor-id`）、`CONTENT_NAV_TARGET_SELECTOR`、`CONTENT_NAV_ITEM_ATTRIBUTE`、`CONTENT_NAV_ITEM_SELECTOR`；函数 `queryContentNavTargetById` → `queryAnchorTargetById`、`queryContentNavItemById` → `queryAnchorItemById`；dataset key `contentNavId` → `anchorId` |

### 2. 样式文件（2 个文件）

| # | 文件 | 修改内容 |
|---|------|----------|
| 1 | `packages/components/src/styles/components/content-nav.less` → 重命名为 `anchor.less` | mixin `.tr-content-nav-vars()` → `.tr-anchor-vars()`；`@prefix: tr-content-nav` → `@prefix: tr-anchor`；所有 CSS 变量 `--tr-content-nav-*` → `--tr-anchor-*`（约 28 个变量）；动画名 `tr-content-nav-target-flash` → `tr-anchor-target-flash`、`tr-content-nav-target-outline` → `tr-anchor-target-outline`；类名 `.tr-content-nav-target--flash` → `.tr-anchor-target--flash`、`.tr-content-nav-target--outline` → `.tr-anchor-target--outline` |
| 2 | `packages/components/src/styles/components/index.css` | `@import './content-nav.less'` → `@import './anchor.less'` |

### 3. 组件总入口（1 个文件）

| # | 文件 | 修改内容 |
|---|------|----------|
| 1 | `packages/components/src/index.ts` | import 路径 `./content-nav` → `./anchor`；导出名 `ContentNav` → `Anchor`，`TrContentNav` → `TrAnchor`；类型导出路径 `./content-nav/index.type` → `./anchor/index.type` |

### 4. 文档（6 个文件 + 1 个目录重命名）

**文档页面：**

| # | 文件 | 修改内容 |
|---|------|----------|
| 1 | `docs/src/components/content-nav.md` → 重命名为 `anchor.md` | 标题 `ContentNav 内容导航` → `Anchor 锚点`；所有类型名引用（`ContentNavItem`、`ContentNavSearchOptions`、`ContentNavSearchMatcher`、`ContentNavHighlightSegment`）；所有 CSS 变量名 `--tr-content-nav-*` → `--tr-anchor-*`（约 28 个）；demo 引用路径 `../../demos/content-nav/` → `../../demos/anchor/`；`data-content-nav-id` → `data-anchor-id` |

**Demo 目录重命名：**

- `docs/demos/content-nav/` → `docs/demos/anchor/`

**Demo 文件（5 个）：**

| # | 文件 | 修改内容 |
|---|------|----------|
| 2 | `docs/demos/content-nav/basic-source.vue` → `docs/demos/anchor/basic-source.vue` | `<tr-content-nav>` → `<tr-anchor>`；import `TrContentNav` → `TrAnchor`；`data-content-nav-id` → `data-anchor-id`；CSS 变量名 `--content-nav-demo-*`（demo 内部变量，可选改）；`target-feedback-class="article-section--active"` 不变（这是用户自定义类名） |
| 3 | `docs/demos/content-nav/controlled-search.vue` → `docs/demos/anchor/controlled-search.vue` | `<tr-content-nav>` → `<tr-anchor>`；import `TrContentNav` → `TrAnchor`；`data-content-nav-id` → `data-anchor-id`；变量名 `contentNavItems` → `anchorItems` |
| 4 | `docs/demos/content-nav/basic-source.messages.ts` → `docs/demos/anchor/basic-source.messages.ts` | 类型名 `ContentNavDemoMessage`（demo 内部类型，建议改为 `AnchorDemoMessage`） |
| 5 | `docs/demos/content-nav/controlled-search.messages.ts` → `docs/demos/anchor/controlled-search.messages.ts` | 同上 |
| 6 | `docs/demos/content-nav/demo-shell.less` → `docs/demos/anchor/demo-shell.less` | CSS 变量名 `--content-nav-demo-*` → `--anchor-demo-*`（可选） |

**VitePress 配置（1 个文件）：**

| # | 文件 | 修改内容 |
|---|------|----------|
| 7 | `docs/.vitepress/themeConfig.ts` | 侧边栏文案 `ContentNav 内容导航` → `Anchor 锚点`；link `content-nav` → `anchor` |

### 5. E2E 测试（1 个目录重命名 + 4 个文件 + 1 个路由入口）

**测试目录重命名：**

- `packages/test/src/content-nav/` → `packages/test/src/anchor/`

**测试文件（4 个）：**

| # | 文件 | 修改内容 |
|---|------|----------|
| 1 | `packages/test/src/content-nav/index.spec.ts` → `packages/test/src/anchor/index.spec.ts` | `describe('ContentNav component e2e')` → `describe('Anchor component e2e')`；`createContentNavTestHelper` → `createAnchorTestHelper`；`helper.isContentNavReady()` → `helper.isAnchorReady()`；所有 `selectors.contentNavRoot` → `selectors.anchorRoot`；CSS 类名选择器 `.tr-content-nav__*` → `.tr-anchor__*`；data attribute `[data-content-nav-id="turn-5"]` → `[data-anchor-id="turn-5"]`；CSS 类名 `tr-content-nav-target--flash` → `tr-anchor-target--flash`；`TrContentNav` 文案引用 → `TrAnchor` |
| 2 | `packages/test/src/content-nav/index.vue` → `packages/test/src/anchor/index.vue` | 页面标题 `ContentNav component test`；所有 `data-testid="content-nav-*"` → `data-testid="anchor-*"`；`hasContentNav` → `hasAnchor`；`TrContentNav` 引用 → `TrAnchor`；`data-content-nav-id` → `data-anchor-id`；`target-feedback-class="tr-content-nav-target--flash"` → `target-feedback-class="tr-anchor-target--flash"`；`FallbackContentNav` → `FallbackAnchor`；CSS 类名 `.content-nav-demo` → `.anchor-demo`（可选） |
| 3 | `packages/test/src/content-nav/selectors.ts` → `packages/test/src/anchor/selectors.ts` | 常量名 `CONTENT_NAV_SELECTORS` → `ANCHOR_SELECTORS`；类型名 `ContentNavSelectors` → `AnchorSelectors`；所有 `data-testid` 值中的 `content-nav` → `anchor`；选择器 key 名 `contentNavRoot` → `anchorRoot`、`contentNavHost` → `anchorHost`、`contentNavOverlay` → `anchorOverlay`、`contentNavSearch` → `anchorSearch`、`contentNavFallback` → `anchorFallback` |
| 4 | `packages/test/src/content-nav/testHelper.ts` → `packages/test/src/anchor/testHelper.ts` | 函数名 `createContentNavTestHelper` → `createAnchorTestHelper`；类型名 `ContentNavPlacement` → `AnchorPlacement`、`ContentNavExpandTrigger` → `AnchorExpandTrigger`；所有 `selectors.contentNav*` 引用；CSS 类名选择器 `.tr-content-nav__*` → `.tr-anchor__*`；错误信息文案中的 `content-nav` → `anchor` |

**测试路由入口（1 个文件）：**

| # | 文件 | 修改内容 |
|---|------|----------|
| 5 | `packages/test/src/App.vue` | 路由链接 `/content-nav` → `/anchor`；`currentComponent = 'ContentNav'` → `currentComponent = 'Anchor'`；链接文案 `ContentNav Demo` → `Anchor Demo`；import 路径 `./content-nav/index.vue` → `./anchor/index.vue`；import 名 `ContentNavDemo` → `AnchorDemo`；`ComponentName` 类型中 `'ContentNav'` → `'Anchor'`；components map 中 `ContentNav: ContentNavDemo` → `Anchor: AnchorDemo` |

### 6. 构建产物（不手动修改，重新构建即可）

以下文件在重新构建后会自动更新，无需手动修改：

- `packages/components/dist/index.js`
- `packages/components/dist/index.d.ts`
- `packages/components/dist/content-nav/index.js` → 构建后变为 `dist/anchor/index.js`
- `packages/components/dist/style.css`
- `docs/dist/**/*`（文档构建产物）
- `docs/.vitepress/.temp/**/*`（VitePress 临时文件）
- `docs/.vitepress/cache/**/*`（VitePress 缓存）

### 7. ⚠️ 破坏性变更（需特别注意）

| 变更项 | 影响范围 | 说明 |
|--------|----------|------|
| HTML data attribute `data-content-nav-id` → `data-anchor-id` | **用户侧 DOM** | 用户在目标节点上标记的属性名需要同步修改 |
| CSS 变量 `--tr-content-nav-*` → `--tr-anchor-*`（28 个） | **用户侧自定义主题** | 覆盖过这些变量的用户需要同步修改 |
| CSS 类名 `tr-content-nav-target--flash` / `tr-content-nav-target--outline` | **用户侧 targetFeedbackClass** | 如果用户使用了内置反馈类名，需要同步修改 |
| 组件标签 `<tr-content-nav>` / `<TrContentNav>` → `<tr-anchor>` / `<TrAnchor>` | **用户模板** | 所有使用该组件的模板需要修改 |
| 导出名 `ContentNav` / `TrContentNav` → `Anchor` / `TrAnchor` | **用户 import** | 所有 import 语句需要修改 |
| 所有公开类型名 `ContentNav*` → `Anchor*` | **用户 TypeScript 代码** | 引用了这些类型的代码需要修改 |

---

## 二、修改统计

| 类别 | 数量 |
|------|------|
| 目录重命名 | 3 个（组件源码、demo、e2e 测试） |
| 文件重命名 | 8 个（4 个子组件 + 1 个样式 + 1 个文档 md + 2 个 demo 消息文件不强制改名） |
| 需修改内容的源文件 | 约 28 个 |
| 类型名替换 | 约 30+ 个 |
| 函数名替换 | 约 12 个 |
| CSS 类名/变量替换 | 约 70+ 处 |
| data-testid 替换 | 约 15 处 |
| 构建产物（自动更新） | 约 6 组 |

---

## 三、重构计划与 Checklist

### Phase 1：组件核心源码重命名

> 目标：完成组件内部所有命名替换，确保编译通过。

- [ ] **1.1** 重命名目录 `packages/components/src/content-nav/` → `packages/components/src/anchor/`
- [ ] **1.2** 重命名子组件文件
  - [ ] `ContentNavItem.vue` → `AnchorItem.vue`
  - [ ] `ContentNavList.vue` → `AnchorList.vue`
  - [ ] `ContentNavOverlay.vue` → `AnchorOverlay.vue`
  - [ ] `ContentNavSearch.vue` → `AnchorSearch.vue`
- [ ] **1.3** 修改 `index.vue` — 组件名、import、类型引用
- [ ] **1.4** 修改 `index.ts` — 导出名、注册名
- [ ] **1.5** 修改 `index.type.ts` — 所有公开类型名（12 个）
- [ ] **1.6** 修改 `internal.type.ts` — 所有内部类型名（18 个）
- [ ] **1.7** 修改 `defaults.ts` — 函数名（3 个）
- [ ] **1.8** 修改 `utils/scroll.ts` — 类型名 + 函数名（7 个）
- [ ] **1.9** 修改 `utils/target.ts` — 常量名、函数名、data attribute 值、dataset key
- [ ] **1.10** 修改 4 个子组件 `.vue` 文件 — CSS 类名、data-testid、变量引用
- [ ] **1.11** 修改 5 个 composables — 类型引用、函数引用、CSS 选择器字符串

### Phase 2：样式文件重命名

- [ ] **2.1** 重命名 `content-nav.less` → `anchor.less`
- [ ] **2.2** 修改 `anchor.less` 内部 — mixin 名、CSS 变量前缀、动画名、类名
- [ ] **2.3** 修改 `index.css` — 更新 import 路径

### Phase 3：组件总入口更新

- [ ] **3.1** 修改 `packages/components/src/index.ts` — import 路径、导出名、类型导出路径

### Phase 4：验证编译

- [ ] **4.1** 执行组件库构建，确认无编译错误
- [ ] **4.2** 检查构建产物中导出名、类型名、CSS 变量名是否正确

### Phase 5：文档更新

- [ ] **5.1** 重命名文档页面 `docs/src/components/content-nav.md` → `anchor.md`
- [ ] **5.2** 修改 `anchor.md` 内容 — 标题、类型名、CSS 变量名、demo 路径、data attribute
- [ ] **5.3** 重命名 demo 目录 `docs/demos/content-nav/` → `docs/demos/anchor/`
- [ ] **5.4** 修改 `basic-source.vue` — 组件标签、import、data attribute
- [ ] **5.5** 修改 `controlled-search.vue` — 组件标签、import、data attribute、变量名
- [ ] **5.6** 修改 `basic-source.messages.ts` — 内部类型名（可选）
- [ ] **5.7** 修改 `controlled-search.messages.ts` — 内部类型名（可选）
- [ ] **5.8** 修改 `demo-shell.less` — CSS 变量名（可选）
- [ ] **5.9** 修改 `docs/.vitepress/themeConfig.ts` — 侧边栏文案和 link

### Phase 6：验证文档

- [ ] **6.1** 执行文档构建，确认无构建错误
- [ ] **6.2** 访问文档页面，确认路由、侧边栏、demo 渲染正常

### Phase 7：E2E 测试更新

- [ ] **7.1** 重命名测试目录 `packages/test/src/content-nav/` → `packages/test/src/anchor/`
- [ ] **7.2** 修改 `selectors.ts` — 常量名、类型名、所有 data-testid 值、选择器 key 名
- [ ] **7.3** 修改 `testHelper.ts` — 函数名、类型名、选择器引用、CSS 类名选择器、错误信息文案
- [ ] **7.4** 修改 `index.vue`（测试页面） — 标题、data-testid、组件引用、data attribute、feedback class
- [ ] **7.5** 修改 `index.spec.ts` — describe 名称、helper 引用、所有选择器、data attribute、CSS 类名
- [ ] **7.6** 修改 `packages/test/src/App.vue` — 路由、import、组件名、类型

### Phase 8：验证 E2E 测试

- [ ] **8.1** 启动测试应用，确认页面渲染正常
- [ ] **8.2** 执行全部 E2E 测试用例，确认 30 个测试全部通过

### Phase 9：收尾

- [ ] **9.1** 全局搜索确认无遗留的 `content-nav`、`ContentNav`、`contentNav` 引用（排除 node_modules、dist、.temp、cache）
- [ ] **9.2** 清理构建缓存，完整重新构建
- [ ] **9.3** 更新 CHANGELOG，标注破坏性变更
- [ ] **9.4** 删除本文档或标记为已完成
