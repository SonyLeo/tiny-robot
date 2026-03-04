# Skills Kit 设计方案

> 版本：v1.0 | 日期：2026-03-04 | 状态：设计中

---

## 一、设计原则

### 1.1 架构定位

Skills Kit 采用**分层设计**，遵循现有项目的架构模式：

```
┌─────────────────────────────────────────┐
│  Layer 3: 模板层                         │
│  with-skills 模板（实现具体逻辑）        │
├─────────────────────────────────────────┤
│  Layer 2: 套件层                         │
│  ChatKit 中引用 TrSkills                │
├─────────────────────────────────────────┤
│  Layer 1: UI 组件层                      │
│  TrSkills（@opentiny/tiny-robot）       │
└─────────────────────────────────────────┘
```

### 1.2 设计哲学

- **纯 UI 组件**：`TrSkills` 只负责展示和交互，零业务逻辑
- **对标 TrSender**：命名、props、events、slots 风格保持一致
- **模板实现逻辑**：具体的 skills 发现、加载、注入由模板实现
- **高度可复用**：不同模板可以有不同的逻辑实现

### 1.3 对标现有模式

```
TrSender（UI 组件）
  ↓ 在 chat-kit 中包装为 ChatKitSender
  ↓ 在模板中使用，实现具体逻辑

TrSkills（UI 组件）← 新增
  ↓ 在 chat-kit 中包装为 ChatKitSkills
  ↓ 在 with-skills 模板中使用，实现具体逻辑
```

---

## 二、TrSkills 组件设计

### 2.1 组件位置

```
packages/tiny-robot/src/components/
├── Bubble/
├── Sender/
├── Attachments/
├── History/
├── Skills/                    ← 新增
│   ├── TrSkills.vue
│   ├── TrSkillCard.vue       ← 可选，skill 卡片子组件
│   └── index.ts
└── ...
```

### 2.2 Skill 类型定义

Skill 接口定义在 TrSkills.vue 中（详见第 2.5 节），包含以下字段：

```ts
export interface Skill {
  // 基础信息
  id: string                    // 唯一标识
  name: string                  // 名称
  description: string           // 描述
  tags: string[]                // 标签

  // 内容
  content?: string              // skill 的完整指令内容

  // 来源信息（支持扩展）
  source?: 'local' | 'remote' | string
  sourceUrl?: string

  // 版本和元数据
  version?: string
  author?: string
  createdAt?: number
  updatedAt?: number

  // 依赖和兼容性
  dependencies?: string[]
  minVersion?: string

  // 扩展字段
  metadata?: Record<string, any>
}
```

### 2.3 Props 设计

```ts
interface TrSkillsProps {
  // 数据
  skills: Skill[]               // 必须

  // 显示模式
  mode?: 'panel' | 'dropdown' | 'inline'  // default: 'panel'
  maxDisplay?: number           // 最多显示多少个，default: 10

  // 交互
  searchable?: boolean          // 是否显示搜索框，default: true
  selectable?: boolean          // 是否可选择，default: true
  multiple?: boolean            // 是否多选，default: true

  // 样式
  size?: 'small' | 'medium' | 'large'  // default: 'medium'
}
```

### 2.4 Events 设计

```ts
interface TrSkillsEmits {
  // 选择 skill 时触发
  select: [skill: Skill]
  
  // 加载 skill 时触发（用户点击"加载"按钮或其他操作）
  load: [skill: Skill]
}
```

### 2.5 Slots 设计

```vue
<!-- 自定义 skill 卡片 -->
<template #skill="{ skill, isSelected, onSelect }">
  <div @click="onSelect">{{ skill.name }}</div>
</template>

<!-- 自定义搜索框 -->
<template #search="{ query, onSearch }">
  <input @input="e => onSearch(e.target.value)" />
</template>

<!-- 空状态 -->
<template #empty>
  <div>No skills available</div>
</template>
```

### 2.6 完整实现

```vue
<!-- packages/tiny-robot/src/components/Skills/TrSkills.vue -->
<template>
  <div class="tr-skills" :class="`mode-${mode} size-${size}`">
    <!-- 搜索框 -->
    <slot name="search" :query="query" :on-search="handleSearch">
      <input
        v-if="searchable"
        v-model="query"
        placeholder="Search skills..."
        class="tr-skills-search"
      />
    </slot>

    <!-- Skills 列表 -->
    <div class="tr-skills-list">
      <slot
        v-for="skill in filteredSkills"
        :key="skill.id"
        name="skill"
        :skill="skill"
        :is-selected="selectedIds.has(skill.id)"
        :on-select="() => handleSelect(skill)"
      >
        <div
          class="tr-skill-card"
          :class="{ selected: selectedIds.has(skill.id) }"
          @click="handleSelect(skill)"
        >
          <h4 class="tr-skill-name">{{ skill.name }}</h4>
          <p class="tr-skill-description">{{ skill.description }}</p>
          <div v-if="skill.tags.length > 0" class="tr-skill-tags">
            <span v-for="tag in skill.tags" :key="tag" class="tr-skill-tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </slot>
    </div>

    <!-- 空状态 -->
    <slot v-if="filteredSkills.length === 0" name="empty">
      <div class="tr-skills-empty">No skills available</div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Skill } from './TrSkills'  // 从第 2.2 节导入

interface Props {
  skills: Skill[]
  mode?: 'panel' | 'dropdown' | 'inline'
  maxDisplay?: number
  searchable?: boolean
  selectable?: boolean
  multiple?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'panel',
  maxDisplay: 10,
  searchable: true,
  selectable: true,
  multiple: true,
  size: 'medium',
})

const emit = defineEmits<{
  select: [skill: Skill]
  load: [skill: Skill]
}>()

const query = ref('')
const selectedIds = ref(new Set<string>())

const filteredSkills = computed(() => {
  let result = props.skills

  if (query.value) {
    const q = query.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  return result.slice(0, props.maxDisplay)
})

const handleSearch = (value: string) => {
  query.value = value
}

const handleSelect = (skill: Skill) => {
  if (!props.selectable) return

  if (props.multiple) {
    if (selectedIds.value.has(skill.id)) {
      selectedIds.value.delete(skill.id)
    } else {
      selectedIds.value.add(skill.id)
    }
  } else {
    selectedIds.value.clear()
    selectedIds.value.add(skill.id)
  }

  emit('select', skill)
}
</script>

<style scoped>
.tr-skills {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-skills-search {
  padding: 8px 12px;
  border: 1px solid var(--tr-color-border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: var(--tr-container-bg-default);
  color: var(--tr-color-text-primary);
  transition: border-color 0.2s;
}

.tr-skills-search:focus {
  outline: none;
  border-color: var(--tr-color-primary);
}

.tr-skills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tr-skill-card {
  padding: 12px;
  border: 1px solid var(--tr-color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--tr-container-bg-default);
}

.tr-skill-card:hover {
  background: var(--tr-container-bg-secondary);
  border-color: var(--tr-color-primary);
}

.tr-skill-card.selected {
  background: var(--tr-color-primary-light);
  border-color: var(--tr-color-primary);
}

.tr-skill-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--tr-color-text-primary);
}

.tr-skill-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: var(--tr-color-text-secondary);
  line-height: 1.4;
}

.tr-skill-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tr-skill-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--tr-color-primary-light);
  color: var(--tr-color-primary);
  border-radius: 4px;
  font-size: 12px;
}

.tr-skills-empty {
  padding: 20px;
  text-align: center;
  color: var(--tr-color-text-secondary);
  font-size: 14px;
}

/* 模式变体 */
.mode-inline .tr-skills-list {
  flex-direction: row;
  flex-wrap: wrap;
}

.mode-inline .tr-skill-card {
  flex: 0 1 calc(50% - 4px);
}

.mode-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--tr-container-bg-default);
  border: 1px solid var(--tr-color-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* 尺寸变体 */
.size-small .tr-skill-card {
  padding: 8px;
}

.size-small .tr-skill-name {
  font-size: 12px;
}

.size-small .tr-skill-description {
  font-size: 11px;
}

.size-large .tr-skill-card {
  padding: 16px;
}

.size-large .tr-skill-name {
  font-size: 16px;
}

.size-large .tr-skill-description {
  font-size: 13px;
}
</style>
```

