# Tiny Robot 测试

这是 Tiny Robot 组件库的测试项目，使用 Playwright 覆盖 E2E 与 Component Testing。

## 功能特性

- ✅ 基于 Playwright 的 E2E 测试
- ✅ 基于 Playwright Component Testing 的 `TrMarkdown` 单组件契约测试
- Chromium 是默认测试项目；可选 WebKit CT 单独验证浏览器兼容边界
- ✅ 包含完整的 Container 组件测试用例
- ✅ 支持 CI/CD 集成
- ✅ 提供测试报告和调试功能

## 快速开始

### 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 启动测试应用

```bash
# 在 packages/test 目录运行
cd packages/test
pnpm dev
```

应用默认将在 http://127.0.0.1:3341 启动；如需覆盖，可设置 `TINY_ROBOT_TEST_PORT`。
Playwright 配置会自动为 `127.0.0.1` / `localhost` 补充 `NO_PROXY`，避免本地代理把 webServer 探活误判为可用服务。

### 在 packages/test 目录运行

```bash
cd packages/test
```

> 本地非 CI 默认通过 Playwright 的 `channel: 'chrome'` 直接使用系统 Chrome。
> 只有在需要 bundled browser / CI 环境时，才需要额外安装 Playwright 浏览器。

```bash
# 仅安装chromium
npx playwright install chromium
```

```bash
# 仅安装chromium shell及 系统依赖
npx playwright install --with-deps --only-shell chromium
```

### 运行测试

```bash
pnpm test
```

### 运行 Component Testing

```bash
pnpm test:ct
```

### 运行 Component Testing UI

```bash
pnpm test:ct:ui
```

### 运行带界面的测试

```bash
pnpm test:ui
```

### 运行可见浏览器模式

```bash
pnpm test:headed
```

### 运行调试模式

```bash
pnpm test:debug
```

### 查看测试报告

```bash
pnpm test:report
```

### WebKit Component Testing

WebKit CT 是一个 opt-in 验证通道，使用独立的端口、缓存、测试产物和报告目录：

```bash
pnpm exec playwright test -c playwright-ct.webkit.config.ts
```

也可以将同一配置传给单个测试文件或标题筛选。报告位于
`.cache/playwright-ct-webkit/report`，可用以下命令查看：

```bash
pnpm exec playwright show-report .cache/playwright-ct-webkit/report
```

在 WebKit 26.5 + Playwright 1.62.0 下，`tr-markdown-code-html.spec.ts` 当前预期为 7 项通过、1 项失败：失败只发生在 Shiki full code transformer 的 `.shiki .line.diff.add` 断言。代码仍然正确渲染，但 `[!code ++]` 作为普通注释保留；Chromium 的同一用例通过。Shiki 2.5 的原生 JavaScript regex engine 在独立语料中可转换该标记，因而现有证据只定位到 WebKit 与 Shiki notation transformer 的组合差异，不能据此修改组件行为或将失败静默掉。键盘横向滚动用例应继续通过。

## 调试指南

### 本地调试

1. **使用调试模式**：

   ```bash
   pnpm test:debug
   ```

2. **使用可见浏览器模式**：

   ```bash
   pnpm test:headed
   ```

3. **使用 UI 模式**：
   ```bash
   pnpm test:ui
   ```

### 测试失败调试

1. 查看生成的截图和视频（在 `test-results` 目录）
2. 查看 trace 文件（可在 Playwright 报告中查看）
3. 使用 `--debug` 模式单步调试

### 编写新测试

#### 简单3步法

**第一步：创建测试文件**

```bash
# 在 src/your-component/ 目录下创建测试文件
touch src/your-component/yourComponent.spec.ts
```

**第二步：编写基本测试**

```typescript
// src/your-component/yourComponent.spec.ts
import { test, expect } from '@playwright/test'

test.describe('组件名称测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-component-page')
  })

  test('主要功能测试', async ({ page }) => {
    // 找到测试元素
    await page.click('[data-testid="test-button"]')

    // 验证结果
    await expect(page.locator('[data-testid="result"]')).toBeVisible()
  })
})
```

**第三步：运行测试**

```bash
# 运行单个测试文件
pnpm playwright test src/your-component/yourComponent.spec.ts

# 或者运行所有测试
pnpm test
```

#### 核心要点

- 📍 使用 `data-testid` 属性标识测试元素
- ⏱️ 使用 `await` 等待异步操作完成
- ✅ 使用 `expect()` 进行断言验证
- 🔄 每个测试用例保持独立

## 最佳实践

1. **使用语义化的测试标识符**：优先使用 `data-testid` 属性
2. **等待异步操作**：使用 `await expect()` 等待元素状态变化
3. **独立的测试用例**：每个测试应该独立，不依赖其他测试的状态
4. **清晰的测试描述**：使用中文描述测试用例的目的
5. **合理的测试粒度**：既要覆盖主要功能，又要避免过度测试

## Markdown 测试分层

`TrMarkdown` 的单组件契约优先写在 `src/markdown-ct`：

- 静态渲染、props、feature flags、custom components、context 更新使用 CT。
- Code / HTML Preview / Math / Mermaid / Video / Image Gallery 使用 CT。
- Streaming 的 incomplete hold、summary telemetry、rewrite/reset 使用 CT。
- E2E `src/markdown/index.spec.ts` 只保留 demo 页面、Bubble 集成、HTML Preview iframe、animated streaming 的 smoke。

新增 markdown 能力时，默认先补 CT；只有涉及真实页面导航、Bubble 组合、iframe 集成或跨组件 wiring 时再补 E2E。

## 故障排除

### 常见问题

1. **测试超时**：检查网络连接和应用启动时间
2. **元素找不到**：确认 `data-testid` 属性正确设置
3. **测试不稳定**：使用 Playwright 的等待机制而不是固定延时

### 性能优化

1. 使用 `test.describe.configure({ mode: 'parallel' })` 并行运行测试
2. 合理设置超时时间
3. 只在必要时保存截图和视频
