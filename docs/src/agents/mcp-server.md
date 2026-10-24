---
title: MCP Server
kind: agent-doc
description: 了解 TinyRobot 文档 MCP Server 的用途、计划能力和当前提供状态。
status: planned
keywords: [MCP Server, Model Context Protocol, Agent]
---

# MCP Server

> 通过 MCP，AI 助手可以在对话中按需查找 TinyRobot 的组件说明、使用方法和代码示例。

::: warning 暂未提供
TinyRobot 文档 MCP Server 目前尚未实现，也没有可连接的服务。以下内容介绍的是计划提供的体验，不代表这些能力现在已经可用。
:::

## MCP Server 能做什么？

MCP（Model Context Protocol）是一种让 AI 助手连接外部工具和内容的开放协议。文档 MCP Server 计划为支持 MCP 的 AI 助手提供一个直接查询 TinyRobot 文档的入口。

完成后，开发者可以在原有的 AI 工作流程中提出 TinyRobot 相关问题，由助手按需获取有用的资料，而不必先手动查找并复制整篇文档。

## 计划支持的场景

未来的文档 MCP Server 计划支持：

- 按组件名称、功能或使用场景查找相关文档；
- 查询组件的用途、配置方式和代码示例；
- 获取与当前问题相关的文档内容，帮助助手给出更有依据的回答；
- 在编写代码时查找适用的示例，减少无关信息对话的干扰。

这些能力将在服务实现后逐项确认并在此页更新。

## 与应用中的 MCP 功能有什么区别？

TinyRobot 组件和运行时提供的 MCP 相关能力，面向的是应用开发中的连接、配置或管理需求。这里介绍的文档 MCP Server 则计划供 AI 助手查询 TinyRobot 自身的文档和示例。

两者面向不同的使用场景：一个用于构建具备 MCP 能力的应用，另一个用于帮助 AI 助手理解 TinyRobot 的开发资料。

## 现在如何查阅 TinyRobot 文档？

文档 MCP Server 尚未提供时，你仍可以直接浏览 TinyRobot 文档站，查找所需组件、指南和代码示例。也可以把相关页面提供给 AI 助手，请它依据文档内容协助解答或编写代码。

当 MCP Server 实现并开放后，本页会补充已提供的查询能力、支持的 AI 工具及接入说明。