### 2.7 导出

```ts
// packages/tiny-robot/src/components/Skills/index.ts
export { default as TrSkills } from './TrSkills.vue'
export type { Skill } from './TrSkills.vue'

// packages/tiny-robot/src/index.ts
export { TrSkills } from './components/Skills'
export type { Skill } from './components/Skills'
```

---

## 三、在 ChatKit 中的使用

### 3.1 ChatKitSkills 包装（可选）

```vue
<!-- packages/chat-kit/src/components/ChatKitSkills.vue -->
<template>
  <TrSkills
    :skills="skills"
    :mode="mode"
    :max-display="maxDisplay"
    :searchable="searchable"
    :selectable="selectable"
    :multiple="multiple"
    :size="size"
    @select="$emit('select', $event)"
    @load="$emit('load', $event)"
  >
    <template #skill="{ skill, isSelected, onSelect }">
      <slot name="skill" :skill="skill" :is-selected="isSelected" :on-select="onSelect" />
    </template>
    <template #search="{ query, onSearch }">
      <slot name="search" :query="query" :on-search="onSearch" />
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
  </TrSkills>
</template>

<script setup lang="ts">
import { TrSkills, type Skill } from '@opentiny/tiny-robot'

interface Props {
  skills: Skill[]
  mode?: 'panel' | 'dropdown' | 'inline'
  maxDisplay?: number
  searchable?: boolean
  selectable?: boolean
  multiple?: boolean
  size?: 'small' | 'medium' | 'large'
}

defineProps<Props>()
defineEmits<{
  select: [skill: Skill]
  load: [skill: Skill]
}>()
</script>
```

### 3.2 在 ChatKit 中使用

```vue
<!-- 黑盒模式 -->
<ChatKit :response-provider="responseProvider" show-history>
  <template #footer-extra>
    <ChatKitSkills
      :skills="availableSkills"
      mode="inline"
      multiple
      @select="handleSkillSelect"
    />
  </template>
</ChatKit>

<!-- 或直接使用 TrSkills -->
<ChatKit :response-provider="responseProvider" show-history>
  <template #footer-extra>
    <TrSkills
      :skills="availableSkills"
      mode="inline"
      multiple
      @select="handleSkillSelect"
    />
  </template>
</ChatKit>
```

---

## 四、with-skills 模板实现（改进方案）

### 4.1 模板结构

```
templates/with-skills/
├── src/
│   ├── App.vue                    ← 核心：使用 TrSkills 和 SkillsManager
│   ├── skills/                    ← 本地 skills 数据
│   │   ├── pdf-analysis.ts
│   │   ├── code-review.ts
│   │   ├── data-analysis.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── skillsManager.ts       ← 核心：Skills 管理器（支持本地/远程）
│   │   ├── skillsProvider.ts      ← 增强的 responseProvider
│   │   └── skillsLoader.ts        ← Skills 加载器（可扩展）
│   ├── main.ts
│   └── env.d.ts
├── public/
├── .env.example
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### 4.2 Skill 类型定义（在 tiny-robot 中）

Skill 接口在 `@opentiny/tiny-robot` 中定义（详见第 2.5 节），支持从基础信息到高级元数据的完整定义：

```ts
// packages/tiny-robot/src/components/Skills/types.ts
// 导出自 TrSkills.vue 中的定义
export interface Skill {
  // 基础信息
  id: string
  name: string
  description: string
  tags: string[]
  
  // 内容
  content?: string              // skill 的完整指令内容
  
  // 来源信息（支持扩展）
  source?: 'local' | 'remote' | string  // 来源类型，可扩展
  sourceUrl?: string            // 来源 URL
  
  // 版本和元数据
  version?: string              // skill 版本
  author?: string               // skill 作者
  createdAt?: number            // 创建时间
  updatedAt?: number            // 更新时间
  
  // 依赖和兼容性
  dependencies?: string[]       // 依赖的其他 skills
  minVersion?: string           // 最小兼容版本
  
