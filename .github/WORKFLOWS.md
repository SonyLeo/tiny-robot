# 工作流配置指南

本仓库采用 **“双轨制”工作流策略**，以确保从 Pull Request（包括来自 Fork 仓库的 PR）进行部署时的安全性。

## 📂 工作流结构

| 文件名          | 名称               | 用途                                                                | 触发条件                                  |
| :-------------- | :----------------- | :------------------------------------------------------------------ | :---------------------------------------- |
| `pr-build.yml`  | **PR Build**       | 编译代码、运行测试、创建 NPM 预览包 (pkg.pr.new) 以及构建文档产物。 | `pull_request` (直接触发)                 |
| `pr-deploy.yml` | **Deploy Preview** | 从 `PR Build` 下载构建产物，并将文档站点部署到 Surge。              | `workflow_run` (在 `PR Build` 成功后触发) |

## 🚀 工作原理

1.  **开发者提交 PR**：

    - GitHub 触发 `pr-build.yml`。
    - 构建并发布 NPM 预览包到 `pkg.pr.new`（即时生效）。
    - 执行文档构建命令 (`pnpm build:docs`)。
    - **上传产物**：将 PR 编号 (`pr.txt`) 和构建好的站点 (`dist/`) 作为 GitHub Artifacts 上传。

2.  **构建完成**：
    - GitHub 触发 `pr-deploy.yml`。
    - **上下文**：该工作流在基础仓库的上下文中运行（因此可以安全访问 Secrets）。
    - **部署**：下载步骤 1 中的产物，使用 `SURGE_TOKEN` 将其部署到 Surge。
    - **通知**：在 PR 中自动发表评论，附上预览链接。

## 📦 产物传递 (Artifacts)

以下产物在工作流之间进行传递：

- `pr`: 包含 Pull Request 编号（用于生成唯一的预览 URL）。
- `docs`: 完整构建好的静态站点（来自 `docs/.vitepress/dist`）。

## ✅ 接下来你需要做的事 (Next Steps)

为了让这套流程能够正常工作，你需要完成以下配置：

- [ ] **获取 Surge Token**

  - 在本地终端运行 `surge token` 命令获取你的密钥。
  - 如果未安装，先运行 `npm install -g surge`。

- [ ] **配置 GitHub Secrets**

  - 进入仓库的 `Settings` -> `Secrets and variables` -> `Actions`。
  - 点击 **New repository secret**。
  - **Name**: `SURGE_TOKEN`
  - **Value**: 填入上一步获取的 Token。
  - _(Fork 用户注意)_: 如果你想在自己的 Fork 仓测试此流程，也需要在你的 Fork 仓设置中添加同样的 Secret。

- [ ] **验证流程**
  - 提交代码并推送。
  - 观察 `Actions` 页面，确认 `PR Build` 成功运行。
  - 确认 `Deploy Preview` 随后自动启动并成功部署。
  - 检查 PR 评论区是否出现预览链接。

---

## ⚡ 业界通用性能优化方案 (Advanced Optimization)

随着项目规模的增长，并行运行多个工作流或全量构建可能会导致 CI 变慢。以下是业界在 Monorepo 场景下的通用优化与扩展方案，可供后续升级参考：

### 1. 引入增量构建系统 (Recommended: Nx)

目前项目采用全量构建模式。鉴于我们作为开源项目的特性，业界最佳实践是引入 **[Nx](https://nx.dev/)**。Nx 不仅能提供缓存加速，还能作为强大的 Monorepo 管理工具。

#### 核心优势

- **开源免费**: Nx Cloud 为公共仓库提供**无限额度的免费远程缓存**。
- **智能缓存**: 一次构建，全员复用。CI 或队友构建过的 Commit，你可以直接秒级下载产物。
- **按需测试**: 仅测试 PR 影响的包，而非整个仓库。

#### 🛠️ 安装与迁移 (Installation)

在根目录运行以下命令，Nx 会自动扫描 `package.json` 并配置工作区：

```bash
npx nx@latest init
```

- **Setup**: 脚本会询问是否开启 Remote Caching（推荐选 Yes 以享受免费云缓存）。
- **Result**: 生成 `nx.json` 配置文件。

#### 💻 常用指令 (Usage)

引入后，你可以使用更高效的命令替代传统的 `pnpm -r`：

1.  **并行执行所有任务** (替代全量构建):
    ```bash
    # 并行构建所有项目，自带缓存
    npx nx run-many -t build
    ```
2.  **仅执行受影响的任务** (PR 神器):
    ```bash
    # 自动分析当前分支修改了哪些包，只构建/测试这些包及其依赖
    npx nx affected -t build,test --base=main
    ```
3.  **构建单个项目**:
    ```bash
    npx nx build @opentiny/tiny-robot
    ```

#### 🌟 最佳实践 (Best Practices)

1.  **CI 集成**: 在 `pr-build.yml` 中使用 `nx affected -t build,test --base=main` 替代全量 `pnpm build`，显著降低 CI 耗时。
2.  **可视化依赖**: 运行 `npx nx graph` 可以生成可交互的依赖关系图，帮助新贡献者理解项目结构。
3.  **远程缓存**: 确保在 CI 和本地开发环境中都启用了 Nx Cloud，实现“一人构建，全员加速”的效果。

### 2. ID 自动取消 (Auto Cancellation)

已在我们配置中实现（`concurrency` 字段）。

- **原理**: 当开发者连续快速提交两次代码时，系统会自动取消前一次正在运行的旧构建。这能显著减少 CI 排队堵塞的情况，节省资源。

### 3. 任务分片 (Test Sharding)

针对耗时的 E2E 测试，可以使用 GitHub Actions 的 `matrix` 功能。

- **原理**: 将 100 个测试用例拆分到 4 台机器上并行运行（如 `shard 1/4`, `shard 2/4`...），总耗时理论上可减少至 1/4。Playwright 原生支持此功能。

### 4. 依赖缓存优化

目前我们已配置 `pnpm-store` 缓存。

- **进阶**: 如果依赖安装依然很慢，可以考虑开启 GitHub Actions 自带的 Dependency Caching 功能（`setup-node` 的 `cache: 'pnpm'` 选项），甚至将常用依赖预打包到自定义 Docker 镜像中。
