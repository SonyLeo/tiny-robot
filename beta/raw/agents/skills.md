---
title: Skills
kind: agent-doc
description: 为编码助手安装 TinyRobot Skill，获取组件使用建议和 Vue 示例指导。
status: stable
keywords: [Agent Skills, TinyRobot Skill, Vue]
---

# Skills

> TinyRobot Skill 可以帮助编码助手更准确地理解 TinyRobot 项目，并在编写 Vue 代码时参考相应的组件用法和示例。

## Skill 可以帮你做什么？

为编码助手安装 TinyRobot Skill 后，它可以在处理 TinyRobot 相关任务时：

- 根据需求帮助选择合适的组件或功能；
- 结合组件文档和示例，说明如何配置和使用；
- 在编写 Vue 示例时补充必要的导入和使用前提；
- 对文档没有说明的 API 明确指出信息不足，而不是臆测不存在的属性或行为；
- 协助理解、编写和调整基于 TinyRobot 的聊天界面与交互代码。

Skill 为编码助手提供 TinyRobot 相关的工作指引。组件的具体用法和示例仍以 TinyRobot 文档为准。

## 安装

请先确认你使用的编码助手支持以下安装方式。

### 使用 Skills CLI

Skills CLI 可用于将 TinyRobot Skill 安装到支持该格式的编码助手：

```bash
npx skills add opentiny/agent-skills --skill tiny-robot-skill
```

如果需要指定目标编码助手，可以根据 Skills CLI 的说明追加 `--agent` 参数。

### 在 Codex 中安装

在 Codex 对话中调用内置的 `$skill-installer`，并提供 TinyRobot Skill 的仓库地址：

```text
$skill-installer 请从 https://github.com/opentiny/agent-skills/tree/main/skills/tiny-robot-skill 安装 TinyRobot Skill。
```

Codex 会从该仓库目录获取 Skill 并安装到本机。若安装后尚未出现在可用 Skill 中，可重新启动 Codex 再试。

## 开始使用

安装完成后，直接描述你希望完成的 TinyRobot 任务即可。例如：

> 请用 TinyRobot 的 Bubble 和 Sender 组件实现一个简单的聊天界面。先说明需要哪些组件，再给出包含导入语句的 Vue 示例。

也可以让编码助手解释现有代码、调整组件配置，或根据文档示例补充交互。若它找不到对应 API 或示例，可以让它说明缺少的资料，再根据文档站中的组件说明继续确认。

## 使用建议

- 尽可能说明你正在使用的组件、期望的交互和项目环境；
- 对涉及具体 API 的回答，要求编码助手给出对应的文档或示例依据；
- 生成代码后，仍应在自己的项目中检查导入路径、依赖和运行效果；
- 如果当前编码助手不支持 Skills 或对应安装方式，可直接查阅 TinyRobot 文档并把相关内容提供给它。