  // 扩展字段
  metadata?: Record<string, any>  // 自定义元数据
}
```

**说明**：这是对第 2.5 节基础类型的完整定义，支持本地和远程 skills 的所有需求。在 `templates/with-skills/src/lib/skillsManager.ts` 中导入使用：

```ts
import type { Skill } from '@opentiny/tiny-robot'
```

### 4.3 SkillsManager - 核心管理器

```ts
// templates/with-skills/src/lib/skillsManager.ts
import type { Skill } from '@opentiny/tiny-robot'

export interface SkillsLoaderStrategy {
  name: string
  load(): Promise<Skill[]>
}

export interface SkillsManagerOptions {
  loaders?: SkillsLoaderStrategy[]  // 可扩展的加载器
  cacheEnabled?: boolean            // 是否启用缓存
  cacheTTL?: number                 // 缓存过期时间（毫秒）
}

export class SkillsManager {
  private skillsMap: Map<string, Skill> = new Map()
  private cache: Map<string, { data: Skill; timestamp: number }> = new Map()
  private loaders: SkillsLoaderStrategy[] = []
  private cacheEnabled: boolean
  private cacheTTL: number

  constructor(options: SkillsManagerOptions = {}) {
    this.loaders = options.loaders || []
    this.cacheEnabled = options.cacheEnabled ?? true
    this.cacheTTL = options.cacheTTL ?? 1000 * 60 * 60  // 默认 1 小时
  }

  // ===== 加载器管理 =====
  
  /**
   * 注册新的加载器（支持扩展）
   * 例如：registerLoader(new RemoteSkillsLoader())
   */
  registerLoader(loader: SkillsLoaderStrategy): void {
    this.loaders.push(loader)
  }

  /**
   * 加载所有来源的 skills
   */
  async loadAllSkills(): Promise<void> {
    for (const loader of this.loaders) {
      try {
        const skills = await loader.load()
        skills.forEach(skill => {
          this.skillsMap.set(skill.id, skill)
        })
      } catch (error) {
        console.error(`Failed to load skills from ${loader.name}:`, error)
      }
    }
  }

  // ===== Skills 查询 =====

  /**
   * 获取所有可用 skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skillsMap.values())
  }

  /**
   * 根据 ID 获取 skill
   */
  getSkill(skillId: string): Skill | undefined {
    return this.skillsMap.get(skillId)
  }

  /**
   * 根据标签过滤 skills
   */
  getSkillsByTag(tag: string): Skill[] {
    return this.getAllSkills().filter(skill =>
      skill.tags.includes(tag)
    )
  }

  /**
   * 根据来源过滤 skills
   */
  getSkillsBySource(source: string): Skill[] {
    return this.getAllSkills().filter(skill =>
      skill.source === source
    )
  }

  // ===== Skills 发现 =====

  /**
   * 自动发现相关 skills（基于关键词匹配）
   */
  async discoverSkills(query: string): Promise<Skill[]> {
    const allSkills = this.getAllSkills()
    const queryLower = query.toLowerCase()

    return allSkills
      .filter(skill => {
        const score = this.calculateRelevance(queryLower, skill)
        return score > 0.3
      })
      .sort((a, b) =>
        this.calculateRelevance(queryLower, b) -
        this.calculateRelevance(queryLower, a)
      )
  }

  // ===== Skills 内容加载 =====

  /**
   * 加载 skill 的完整内容（支持缓存）
   */
  async loadSkillContent(skillId: string): Promise<string> {
    // 检查缓存
    if (this.cacheEnabled) {
      const cached = this.cache.get(skillId)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data.content || ''
      }
    }

    const skill = this.skillsMap.get(skillId)
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`)
    }

    // 如果已有内容，直接返回
    if (skill.content) {
      if (this.cacheEnabled) {
        this.cache.set(skillId, { data: skill, timestamp: Date.now() })
      }
      return skill.content
    }

    // 如果是远程 skill，尝试加载
    if (skill.sourceUrl) {
      try {
        const response = await fetch(
          `${skill.sourceUrl}/skills/${skillId}/content`
        )
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const content = await response.text()
        
        // 更新 skill 内容
        skill.content = content
        
        if (this.cacheEnabled) {
          this.cache.set(skillId, { data: skill, timestamp: Date.now() })
        }
        
        return content
      } catch (error) {
        console.error(`Failed to load skill ${skillId} from ${skill.sourceUrl}:`, error)
        return ''
      }
    }

    return ''
  }

  // ===== Skills 管理 =====

  /**
   * 添加自定义 skill
   */
  addSkill(skill: Skill): void {
    this.skillsMap.set(skill.id, {
      ...skill,
      source: skill.source || 'local',
      createdAt: skill.createdAt || Date.now(),
    })
  }

  /**
   * 更新 skill
   */
  updateSkill(skillId: string, updates: Partial<Skill>): void {
    const skill = this.skillsMap.get(skillId)
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`)
    }
    
    this.skillsMap.set(skillId, {
      ...skill,
      ...updates,
      updatedAt: Date.now(),
    })
    
    // 清除缓存
    this.cache.delete(skillId)
  }

  /**
   * 删除 skill
   */
  removeSkill(skillId: string): void {
    this.skillsMap.delete(skillId)
    this.cache.delete(skillId)
  }

  /**
   * 清空所有 skills
   */
  clear(): void {
    this.skillsMap.clear()
    this.cache.clear()
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  // ===== 工具方法 =====

  private calculateRelevance(query: string, skill: Skill): number {
    let score = 0
    if (skill.name.toLowerCase().includes(query)) score += 0.5
    if (skill.description.toLowerCase().includes(query)) score += 0.3
    for (const tag of skill.tags) {
      if (query.includes(tag.toLowerCase())) score += 0.2
    }
    return Math.min(score, 1)
  }
}
```

### 4.4 可扩展的加载器系统

```ts
// templates/with-skills/src/lib/skillsLoader.ts
import type { Skill, SkillsLoaderStrategy } from './skillsManager'

/**
 * 本地 skills 加载器
 */
