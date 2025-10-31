# pkg.pr.new 使用指南

## 概述

项目已配置 pkg.pr.new，为每个 PR 提供三种预览方式。

## 工作流程

### 1. 创建 PR
提交代码并创建 Pull Request

### 2. 自动发布（即时）
pkg.pr.new bot 自动在 PR 评论中提供：
- 📦 包安装命令
- 🔗 StackBlitz 在线预览链接

### 3. 三种预览方式

#### 方式 1：StackBlitz 在线预览（推荐 - 即时）
**触发：** 自动生成，点击 PR 评论中的 "Open in StackBlitz" 链接

**特点：**
- ✅ 即时打开，无需等待
- ✅ 可以在线修改代码测试
- ✅ 无需本地环境
- ✅ 适合快速验证组件功能

**使用场景：**
- 快速测试新组件
- 验证 API 变更
- 检查样式修改

#### 方式 2：完整文档预览（手动 - 3-5分钟）
**触发：** 在 PR 评论区回复 `/deploy-docs`

**特点：**
- 📚 完整的 VitePress 文档站点
- 🎮 包含 Playground 演示
- 📖 包含所有组件文档和示例
- 🔍 适合全面检视

**使用场景：**
- 查看完整文档效果
- 检查文档更新
- 演示复杂功能

#### 方式 3：包安装测试（手动）
**触发：** 使用 PR 评论中的安装命令

**特点：**
- 🔧 在本地项目中测试
- 🧪 验证集成效果
- 📦 真实的包使用体验

**使用场景：**
- 集成测试
- 性能测试
- 兼容性验证

## 预览方式对比

| 特性 | StackBlitz | 文档预览 | 包安装 |
|------|-----------|---------|--------|
| 触发方式 | 自动 | `/deploy-docs` | 手动安装 |
| 等待时间 | 即时 | 3-5 分钟 | 取决于网络 |
| 可编辑 | ✅ 在线编辑 | ❌ 只读 | ✅ 本地编辑 |
| 环境要求 | 无 | 无 | 需要本地环境 |
| 适用场景 | 快速测试 | 完整演示 | 集成测试 |

## 推荐使用流程

1. **初步检视** → 使用 StackBlitz 快速验证
2. **详细检视** → 需要时使用 `/deploy-docs` 查看完整文档
3. **深度测试** → 使用包安装进行集成测试

## 维护

### 更新 StackBlitz 模板

编辑 `.pkg-pr-new/template/src/App.vue` 来更新默认示例：

```vue
<script setup lang="ts">
import { TinyBubble } from '@opentiny/tiny-robot'
</script>

<template>
  <div class="app">
    <h1>TinyRobot Preview</h1>
    <TinyBubble role="assistant" content="测试内容" />
  </div>
</template>
```

**原则：** 保持示例简洁，只展示最基础的用法。
