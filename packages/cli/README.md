# @opentiny/tiny-robot-cli

A lightweight CLI for scaffolding TinyRobot-based product projects.

## Usage

```bash
npx @opentiny/tiny-robot-cli create my-app
pnpm dlx @opentiny/tiny-robot-cli create my-app

// TODO - add chat(添加 TrChat 到用户工程) 修改用户内容前声明做哪些更改，要不要去做。生成后也要提示后续操作，到完全可用
//  npx @opentiny/tiny-robot-cli add chat
// 1. 勾选 .env .main.ts package.json（追加） TrRobot.vue （新增） (说明具体的用途) 默认勾选
// 2. 提示把 TrRobot.vue 更新引用到业务组件
// 3. 根据 package.json 是否变动提示更新依赖

// 增强：monorepo 项目不应该是根目录的 package.json. 让用户去选添加到哪个子项目

```

## Options

- `-t, --template <name>`: template name, currently supports `basic`, `assistant-panel`
- `-h, --help`: show help

## Commands

- `create [project-name]`: scaffold a full project from template
- `add chat`: add `TrChat` minimal setup into the current project, including package dependencies and `src/tiny-robot/chat.ts`

## Template Documentation

Template-specific features and environment variables are documented in each template directory, for example:

- `packages/cli/templates/basic/README.md`
- `packages/cli/templates/assistant-panel/README.md`