export class LocalSkillsLoader implements SkillsLoaderStrategy {
  name = 'local'

  constructor(private skills: Skill[]) {}

  async load(): Promise<Skill[]> {
    return this.skills.map(skill => ({
      ...skill,
      source: 'local',
    }))
  }
}

/**
 * 远程 skills 加载器（可扩展）
 */
export class RemoteSkillsLoader implements SkillsLoaderStrategy {
  name: string

  constructor(
    private sourceUrl: string,
    private options?: {
      name?: string
      headers?: Record<string, string>
      timeout?: number
    }
  ) {
    this.name = options?.name || `remote:${sourceUrl}`
  }

  async load(): Promise<Skill[]> {
    try {
      const response = await fetch(`${this.sourceUrl}/list`, {
        headers: this.options?.headers,
        signal: this.options?.timeout
          ? AbortSignal.timeout(this.options.timeout)
          : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const skills = await response.json()
      return skills.map((skill: Skill) => ({
        ...skill,
        source: 'remote',
        sourceUrl: this.sourceUrl,
      }))
    } catch (error) {
      console.error(`Failed to load remote skills from ${this.sourceUrl}:`, error)
      return []
    }
  }
}

/**
 * 自定义加载器示例：从 IndexedDB 加载
 */
export class IndexedDBSkillsLoader implements SkillsLoaderStrategy {
  name = 'indexeddb'

  constructor(private dbName: string = 'skills-db') {}

  async load(): Promise<Skill[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction('skills', 'readonly')
        const store = transaction.objectStore('skills')
        const getAllRequest = store.getAll()

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result)
        }
        getAllRequest.onerror = () => {
          reject(getAllRequest.error)
        }
      }
    })
  }
}
```

### 4.5 ResponseProvider 增强

```ts
// templates/with-skills/src/lib/skillsProvider.ts
import type { ResponseProvider } from '@opentiny/tiny-robot-kit'
import type { Skill } from '@opentiny/tiny-robot'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import type { SkillsManager } from './skillsManager'

interface SkillsProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  skillsManager: SkillsManager
  selectedSkills: Skill[]
  enableAutoDiscovery?: boolean
}

export function createSkillsProvider(
  options: SkillsProviderOptions
): ResponseProvider {
  const baseProvider = createOpenAIProvider({
    apiKey: options.apiKey,
    model: options.model,
    baseURL: options.baseURL,
  })

  return async (requestBody, abortSignal) => {
    let skillsToUse = options.selectedSkills

    // 自动发现相关 skills
    if (options.enableAutoDiscovery && requestBody.messages.length > 0) {
      const userQuery = requestBody.messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ')

      const discovered = await options.skillsManager.discoverSkills(userQuery)
      skillsToUse = discovered
    }

    // 构建增强的系统提示
    const skillsMetadata = skillsToUse
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n')

    const enhancedSystemPrompt = skillsMetadata
      ? `你拥有以下能力：\n\n${skillsMetadata}\n\n当用户的请求与某个能力相关时，你可以使用该能力。`
      : ''

    return baseProvider({
      ...requestBody,
      messages: enhancedSystemPrompt
        ? [
            { role: 'system', content: enhancedSystemPrompt },
            ...requestBody.messages,
          ]
        : requestBody.messages,
    }, abortSignal)
  }
}
```

### 4.6 本地 Skills 数据

```ts
// templates/with-skills/src/skills/index.ts
import type { Skill } from '@opentiny/tiny-robot'

export const pdfAnalysisSkill: Skill = {
  id: 'pdf-analysis',
  name: 'PDF Analysis',
  description: 'Extract and analyze content from PDF files',
  tags: ['document', 'pdf', 'analysis'],
  version: '1.0.0',
  author: 'TinyRobot',
  content: `# PDF Analysis Skill

## Overview
This skill enables the assistant to analyze PDF documents...

## When to Use
- User uploads a PDF file
- User asks to "analyze this PDF"
- User wants to extract data from PDF

## Instructions
1. Extract text content from the PDF
2. Identify document structure
3. Generate a concise summary
4. Highlight key information
`,
}

export const codeReviewSkill: Skill = {
  id: 'code-review',
  name: 'Code Review',
  description: 'Review and analyze code for quality and best practices',
  tags: ['code', 'review', 'quality'],
  version: '1.0.0',
  author: 'TinyRobot',
  content: `# Code Review Skill

## Overview
This skill enables the assistant to review code...

## When to Use
- User asks to "review this code"
- User wants code quality feedback
- User needs best practices suggestions

## Instructions
1. Analyze code structure and readability
2. Check for potential bugs
3. Suggest improvements
4. Recommend best practices
`,
}

export const dataAnalysisSkill: Skill = {
  id: 'data-analysis',
  name: 'Data Analysis',
  description: 'Analyze and visualize data patterns',
  tags: ['data', 'analysis', 'statistics'],
  version: '1.0.0',
  author: 'TinyRobot',
  content: `# Data Analysis Skill

## Overview
This skill enables the assistant to analyze data...

## When to Use
- User provides data to analyze
- User asks for insights from data
- User wants statistical analysis

## Instructions
1. Parse and validate data
2. Identify patterns and trends
3. Calculate relevant statistics
4. Provide actionable insights
`,
}

export const allSkills: Skill[] = [
  pdfAnalysisSkill,
  codeReviewSkill,
  dataAnalysisSkill,
]
```

### 4.7 App.vue 完整实现

```vue
<!-- templates/with-skills/src/App.vue -->
<template>
  <ChatKit
    :response-provider="skillsAwareProvider"
    :welcome="welcome"
    :prompts="prompts"
    show-history
    style="height: 100vh"
  >
    <!-- Skills 面板 -->
    <template #footer-extra>
      <div class="skills-container">
        <TrSkills
          :skills="availableSkills"
          mode="inline"
          multiple
          searchable
          @select="handleSkillSelect"
        />
        
        <!-- 添加自定义 skill 按钮 -->
        <button @click="showAddSkillDialog = true" class="add-skill-btn">
          + Add Custom Skill
        </button>

        <!-- 自定义 skill 对话框 -->
        <div v-if="showAddSkillDialog" class="dialog-overlay" @click="showAddSkillDialog = false">
          <div class="dialog" @click.stop>
            <h3>Add Custom Skill</h3>
            <input v-model="newSkill.name" placeholder="Skill Name" />
            <textarea v-model="newSkill.description" placeholder="Description"></textarea>
            <input v-model="newSkillTags" placeholder="Tags (comma-separated)" />
            <textarea v-model="newSkill.content" placeholder="Skill Content"></textarea>
            <div class="dialog-actions">
              <button @click="addCustomSkill" class="btn-primary">Add</button>
              <button @click="showAddSkillDialog = false" class="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ChatKit>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChatKit, createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import { TrSkills, type Skill } from '@opentiny/tiny-robot'
