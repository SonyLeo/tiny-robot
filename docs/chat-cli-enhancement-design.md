# Chat CLI 增强设计文档

> 版本：v2.0 | 日期：2026-03-07 | 状态：已重构

## 目录

- [一、需求分析与核心定位](#一需求分析与核心定位)
- [二、CLI 交互设计](#二cli-交互设计)
- [三、Agent Skills (agentskills.io) 集成设计](#三agent-skills-agentskillsio-集成设计)
- [四、优雅的多模型互配设计](#四优雅的多模型互配设计)
- [五、安全性声明](#五安全性声明)
- [六、未来演进路线 (Roadmap)](#六未来演进路线-roadmap)

---

## 一、需求分析与核心定位

### 1.1 核心定位

`@opentiny/tiny-robot-chat-cli` 的核心定位是**纯前端的 AI 对话脚手架**。我们致力于为开发者提供开箱即用的、极具现代感和交互美感的客户端聊天 UI 底座。

**核心指导原则：**
- **重客户端交互，轻服务端逻辑**：不集成任何绑定特定后端的繁重逻辑（如 DB、Auth、RAG）。
- **拥抱标准化**：紧跟 2025 年业界最前沿的 AI 范式（兼容 OpenAI 协议、支持 [Agent Skills](https://agentskills.io) 降级实现）。
- **最小化维护成本**：摒弃多模板策略，集中精力打造一个极致灵活的 Basic 模板。

### 1.2 废弃的历史设计说明

基于上述原则，我们在 v2.0 设计中正式**废弃**了以下偏离定位的设计：

| 废弃的设计 | 废弃原因 |
| --- | --- |
| `createUnifiedProvider` | 目前业界主流大模型皆兼容 OpenAI API 格式，直接复用底层 `createOpenAIProvider` 并修改 `baseURL` 即可，二次封装纯属冗余。 |
| 多模板策略 | `with-auth`、`with-rag`、`enterprise` 超出纯前端范畴；`with-history` 的 LocalStorage 能力已内置，双模板增加维护成本。 |
| 繁杂的 CLI 问答 | 过度繁杂的 CLI 步骤会阻力用户的心流，借鉴 `create-vite`，交互步骤应压缩到极致。 |

---

## 二、CLI 交互设计

现代 CLI 工具的最佳实践是“少即是多”。我们将交互步骤严格限制在 3 步以内。

### 2.1 极简的终端交互流程

```bash
$ npx create-tiny-robot@latest my-ai-app

┌  Create Tiny Robot App
│
◇  Select a default AI Provider
│  ● OpenAI Compatible (推荐, 覆盖 DeepSeek / Qwen / 通用中转)
│  ○ Anthropic (Claude)
│
◇  Enable Agent Skills support? (agentskills.io standard)
│  ● Yes  ○ No
│
◆  Scaffolding project in ./my-ai-app...
│
└  Done! 🎉

👉 Next steps:
   cd my-ai-app
   cp .env.example .env (并填入你的 API Key)
   npm install
   npm run dev
```

通过这一流程，开发者只需数秒即可获得一个完整的项目脚手架。所有的细节配置（模型名称、端点 URL 等）全部后置到 `.env` 环境变量中去修改。

---

## 三、Agent Skills (agentskills.io) 集成设计

我们在模板中内置对 **[agentskills.io](https://agentskills.io)** 开放协议模式的**前端运行态轻量级兼容**，这是我们在业界前端 UI 模板中打出的绝对差异化底牌。

### 3.1 目录结构与 Progressive Disclosure

如果用户在 CLI 阶段勾选了支持 Agent Skills，生成的工程中将带有 `src/skills` 目录：

```text
my-ai-app/
├── src/
│   ├── skills/              <-- 预留 Skills 目录
│   │   ├── code-reviewer/
│   │   │   └── SKILL.md     <-- 支持 YAML Frontmatter 解析
│   │   └── translator/
│   │       └── SKILL.md
│   ├── composables/
│   │   └── useAgentSkills.ts <-- 解析 Skills 的钩子函数
│   └── App.vue
```

### 3.2 运转流程机制

1. **Discovery (发现阶段)**：
   借助 Vite 的构建能力 `import.meta.glob('./skills/*/SKILL.md', { as: 'raw' })`，我们的 `useAgentSkills.ts` 会在前端解析出所有 `SKILL.md` 头部的 YAML Frontmatter。提取 `name`、`description` 等元数据。
2. **UI 渲染**：
   在界面的侧边栏或 Header 中渲染出一个“角色/技能列表”。
3. **Activation (激活与流转)**：
   当用户点击激活某个 Skill 时，将该 Skill 完整的 Markdown Body 提取出来，作为 `systemPrompt` 或附加提示，伴随对话传递给底层大模型。
   
**带来的收益：** 用户可以像管理文件一样管理不同的人设工作流，获得类似 Claude Projects / ChatGPT GPTs 的绝佳使用体验，而这一切全凭本地纯前端实现。

---

## 四、优雅的多模型互配设计

为了解决多模型随时切换的痛点，我们不在抽象层做大刀阔斧的重构，而是通过**环境变量配置集 + 前端 UI 动态切换**来优雅降级。

### 4.1 约定 `.env` 配置

在生成的模板中提供清晰的多模型参数范例：

```env
# .env
VITE_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"

# 支持前端下拉框随时切模型
VITE_AVAILABLE_MODELS="gpt-4o,deepseek-chat,qwen-max"
VITE_BASE_URL="https://api.openai.com/v1" # 支持兼容 OpenAI 格式的服务商端点
```

### 4.2 UI 层面的 Model Selector

我们将在模板生成的 `Header` 区域提供一个下拉菜单（Model Selector 组件）：

- 读取 `import.meta.env.VITE_AVAILABLE_MODELS` 字符串进行解析。
- 在用户下拉切换时，通过框架提供的 `updateResponseProvider` 方法，动态构建针对目标模型的新 Provider 实例。

```vue
<!-- 伪代码演示 App.vue 层面的处理 -->
<script setup>
import { ref } from 'vue'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'

const currentModel = ref('gpt-4o')
const availableModels = import.meta.env.VITE_AVAILABLE_MODELS.split(',')

const provider = computed(() => {
  return createOpenAIProvider({
    apiKey: import.meta.env.VITE_API_KEY,
    baseURL: import.meta.env.VITE_BASE_URL,
    model: currentModel.value
  })
})
</script>
```
这种做法符合 Vue 的数据流转哲学，规避了为了适配模型而编写繁琐的后端适配器层。

---

## 五、安全性声明

**纯前端存储 API Key 的局限性与免责声明**

作为纯浏览器端的前端模板项目：
1. **绝不使用自欺欺人的“伪加密”**：我们不会使用 `btoa()` 等伪加密手段混淆用户的 API Key，这会给予初学者虚假的安全感。
2. **坦诚的透明度**：模板内将会显式提供警告标语，提醒用户：“**此纯前端示例仅供本地开发试用。部署到生产环境时请务必使用后端 BFF / 代理层来遮盖关键的 API Key 和 Base URL。**”

---

## 六、未来演进路线 (Roadmap)

我们专注提升前端对话框的交互生态体验，未来的探索核心锁定在：

*   🚀 **Phase 1: Basic 模板与 Agent Skills 解析生态**（当前阶段）
    *   完成 CLI 底座。
    *   集成 `agentskills.io` 纯前端加载与解析 Demo。
    *   动态多模型选择 UI 配置体验。

---

## 七、模型选择能力的分层设计（Phase 1 实现方案）

### 7.1 架构决策

模型选择能力**不放入 `@opentiny/tiny-robot-chat` 组件包**，原因如下：

- chat 包面向所有业务场景，不应感知 `.env` 环境变量约定
- 不同模板的 ModelSelector UI 形态可能不同（下拉、命令面板、侧边栏列表）
- chat 包已通过 `TrChatHeader` 的 `#extra` slot 提供了足够的扩展点

模型选择能力以 **`_shared` 共享层**的形式存在于 CLI 脚手架的模板目录中，在生成项目时 merge 进各模板，源头只维护一份。

### 7.2 脚手架目录结构

```text
create-tiny-robot/
└── templates/
    ├── _shared/                          ← 所有模板共享，不直接生成为项目
    │   ├── components/
    │   │   └── ModelSelector.vue         ← UI 组件（纯展示壳）
    │   └── composables/
    │       └── useModelSelector.ts       ← 核心业务逻辑
    ├── basic/                            ← Phase 1 Basic 模板
    │   ├── src/
    │   │   └── App.vue
    │   ├── .env.example
    │   └── ...
    ├── with-tools/                       ← Phase 2
    └── with-vision/                      ← Phase 3
```

生成项目时，脚手架将 `_shared/` 内容合并到 `src/components/` 和 `src/composables/` 中，每个生成出来的项目都是完整独立的。

### 7.3 核心实现

**`_shared/composables/useModelSelector.ts`**

```ts
import { ref, watch } from 'vue'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import type { UseChatKitReturn } from '@opentiny/tiny-robot-chat'

export function useModelSelector(chatKit: UseChatKitReturn) {
  // 从环境变量解析可用模型列表，降级为空数组
  const models = (import.meta.env.VITE_AVAILABLE_MODELS ?? '').split(',').filter(Boolean)
  const currentModel = ref(models[0] ?? '')

  // 切换模型时重建 provider，immediate 确保初始化时也生效
  watch(
    currentModel,
    (model) => {
      if (!model) return
      chatKit.updateResponseProvider(
        createOpenAIProvider({
          apiKey: import.meta.env.VITE_API_KEY,
          baseURL: import.meta.env.VITE_BASE_URL,
          model,
        }),
      )
    },
    { immediate: true },
  )

  return { models, currentModel }
}
```

**`_shared/components/ModelSelector.vue`**

```vue
<script setup lang="ts">
// 纯 UI 壳，不含任何业务逻辑
defineProps<{
  models: string[]
}>()

const currentModel = defineModel<string>()
</script>

<template>
  <select v-model="currentModel" class="tr-model-selector" aria-label="选择模型">
    <option v-for="model in models" :key="model" :value="model">
      {{ model }}
    </option>
  </select>
</template>
```

> 实际样式使用 `@opentiny/tiny-robot` 的 Select 组件替换，此处为结构示意。

**`basic/src/App.vue` 中的接入方式**

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import { useChatKit } from '@opentiny/tiny-robot-chat'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import ModelSelector from './components/ModelSelector.vue'
import { useModelSelector } from './composables/useModelSelector'

const chatKit = useChatKit({
  responseProvider: createOpenAIProvider({
    apiKey: import.meta.env.VITE_API_KEY,
    baseURL: import.meta.env.VITE_BASE_URL,
    model: import.meta.env.VITE_AVAILABLE_MODELS?.split(',')[0] ?? '',
  }),
})

// 模型选择逻辑完全收敛在 composable 中
const { models, currentModel } = useModelSelector(chatKit)
</script>

<template>
  <TrChat :chat-kit="chatKit">
    <template #header-extra>
      <!-- 通过 TrChatHeader 的 #extra slot 注入，chat 包无感知 -->
      <ModelSelector v-model="currentModel" :models="models" />
    </template>
  </TrChat>
</template>
```

### 7.4 `.env.example` 配置

```env
# 必填：API Key
VITE_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"

# 必填：兼容 OpenAI 格式的服务商端点
VITE_BASE_URL="https://api.openai.com/v1"

# 逗号分隔的可用模型列表，第一个为默认选中项
# 支持任意兼容 OpenAI 格式的模型名称
VITE_AVAILABLE_MODELS="gpt-4o,deepseek-chat,qwen-max"
```

### 7.5 后续模板复用方式

Phase 2 / Phase 3 新增模板时，脚手架直接将 `_shared/` 合并进新模板，无需任何额外改动。各模板可以：

- 直接使用默认的 `ModelSelector.vue` UI
- 替换为自己的 UI 实现，但复用 `useModelSelector.ts` 的逻辑
- 完全自定义，`useModelSelector` 的 composable 接口保持稳定

---

*   🛠 **Phase 2: with-tools (基础工具链)**
    *   未来支持无后端的浏览器内置 Tools 演示 (如基于 navigator API 获取地理位置、获取客户端时间戳、轻量级 Web Search 代理)。
    *   提供引导向 MCP (Model Context Protocol) 的整合指引。
*   👁 **Phase 3: with-vision (多模态视觉处理)**
    *   前端支持拖拽上传图片文件。
    *   自动处理长边压缩及 base64 转换后推入模型，展现纯前端完成大模型多模态解析的最佳实践。