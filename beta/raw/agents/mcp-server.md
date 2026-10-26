---
title: MCP Server
kind: agent-doc
description: 在本地 AI 助手中查询 TinyRobot 组件、文档和示例。
status: available
keywords: [MCP Server, Model Context Protocol, Agent]
---

# MCP Server

> 在支持 MCP 的 AI 助手中搜索 TinyRobot 文档，并按需读取组件说明和示例。

::: tip 当前提供方式
TinyRobot 文档 MCP Server 已可在本地运行。它读取本地生成的文档索引、Markdown 和示例；目前没有托管的远程服务地址。
:::

## 可以做什么？

连接后，AI 助手可以：

- 搜索文档页面和公开组件；
- 获取组件目录信息和组件文档；
- 按章节读取文档，并在内容较长时继续读取后续部分；
- 读取文档示例和迁移指南；
- 查看每条结果对应的文档来源。

服务只查询构建后的公开文档内容，不访问当前项目代码，也不执行示例代码。

## 本地启动

在 TinyRobot 仓库根目录安装依赖并生成文档产物：

```sh
pnpm install
pnpm -F docs agent:catalog
pnpm -F docs agent:build
```

服务需要 Node.js 18 或更高版本。MCP 客户端启动配置应从 TinyRobot 仓库根目录运行：

```sh
pnpm -F @opentiny/tiny-robot-docs-mcp start
```

stdio MCP 客户端会管理服务进程。不要在终端单独启动后再填写 HTTP 地址；当前没有远程 endpoint。

## 在 Codex 中使用

将服务注册到 Codex。把示例中的仓库路径替换成 TinyRobot 在本机的实际位置：

```sh
codex mcp add tiny-robot-docs -- pnpm --dir "D:\path\to\tiny-robot" -F @opentiny/tiny-robot-docs-mcp start
```

然后重启 Codex。服务使用该仓库最新一次生成的 `docs/dist` 产物；文档更新后，先执行 `pnpm -F docs agent:catalog`，再执行 `pnpm -F docs agent:build` 刷新可查询内容。

### 用 fork Beta 文档进行演示

评审演示可以让本地 MCP 服务读取 fork Beta 对应的本地构建快照。先从 Beta 部署使用的提交检出 TinyRobot 仓库，在仓库根目录按该 fork 的站点地址依次运行 `pnpm -F docs agent:catalog` 和 `pnpm -F docs agent:build`；构建完成后，确认 `docs/dist/agent/manifest.json` 中的 `docsVersion` 为 `beta`，`publicBaseUrl` 指向 fork Beta 地址。将下面配置中的两个本地路径替换为实际路径：

```sh
codex mcp add tiny-robot-docs-beta --env "DOCS_MCP_CATALOG_DIR=D:\path\to\beta\docs\dist" -- pnpm --dir "D:\path\to\tiny-robot" -F @opentiny/tiny-robot-docs-mcp start
```

此配置让工具从本地快照搜索和读取内容，查询结果中的 Markdown 与 Demo 来源链接仍指向 fork Beta 网站。它不会在每次查询时联网抓取，也不会因此变成远程 MCP 服务；Beta 更新后需重新生成本地快照并重启 MCP 服务，才能查到更新内容。

## 可用查询

连接后可通过工具搜索文档和组件、读取组件元数据、按页或章节读取文档、获取示例，以及查阅迁移指南。也可以通过 MCP Resources 浏览页面、组件、示例和迁移指南目录。

组件搜索优先匹配组件名称和别名，其次匹配页面标题、关键词与说明；示例文件路径不参与组件搜索，减少无关命中。文档搜索还会检索页面 Markdown 正文，支持 API 标识符和中文描述，并返回命中章节及摘要。每次读取有长度上限；较长页面或代码示例会返回继续读取的位置。

本地构建没有公开站点地址时，查询结果会返回文档路由和 raw 文件路径，不会生成本机 `localhost` 链接。构建时配置了公开文档地址后，结果会附上对应部署路径下的可访问链接。目录 Resources 只包含查找所需的摘要信息，完整文档和代码通过对应工具按需读取。

## 与应用中的 MCP 功能有什么区别？

TinyRobot 组件和运行时中的 MCP 能力，服务于应用开发中的连接、配置或管理流程。本文介绍的 MCP Server 则为 AI 助手提供 TinyRobot 自身的文档和示例查询，两者用途不同。

## 远程服务

目前没有公开托管的 MCP 服务地址。是否提供远程连接及其部署方式，将在本地验证和方案评审后确定。