import { SkillsManager } from './lib/skillsManager'
import { LocalSkillsLoader, RemoteSkillsLoader } from './lib/skillsLoader'
import { createSkillsProvider } from './lib/skillsProvider'
import { allSkills } from './skills'

// ===== SkillsManager 初始化 =====
const skillsManager = new SkillsManager({
  cacheEnabled: true,
  cacheTTL: 1000 * 60 * 60,  // 1 小时
})

// 注册本地加载器
skillsManager.registerLoader(new LocalSkillsLoader(allSkills))

// 如果配置了远程源，注册远程加载器
if (import.meta.env.VITE_SKILLS_SOURCE_URL) {
  skillsManager.registerLoader(
    new RemoteSkillsLoader(import.meta.env.VITE_SKILLS_SOURCE_URL, {
      name: 'skills.sh',
      timeout: 5000,
    })
  )
}

// ===== 状态管理 =====
const availableSkills = ref<Skill[]>([])
const selectedSkills = ref<Skill[]>([])
const showAddSkillDialog = ref(false)
const newSkill = ref<Partial<Skill>>({
  tags: [],
})
const newSkillTags = ref('')

// ===== 初始化 =====
onMounted(async () => {
  // 加载所有 skills
  await skillsManager.loadAllSkills()
  availableSkills.value = skillsManager.getAllSkills()
})

// ===== Skills 交互 =====
const handleSkillSelect = (skill: Skill) => {
  const index = selectedSkills.value.findIndex(s => s.id === skill.id)
  if (index > -1) {
    selectedSkills.value.splice(index, 1)
  } else {
    selectedSkills.value.push(skill)
  }
}

const addCustomSkill = () => {
  if (!newSkill.value.name || !newSkill.value.description) {
    alert('Please fill in all required fields')
    return
  }

  const skill: Skill = {
    id: `custom-${Date.now()}`,
    name: newSkill.value.name,
    description: newSkill.value.description,
    tags: newSkillTags.value.split(',').map(t => t.trim()).filter(Boolean),
    content: newSkill.value.content,
    source: 'local',
    version: '1.0.0',
    author: 'User',
  }

  skillsManager.addSkill(skill)
  availableSkills.value = skillsManager.getAllSkills()
  
  // 重置表单
  newSkill.value = { tags: [] }
  newSkillTags.value = ''
  showAddSkillDialog.value = false
}

// ===== ResponseProvider =====
const baseProvider = createOpenAIProvider({
  apiKey: import.meta.env.VITE_API_KEY,
  model: import.meta.env.VITE_MODEL || 'gpt-4o-mini',
  baseURL: import.meta.env.VITE_BASE_URL,
})

// 使用 computed 包装 selectedSkills，确保响应式更新
const skillsAwareProvider = computed(() =>
  createSkillsProvider({
    apiKey: import.meta.env.VITE_API_KEY,
    skillsManager,
    selectedSkills: selectedSkills.value,
    enableAutoDiscovery: import.meta.env.VITE_AUTO_DISCOVER_SKILLS === 'true',
  })
)

// ===== UI 配置 =====
const welcome = {
  title: 'AI Assistant with Skills',
  description: '我拥有多种能力，可以帮助你分析 PDF、审查代码、分析数据等。',
}

const prompts = [
  { title: '📄 分析 PDF', description: '帮我分析一份 PDF 文档...' },
  { title: '💻 代码审查', description: '帮我审查这段代码...' },
  { title: '📊 数据分析', description: '帮我分析这些数据...' },
]
</script>

<style scoped>
.skills-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-skill-btn {
  padding: 8px 12px;
  background: var(--tr-color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.add-skill-btn:hover {
  opacity: 0.9;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--tr-container-bg-default);
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog h3 {
  margin: 0;
  font-size: 18px;
}

.dialog input,
.dialog textarea {
  padding: 8px 12px;
  border: 1px solid var(--tr-color-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
}

.dialog textarea {
  min-height: 100px;
  resize: vertical;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: var(--tr-color-primary);
  color: white;
}

.btn-secondary {
  background: var(--tr-container-bg-secondary);
  color: var(--tr-color-text-primary);
}
</style>
```

### 4.8 .env.example

```env
# API Configuration
VITE_API_KEY=sk-xxx
VITE_MODEL=gpt-4o-mini
VITE_BASE_URL=https://api.openai.com/v1

# Skills Configuration
VITE_SKILLS_SOURCE_URL=https://skills.sh/api
VITE_AUTO_DISCOVER_SKILLS=false
```
---

## 五、扩展性设计

### 5.1 加载器扩展

当前支持的加载器：
- `LocalSkillsLoader`：本地 skills
- `RemoteSkillsLoader`：远程 HTTP API
- `IndexedDBSkillsLoader`：浏览器 IndexedDB

**未来可扩展的加载器**：
- `FileSystemSkillsLoader`：从文件系统加载（Electron/Node.js）
- `GitHubSkillsLoader`：从 GitHub 仓库加载
- `NPMSkillsLoader`：从 NPM 包加载
- `DatabaseSkillsLoader`：从数据库加载
- `S3SkillsLoader`：从 AWS S3 加载

**扩展示例**：

```ts
// 自定义加载器
export class CustomSkillsLoader implements SkillsLoaderStrategy {
  name = 'custom'

  async load(): Promise<Skill[]> {
    // 实现自己的加载逻辑
    return []
  }
}

// 使用
const skillsManager = new SkillsManager()
skillsManager.registerLoader(new CustomSkillsLoader())
```

### 5.2 Skills 发现策略扩展 (规划中)

当前使用简单的关键词匹配。未来可扩展：

```ts
export interface SkillsDiscoveryStrategy {
  discover(query: string, skills: Skill[]): Promise<Skill[]>
}

// 基于 AI 的发现策略
export class AISkillsDiscoveryStrategy implements SkillsDiscoveryStrategy {
  async discover(query: string, skills: Skill[]): Promise<Skill[]> {
    // 使用 LLM 进行语义匹配
    return []
  }
}

// 在 SkillsManager 中使用
skillsManager.setDiscoveryStrategy(new AISkillsDiscoveryStrategy())
```

### 5.3 Skills 缓存策略扩展 (规划中)

当前使用内存缓存。未来可扩展：

```ts
export interface SkillsCacheStrategy {
  get(key: string): Skill | undefined
  set(key: string, skill: Skill): void
  clear(): void
}

// LocalStorage 缓存
export class LocalStorageCacheStrategy implements SkillsCacheStrategy {
  get(key: string): Skill | undefined {
    const data = localStorage.getItem(`skill:${key}`)
    return data ? JSON.parse(data) : undefined
  }

  set(key: string, skill: Skill): void {
    localStorage.setItem(`skill:${key}`, JSON.stringify(skill))
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith('skill:'))
      .forEach(k => localStorage.removeItem(k))
  }
}

// 在 SkillsManager 中使用
skillsManager.setCacheStrategy(new LocalStorageCacheStrategy())
```

### 5.4 Skills 验证和转换 (规划中)

```ts
export interface SkillsTransformer {
  transform(skill: Skill): Skill
}

// 版本兼容性转换
export class SkillsVersionTransformer implements SkillsTransformer {
  transform(skill: Skill): Skill {
    // 处理不同版本的 skill 格式
    return skill
  }
}

// 在加载时应用转换
skillsManager.registerTransformer(new SkillsVersionTransformer())
```

### 5.5 Skills 事件系统 (规划中)

```ts
export interface SkillsManagerEvents {
  'skill:loaded': (skill: Skill) => void
  'skill:added': (skill: Skill) => void
  'skill:updated': (skill: Skill) => void
  'skill:removed': (skillId: string) => void
  'loader:started': (loaderName: string) => void
  'loader:completed': (loaderName: string) => void
  'loader:failed': (loaderName: string, error: Error) => void
}

// 在 SkillsManager 中添加事件支持
skillsManager.on('skill:added', (skill) => {
  console.log('New skill added:', skill.name)
})
```

---

## 六、组合模板规划

### 6.1 with-skills-and-mcp

**特点**：Skills 提供指令，MCP 提供工具

```ts
// skillsAndMcpProvider.ts
import type { ResponseProvider } from '@opentiny/tiny-robot-kit'
import type { Skill } from '@opentiny/tiny-robot'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import type { SkillsManager } from './skillsManager'

interface SkillsAndMCPProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  skillsManager: SkillsManager
  selectedSkills: Skill[]
  mcpTools: any[]  // MCP 工具列表
}

export function createSkillsAndMCPProvider(
  options: SkillsAndMCPProviderOptions
): ResponseProvider {
  const baseProvider = createOpenAIProvider({
    apiKey: options.apiKey,
    model: options.model,
    baseURL: options.baseURL,
  })

  return async (requestBody, abortSignal) => {
    // 构建 skills 元数据
    const skillsMetadata = options.selectedSkills
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n')

    // 构建 MCP 工具元数据
    const toolsMetadata = options.mcpTools
      .map(t => `- ${t.name}: ${t.description}`)
      .join('\n')

    const enhancedSystemPrompt = `
你拥有以下能力（Skills）：
${skillsMetadata}

你可以使用以下工具（MCP Tools）：
${toolsMetadata}

当用户的请求与某个能力或工具相关时，你可以使用它们。
`

    return baseProvider({
      ...requestBody,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...requestBody.messages,
      ],
    }, abortSignal)
  }
}
```

**使用示例**：

```vue
<script setup lang="ts">
import { createSkillsAndMCPProvider } from './lib/skillsAndMcpProvider'

const skillsAndMcpProvider = computed(() =>
  createSkillsAndMCPProvider({
    apiKey: import.meta.env.VITE_API_KEY,
    skillsManager,
    selectedSkills: selectedSkills.value,
    mcpTools: availableMcpTools.value,
  })
)
</script>

<template>
  <ChatKit :response-provider="skillsAndMcpProvider" show-history>
    <template #footer-extra>
      <div class="skills-and-tools">
        <TrSkills
          :skills="availableSkills"
          mode="inline"
          @select="handleSkillSelect"
        />
        <MCPToolsPanel
          :tools="availableMcpTools"
          @select="handleToolSelect"
        />
      </div>
    </template>
  </ChatKit>
</template>
```

### 6.2 with-skills-and-rag

**特点**：Skills 提供领域知识，RAG 提供文档检索

```ts
// skillsAndRagProvider.ts
import type { ResponseProvider } from '@opentiny/tiny-robot-kit'
import type { Skill } from '@opentiny/tiny-robot'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import type { SkillsManager } from './skillsManager'

interface SkillsAndRAGProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  skillsManager: SkillsManager
  selectedSkills: Skill[]
  retrievalFn: (query: string) => Promise<string[]>  // RAG 检索函数
}

export function createSkillsAndRAGProvider(
  options: SkillsAndRAGProviderOptions
): ResponseProvider {
  const baseProvider = createOpenAIProvider({
    apiKey: options.apiKey,
    model: options.model,
    baseURL: options.baseURL,
  })

  return async (requestBody, abortSignal) => {
    // 获取用户查询
    const userQuery = requestBody.messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ')

    // 检索相关文档
    const retrievedDocs = await options.retrievalFn(userQuery)
    const ragContext = retrievedDocs.join('\n\n')

    // 构建 skills 元数据
    const skillsMetadata = options.selectedSkills
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n')

    const enhancedSystemPrompt = `
你拥有以下能力（Skills）：
${skillsMetadata}

以下是相关的参考文档（RAG Context）：
${ragContext}

请根据你的能力和参考文档来回答用户的问题。
`

    return baseProvider({
      ...requestBody,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...requestBody.messages,
      ],
    }, abortSignal)
  }
}
```

**使用示例**：

```vue
<script setup lang="ts">
import { createSkillsAndRAGProvider } from './lib/skillsAndRagProvider'

// RAG 检索函数示例
async function retrieveDocuments(query: string): Promise<string[]> {
  const response = await fetch('/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await response.json()
  return data.documents
}

const skillsAndRagProvider = computed(() =>
  createSkillsAndRAGProvider({
    apiKey: import.meta.env.VITE_API_KEY,
    skillsManager,
    selectedSkills: selectedSkills.value,
    retrievalFn: retrieveDocuments,
  })
)
</script>

<template>
  <ChatKit :response-provider="skillsAndRagProvider" show-history>
    <template #footer-extra>
      <TrSkills
        :skills="availableSkills"
        mode="inline"
        @select="handleSkillSelect"
      />
    </template>
  </ChatKit>
</template>
```

### 6.3 with-skills-and-context

**特点**：Skills 在长对话中保持可用，支持上下文优化

```ts
// skillsAndContextProvider.ts
import type { ResponseProvider } from '@opentiny/tiny-robot-kit'
import type { Skill } from '@opentiny/tiny-robot'
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import type { SkillsManager } from './skillsManager'

interface ContextMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SkillsAndContextProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  skillsManager: SkillsManager
  selectedSkills: Skill[]
  contextWindow?: number  // 保留的历史消息数
  contextOptimizer?: (messages: ContextMessage[]) => ContextMessage[]
}

export function createSkillsAndContextProvider(
  options: SkillsAndContextProviderOptions
): ResponseProvider {
  const baseProvider = createOpenAIProvider({
    apiKey: options.apiKey,
    model: options.model,
    baseURL: options.baseURL,
  })

  return async (requestBody, abortSignal) => {
    let messages = requestBody.messages

    // 应用上下文优化
    if (options.contextOptimizer) {
      messages = options.contextOptimizer(messages)
    }

    // 限制上下文窗口
    if (options.contextWindow && messages.length > options.contextWindow) {
      messages = messages.slice(-options.contextWindow)
    }

    // 构建 skills 元数据
    const skillsMetadata = options.selectedSkills
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n')

    const enhancedSystemPrompt = `
你拥有以下能力（Skills）：
${skillsMetadata}

在整个对话过程中，你可以随时使用这些能力来帮助用户。
`

    return baseProvider({
      ...requestBody,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages,
      ],
    }, abortSignal)
  }
}
```

**使用示例**：

```vue
<script setup lang="ts">
import { createSkillsAndContextProvider } from './lib/skillsAndContextProvider'

// 上下文优化函数：总结长对话
function optimizeContext(messages: any[]): any[] {
  if (messages.length <= 10) return messages

  // 保留最后 5 条消息，总结前面的消息
  const recentMessages = messages.slice(-5)
  const olderMessages = messages.slice(0, -5)

  const summary = `
[对话摘要]
用户之前提出了 ${olderMessages.filter(m => m.role === 'user').length} 个问题，
助手提供了相应的回答。
`

  return [
    { role: 'system', content: summary },
    ...recentMessages,
  ]
}

const skillsAndContextProvider = computed(() =>
  createSkillsAndContextProvider({
    apiKey: import.meta.env.VITE_API_KEY,
    skillsManager,
    selectedSkills: selectedSkills.value,
    contextWindow: 20,
    contextOptimizer: optimizeContext,
  })
)
</script>

<template>
  <ChatKit :response-provider="skillsAndContextProvider" show-history>
    <template #footer-extra>
      <TrSkills
        :skills="availableSkills"
        mode="inline"
        @select="handleSkillSelect"
      />
    </template>
  </ChatKit>
</template>
```

---

## 七、设计总结

### 7.1 核心特点

| 特点 | 说明 |
|------|------|
| **可扩展的加载器** | 支持本地、远程、自定义多种来源 |
| **灵活的发现策略** | 支持关键词匹配、AI 语义匹配等 |
| **智能缓存系统** | 支持内存、LocalStorage、自定义缓存 |
| **事件驱动** | 支持监听 skills 生命周期事件 |
| **版本管理** | 支持 skill 版本和依赖管理 |
| **元数据扩展** | 支持自定义元数据字段 |

### 7.2 架构分层

```
┌─────────────────────────────────────────┐
│  应用层（with-skills 模板）              │
│  - App.vue                              │
│  - 业务逻辑                             │
├─────────────────────────────────────────┤
│  管理层（SkillsManager）                 │
│  - 加载器管理                           │
│  - 缓存管理                             │
│  - 发现策略                             │
├─────────────────────────────────────────┤
│  加载层（SkillsLoader）                  │
│  - LocalSkillsLoader                    │
│  - RemoteSkillsLoader                   │
│  - 自定义加载器                         │
├─────────────────────────────────────────┤
│  UI 层（TrSkills）                       │
│  - 展示和交互                           │
│  - 纯 UI 组件                           │
└─────────────────────────────────────────┘
```

### 7.3 职责划分

| 组件 | 职责 |
|------|------|
| **TrSkills** | 展示 skills、搜索、选择 |
| **SkillsManager** | 管理 skills 生命周期、缓存、发现 |
| **SkillsLoader** | 从各种来源加载 skills |
| **SkillsProvider** | 增强 responseProvider，注入 skills |
| **App.vue** | 组织整体流程，处理用户交互 |

### 7.4 扩展点

| 扩展点 | 说明 |
|--------|------|
| **加载器** | 实现 `SkillsLoaderStrategy` 接口 |
| **发现策略** | 实现 `SkillsDiscoveryStrategy` 接口 |
| **缓存策略** | 实现 `SkillsCacheStrategy` 接口 |
| **转换器** | 实现 `SkillsTransformer` 接口 |
| **事件** | 监听 `SkillsManagerEvents` 事件 |

---

## 八、错误处理

### 8.1 加载器错误处理

```ts
// SkillsManager 中的错误处理
async loadAllSkills(): Promise<void> {
  for (const loader of this.loaders) {
    try {
      const skills = await loader.load()
      skills.forEach(skill => {
        this.skillsMap.set(skill.id, skill)
      })
    } catch (error) {
      // 记录错误但继续加载其他来源
      console.error(`Failed to load skills from ${loader.name}:`, error)
      // 可选：发送错误事件
      this.emit('loader:failed', loader.name, error)
    }
  }
}
```

### 8.2 Skill 内容加载错误

```ts
async loadSkillContent(skillId: string): Promise<string> {
  const skill = this.skillsMap.get(skillId)
  if (!skill) {
    throw new Error(`Skill ${skillId} not found`)
  }

  if (skill.content) {
    return skill.content
  }

  if (skill.sourceUrl) {
    try {
      const response = await fetch(
        `${skill.sourceUrl}/skills/${skillId}/content`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const content = await response.text()
      skill.content = content
      return content
    } catch (error) {
      console.error(`Failed to load skill ${skillId}:`, error)
      // 返回空字符串而不是抛出错误，允许应用继续运行
      return ''
    }
  }

  return ''
}
```

### 8.3 验证错误处理

```ts
// 在 addSkill 时验证
addSkill(skill: Skill): void {
  // 验证必需字段
  if (!skill.id || !skill.name || !skill.description) {
    throw new Error('Skill must have id, name, and description')
  }

  // 验证 ID 唯一性
  if (this.skillsMap.has(skill.id)) {
    throw new Error(`Skill with id ${skill.id} already exists`)
  }

  this.skillsMap.set(skill.id, {
    ...skill,
    source: skill.source || 'local',
    createdAt: skill.createdAt || Date.now(),
  })
}
```

### 8.4 应用层错误处理

```vue
<!-- App.vue 中的错误处理 -->
<script setup lang="ts">
const addCustomSkill = async () => {
  try {
    if (!newSkill.value.name || !newSkill.value.description) {
      throw new Error('Please fill in all required fields')
    }

    const skill: Skill = {
      id: `custom-${Date.now()}`,
      name: newSkill.value.name,
      description: newSkill.value.description,
      tags: newSkillTags.value.split(',').map(t => t.trim()).filter(Boolean),
      content: newSkill.value.content,
      source: 'local',
      version: '1.0.0',
      author: 'User',
    }

    skillsManager.addSkill(skill)
    availableSkills.value = skillsManager.getAllSkills()
    
    // 重置表单
    newSkill.value = { tags: [] }
    newSkillTags.value = ''
    showAddSkillDialog.value = false
  } catch (error) {
    console.error('Failed to add skill:', error)
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// 初始化时的错误处理
onMounted(async () => {
  try {
    await skillsManager.loadAllSkills()
    availableSkills.value = skillsManager.getAllSkills()
  } catch (error) {
    console.error('Failed to load skills:', error)
    // 显示用户友好的错误信息
    alert('Failed to load skills. Please refresh the page.')
  }
})
</script>
```

---

## 九、性能考虑

### 9.1 缓存策略

- **内存缓存**：默认启用，TTL 为 1 小时
- **缓存清理**：支持手动清理或自动过期
- **缓存大小**：建议监控缓存大小，防止内存溢出

```ts
// 定期清理过期缓存
setInterval(() => {
  const now = Date.now()
  for (const [key, { timestamp }] of this.cache.entries()) {
    if (now - timestamp > this.cacheTTL) {
      this.cache.delete(key)
    }
  }
}, 60000)  // 每分钟检查一次
```

### 9.2 懒加载

- **Skill 内容**：按需加载，不在初始化时加载所有内容
- **远程 Skills**：支持分页加载
- **UI 虚拟化**：大量 skills 时使用虚拟滚动

```ts
// 分页加载远程 skills
export class RemoteSkillsLoader implements SkillsLoaderStrategy {
  async load(): Promise<Skill[]> {
    const skills: Skill[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await fetch(
        `${this.sourceUrl}/list?page=${page}&limit=50`
      )
      const data = await response.json()
      skills.push(...data.skills)
      hasMore = data.hasMore
      page++
    }

    return skills
  }
}
```

### 9.3 并发控制

- **加载器并发**：支持并发加载多个来源
- **请求超时**：设置合理的超时时间
- **重试机制**：失败时自动重试

```ts
// 并发加载所有来源
async loadAllSkills(): Promise<void> {
  const results = await Promise.allSettled(
    this.loaders.map(loader => loader.load())
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      result.value.forEach(skill => {
        this.skillsMap.set(skill.id, skill)
      })
    } else {
      console.error(
        `Failed to load skills from ${this.loaders[index].name}:`,
        result.reason
      )
    }
  })
}
```

---

## 十、实现检查清单

### Phase 1（本期）

- [ ] 在 `@opentiny/tiny-robot` 中实现 `TrSkills` 组件
- [ ] 定义 `Skill` 类型和接口
- [ ] 实现 `SkillsManager` 核心类
- [ ] 实现 `LocalSkillsLoader` 和 `RemoteSkillsLoader`
- [ ] 实现 `createSkillsProvider`
- [ ] 创建 `with-skills` 模板
- [ ] 实现基础错误处理
- [ ] 编写文档和示例

### Phase 2（后续）

- [ ] 实现 `IndexedDBSkillsLoader`
- [ ] 添加事件系统（规划中）
- [ ] 实现发现策略接口（规划中）
- [ ] 实现缓存策略接口（规划中）
- [ ] 创建 `with-skills-and-mcp` 模板
- [ ] 创建 `with-skills-and-rag` 模板
- [ ] 创建 `with-skills-and-context` 模板
- [ ] 性能优化和监控

### Phase 3（未来）

- [ ] Skills 市场集成
- [ ] 版本管理系统
- [ ] 依赖解析
- [ ] 自动更新机制
- [ ] 权限和安全管理

