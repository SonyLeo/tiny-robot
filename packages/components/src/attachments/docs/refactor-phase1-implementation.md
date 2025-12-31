# Attachments 组件重构实施方案

> **设计哲学**：组合优于配置 (Composition over Configuration)

## 核心设计原则

1. **拒绝布尔值地狱**：避免使用大量布尔 props 控制渲染
2. **插槽优先**：组件结构由使用者通过插槽定义
3. **哑容器 + 聪明子组件**：主容器提供结构和状态，子组件独立可复用
4. **Context 共享**：使用 provide/inject 避免 props drilling

---

## 一、组件架构设计

### 1.1 组件层级结构

```
TrAttachments (哑容器 - 状态管理)
├── Context Provider (provide 状态和方法)
│
└── <slot> (默认插槽 - 完全可定制)
    │
    └── AttachmentList (默认布局 - 可替换)
        │
        └── <slot name="item"> (项插槽 - 可定制)
            │
            └── AttachmentItem (聪明子组件 - 可替换)
                ├── <slot name="preview"> (预览插槽)
                ├── <slot name="content"> (内容插槽)
                ├── <slot name="actions"> (操作插槽)
                └── <slot name="status"> (状态插槽)
```

**设计理念**：
- ✅ 每一层都可以通过插槽完全替换
- ✅ 默认提供合理的实现，零配置可用
- ✅ 渐进式定制，按需覆盖

---

### 1.2 Context 设计

```typescript
// attachments-context.ts
import { InjectionKey, Ref, ComputedRef } from 'vue'

/**
 * Attachments Context
 * 
 * 通过 provide/inject 共享状态和方法，避免 props drilling
 */
export interface AttachmentsContext {
  // ========== 状态（只读） ==========
  items: Readonly<Ref<Attachment[]>>
  
  // ========== 配置（只读） ==========
  disabled: Readonly<Ref<boolean>>
  variant: ComputedRef<'picture' | 'card'>  // 自动计算，不暴露 'auto'
  
  // ========== 事件处理 ==========
  handlers: {
    remove: (item: Attachment) => void
    preview: (item: Attachment) => void
    download: (item: Attachment) => void
    retry: (item: Attachment) => void
  }
  
  // ========== 工具方法 ==========
  utils: {
    getFileIcon: (fileType?: FileType) => Component
    formatSize: (size: number) => string
    isImage: (item: Attachment) => boolean
  }
}

export const AttachmentsContextKey: InjectionKey<AttachmentsContext> = 
  Symbol('attachments-context')

/**
 * 使用 Context（在子组件中调用）
 */
export function useAttachmentsContext(): AttachmentsContext {
  const context = inject(AttachmentsContextKey)
  if (!context) {
    throw new Error('useAttachmentsContext must be used within TrAttachments')
  }
  return context
}
```

---

## 二、类型系统设计

### 2.1 核心类型定义

```typescript
// types.ts

/**
 * 附件类型（统一、简洁）
 */
export interface Attachment {
  // 核心字段
  id: string               // 内部必需，用户输入时可选（自动生成）
  name: string
  size: number
  
  // 可选字段
  status?: 'uploading' | 'success' | 'error'
  message?: string
  
  url?: string             // 网络文件有，本地文件可能没有
  rawFile?: File           // 本地文件有，网络文件没有
  
  fileType?: FileType      // 自动检测，可覆盖
  contentType?: string     // MIME 类型（业务侧提供）
  
  // 扩展字段
  [key: string]: any
}

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'other' | string
export type FileStatus = 'uploading' | 'success' | 'error'

/**
 * 用户输入类型（支持多种格式）
 */
export type AttachmentInput = 
  | File                    // 格式 1：直接传 File 对象
  | UrlInput                // 格式 2：简化格式 { url, name?, size? }
  | PartialAttachment       // 格式 3：完整格式（任意字段组合）

export interface UrlInput {
  url: string
  name?: string
  size?: number
  fileType?: FileType
  contentType?: string
}

export type PartialAttachment = Partial<Attachment>
```

**设计要点**：
- ✅ 统一的 `Attachment` 类型，不再区分 `UrlAttachment` 和 `RawFileAttachment`
- ✅ `id` 在内部必需，用户输入时可选（组件自动生成）
- ✅ 支持多种输入格式，降低使用门槛

---

### 2.2 标准化逻辑

```typescript
// normalizer.ts

/**
 * 标准化输入为 Attachment
 * 
 * 核心逻辑：
 * 1. 自动生成缺失的 id
 * 2. 智能提取文件名、大小、类型
 * 3. 永远不返回 undefined（兜底逻辑）
 */
export function normalizeAttachment(input: AttachmentInput): Attachment {
  // 1. File 对象
  if (input instanceof File) {
    return {
      id: generateID(),
      name: input.name,
      size: input.size,
      rawFile: input,
      fileType: detectFileTypeFromFile(input),
      status: 'success',
    }
  }
  
  // 2. URL 输入（简化格式）
  if (isUrlInput(input)) {
    return {
      id: generateID(),
      name: input.name || extractFileNameFromUrl(input.url),
      size: input.size || 0,
      url: input.url,
      fileType: input.fileType || 
                (input.contentType ? detectFileTypeFromContentType(input.contentType) : 
                 detectFileTypeFromName(input.name || input.url)),
      contentType: input.contentType,
      status: 'success',
    }
  }
  
  // 3. 部分 Attachment（完整格式）
  return {
    id: input.id || generateID(),  // 保留用户的 id
    name: input.name || input.rawFile?.name || 
          (input.url ? extractFileNameFromUrl(input.url) : 'unknown'),
    size: input.size || input.rawFile?.size || 0,
    fileType: input.fileType || detectFileTypeSmart(input),
    url: input.url,
    rawFile: input.rawFile,
    status: input.status || 'success',
    message: input.message,
    contentType: input.contentType,
    // 保留其他扩展字段
    ...extractExtensionFields(input),
  }
}

/**
 * 类型守卫
 */
function isUrlInput(input: any): input is UrlInput {
  return (
    typeof input === 'object' &&
    'url' in input &&
    !('id' in input) &&
    !('rawFile' in input)
  )
}

/**
 * 生成唯一 ID
 */
function generateID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

---

## 三、组件实现

### 3.1 主容器组件（哑容器）

```vue
<!-- TrAttachments.vue -->
<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import { AttachmentsContextKey } from './attachments-context'
import { normalizeAttachment } from './normalizer'
import AttachmentList from './AttachmentList.vue'
import type { Attachment, AttachmentInput } from './types'

interface Props {
  items?: AttachmentInput[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  disabled: false,
})

const emit = defineEmits<{
  'update:items': [items: Attachment[]]
  'remove': [item: Attachment]
  'preview': [item: Attachment]
  'download': [item: Attachment]
  'retry': [item: Attachment]
}>()

// ========== 内部状态 ==========
const fileList = ref<Attachment[]>([])

// 监听输入变化，自动标准化
watch(() => props.items, (newItems) => {
  if (newItems) {
    fileList.value = newItems.map(normalizeAttachment)
  }
}, { deep: true, immediate: true })

// 监听内部变化，同步回父组件
watch(fileList, (newList) => {
  emit('update:items', newList)
}, { deep: true })

// ========== 自动检测 variant ==========
const variant = computed(() => {
  if (fileList.value.length === 0) return 'card'
  
  // 全部是成功状态的图片 → picture
  const allSuccessImages = fileList.value.every(
    item => item.fileType === 'image' && 
            item.url && 
            item.status === 'success'
  )
  
  return allSuccessImages ? 'picture' : 'card'
})

// ========== 事件处理 ==========
const handlers = {
  remove: (item: Attachment) => {
    if (props.disabled) return
    const index = fileList.value.findIndex(f => f.id === item.id)
    if (index !== -1) {
      fileList.value.splice(index, 1)
      emit('remove', item)
    }
  },
  preview: (item: Attachment) => emit('preview', item),
  download: (item: Attachment) => emit('download', item),
  retry: (item: Attachment) => emit('retry', item),
}

// ========== 工具方法 ==========
const utils = {
  getFileIcon: (fileType?: FileType) => getFileIconComponent(fileType),
  formatSize: (size: number) => formatFileSize(size),
  isImage: (item: Attachment) => item.fileType === 'image',
}

// ========== 提供 Context ==========
provide(AttachmentsContextKey, {
  items: readonly(fileList),
  disabled: toRef(props, 'disabled'),
  variant,
  handlers,
  utils,
})
</script>

<template>
  <div class="tr-attachments">
    <!-- 默认插槽：允许完全自定义布局 -->
    <slot>
      <!-- 默认使用 AttachmentList -->
      <AttachmentList />
    </slot>
  </div>
</template>

<style scoped>
.tr-attachments {
  position: relative;
}
</style>
```

**设计要点**：
- ✅ 只有 2 个 props：`items` 和 `disabled`（拒绝布尔值地狱）
- ✅ `variant` 自动计算，不暴露给用户
- ✅ 通过 Context 共享状态和方法
- ✅ 默认插槽允许完全自定义布局

---

### 3.2 列表组件（默认布局）

```vue
<!-- AttachmentList.vue -->
<script setup lang="ts">
import { useAttachmentsContext } from './attachments-context'
import AttachmentItem from './AttachmentItem.vue'

const context = useAttachmentsContext()
</script>

<template>
  <div 
    v-if="context.items.value.length > 0"
    :class="['tr-attachment-list', `tr-attachment-list--${context.variant.value}`]"
  >
    <!-- 项插槽：允许自定义每一项 -->
    <slot 
      v-for="item in context.items.value" 
      :key="item.id"
      name="item"
      :item="item"
      :variant="context.variant.value"
      :handlers="context.handlers"
      :utils="context.utils"
    >
      <!-- 默认使用 AttachmentItem -->
      <AttachmentItem :item="item" />
    </slot>
  </div>
  
  <!-- 空状态插槽 -->
  <div v-else class="tr-attachment-list--empty">
    <slot name="empty">
      <p class="tr-attachment-list__empty-text">暂无附件</p>
    </slot>
  </div>
</template>

<style scoped>
.tr-attachment-list {
  display: flex;
  gap: 12px;
  
  &--card {
    flex-direction: column;
  }
  
  &--picture {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.tr-attachment-list--empty {
  padding: 24px;
  text-align: center;
  color: #999;
}
</style>
```

**设计要点**：
- ✅ 从 Context 获取状态，无需 props
- ✅ 提供 `item` 插槽，允许自定义每一项
- ✅ 提供 `empty` 插槽，允许自定义空状态

---

### 3.3 项组件（聪明子组件）

```vue
<!-- AttachmentItem.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useAttachmentsContext } from './attachments-context'
import type { Attachment } from './types'

interface Props {
  item: Attachment
}

const props = defineProps<Props>()
const context = useAttachmentsContext()

// 是否显示操作按钮（悬浮时）
const showActions = ref(false)

// 是否是图片
const isImage = computed(() => context.utils.isImage(props.item))

// 图片预览 URL
const previewUrl = computed(() => {
  if (!isImage.value) return null
  return props.item.url || (props.item.rawFile ? URL.createObjectURL(props.item.rawFile) : null)
})
</script>

<template>
  <div 
    :class="[
      'tr-attachment-item',
      `tr-attachment-item--${context.variant.value}`,
      `tr-attachment-item--${item.status || 'success'}`
    ]"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- 预览插槽（图片模式） -->
    <div v-if="context.variant.value === 'picture'" class="tr-attachment-item__preview">
      <slot name="preview" :item="item" :url="previewUrl">
        <img v-if="previewUrl" :src="previewUrl" :alt="item.name" />
        <component v-else :is="context.utils.getFileIcon(item.fileType)" />
      </slot>
    </div>
    
    <!-- 图标（卡片模式） -->
    <div v-else class="tr-attachment-item__icon">
      <slot name="icon" :item="item">
        <component :is="context.utils.getFileIcon(item.fileType)" />
      </slot>
    </div>
    
    <!-- 内容插槽 -->
    <div class="tr-attachment-item__content">
      <slot name="content" :item="item" :utils="context.utils">
        <div class="tr-attachment-item__name" :title="item.name">
          {{ item.name }}
        </div>
        <div class="tr-attachment-item__size">
          {{ context.utils.formatSize(item.size) }}
        </div>
      </slot>
    </div>
    
    <!-- 状态插槽 -->
    <div v-if="item.status && item.status !== 'success'" class="tr-attachment-item__status">
      <slot name="status" :item="item">
        <div v-if="item.status === 'uploading'" class="tr-attachment-item__uploading">
          <IconLoading class="tr-attachment-item__loading-icon" />
          <span v-if="item.message">{{ item.message }}</span>
        </div>
        <div v-else-if="item.status === 'error'" class="tr-attachment-item__error">
          <IconError class="tr-attachment-item__error-icon" />
          <span v-if="item.message">{{ item.message }}</span>
        </div>
      </slot>
    </div>
    
    <!-- 操作插槽 -->
    <div 
      v-if="item.status === 'success' || item.status === 'error'"
      v-show="showActions || item.status === 'error'"
      class="tr-attachment-item__actions"
    >
      <slot 
        name="actions" 
        :item="item" 
        :handlers="context.handlers"
        :is-image="isImage"
      >
        <!-- 默认操作：图片显示预览+下载，其他文件显示下载 -->
        <button 
          v-if="isImage && item.url"
          class="tr-attachment-item__action"
          @click="context.handlers.preview(item)"
        >
          预览
        </button>
        <button 
          v-if="item.url"
          class="tr-attachment-item__action"
          @click="context.handlers.download(item)"
        >
          下载
        </button>
        <button 
          v-if="item.status === 'error'"
          class="tr-attachment-item__action tr-attachment-item__action--retry"
          @click="context.handlers.retry(item)"
        >
          重试
        </button>
        <button 
          v-if="!context.disabled.value"
          class="tr-attachment-item__action tr-attachment-item__action--remove"
          @click="context.handlers.remove(item)"
        >
          删除
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.tr-attachment-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
  
  &--picture {
    flex-direction: column;
    width: 120px;
    height: 120px;
    padding: 8px;
  }
  
  &--uploading {
    opacity: 0.6;
  }
  
  &--error {
    border-color: #ef4444;
  }
}

.tr-attachment-item__preview {
  width: 100%;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.tr-attachment-item__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tr-attachment-item__content {
  flex: 1;
  min-width: 0;
}

.tr-attachment-item__name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-attachment-item__size {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.tr-attachment-item__actions {
  display: flex;
  gap: 8px;
}

.tr-attachment-item__action {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
    border-color: #3b82f6;
  }
  
  &--retry {
    color: #f59e0b;
    
    &:hover {
      background: #fffbeb;
      border-color: #f59e0b;
    }
  }
  
  &--remove {
    color: #ef4444;
    
    &:hover {
      background: #fef2f2;
      border-color: #ef4444;
    }
  }
}
</style>
```

**设计要点**：
- ✅ 从 Context 获取所有需要的状态和方法
- ✅ 提供 4 个插槽：`preview`、`icon`、`content`、`status`、`actions`
- ✅ 默认实现合理的交互逻辑（悬浮显示操作按钮）
- ✅ 图片自动显示预览+下载，其他文件显示下载

---

## 四、使用示例

### 4.1 零配置使用（最简单）

```vue
<template>
  <TrAttachments v-model:items="files" />
</template>

<script setup lang="ts">
const files = ref([
  { url: 'https://example.com/file.pdf', size: 1024 },
  { url: 'https://example.com/image.jpg', size: 2048 },
])
</script>
```

---

### 4.2 自定义操作按钮

```vue
<template>
  <TrAttachments v-model:items="files">
    <AttachmentList>
      <template #item="{ item, handlers }">
        <AttachmentItem :item="item">
          <template #actions="{ item, handlers, isImage }">
            <!-- 完全自定义操作按钮 -->
            <button v-if="isImage" @click="handlers.preview(item)">预览</button>
            <button @click="handlers.download(item)">下载</button>
            <button @click="handleShare(item)">分享</button>
            <button @click="handlers.remove(item)">删除</button>
          </template>
        </AttachmentItem>
      </template>
    </AttachmentList>
  </TrAttachments>
</template>
```

---

### 4.3 完全自定义布局

```vue
<template>
  <TrAttachments v-model:items="files">
    <!-- 完全自定义布局 -->
    <div class="custom-layout">
      <div v-for="item in files" :key="item.id" class="custom-item">
        <img v-if="item.fileType === 'image'" :src="item.url" />
        <span>{{ item.name }}</span>
        <button @click="handleRemove(item)">删除</button>
      </div>
    </div>
  </TrAttachments>
</template>
```

---

## 五、实施步骤

### Step 1: 类型系统重构
- [ ] 定义统一的 `Attachment` 类型
- [ ] 定义 `AttachmentInput` 类型（支持多种格式）
- [ ] 实现 `normalizeAttachment` 函数
- [ ] 实现类型守卫和工具函数

### Step 2: Context 设计
- [ ] 定义 `AttachmentsContext` 接口
- [ ] 实现 `useAttachmentsContext` hook
- [ ] 确保类型安全（使用 `InjectionKey`）

### Step 3: 组件重构
- [ ] 重构 `TrAttachments.vue`（哑容器）
- [ ] 创建 `AttachmentList.vue`（默认布局）
- [ ] 重构 `AttachmentItem.vue`（聪明子组件）
- [ ] 移除所有布尔 props，改用插槽

### Step 4: 工具函数优化
- [ ] 优化 URL 解析逻辑（`extractFileNameFromUrl`）
- [ ] 优化文件类型检测（`detectFileTypeSmart`）
- [ ] 实现 ID 自动生成逻辑

### Step 5: 测试和文档
- [ ] 单元测试（类型守卫、标准化逻辑）
- [ ] 组件测试（渲染、交互）
- [ ] 更新 API 文档
- [ ] 提供迁移指南

---

## 六、优势总结

| 维度 | 原有方案 | 新方案 |
|------|---------|--------|
| **Props 数量** | 10+ | 2 |
| **布尔 Props** | 5+ | 0 |
| **可定制性** | 中等（通过 props） | 高（通过插槽） |
| **学习成本** | 高（需要理解所有 props） | 低（零配置可用） |
| **代码复杂度** | 高 | 低 |
| **可维护性** | 中等 | 高 |

---

## 七、关键改进点

1. ✅ **拒绝布尔值地狱**：只有 2 个 props（`items` 和 `disabled`）
2. ✅ **插槽优先**：每一层都可以通过插槽完全替换
3. ✅ **哑容器 + 聪明子组件**：职责清晰，易于理解
4. ✅ **Context 共享**：避免 props drilling，代码更简洁
5. ✅ **自动化**：`variant` 自动计算，`id` 自动生成
6. ✅ **渐进式复杂度**：零配置可用，按需定制

---

## 八、迁移指南

### 原有代码
```vue
<TrAttachments 
  v-model:items="files"
  variant="card"
  :wrap="true"
  :disabled="false"
  :actions="customActions"
  :file-icons="customIcons"
  :file-matchers="customMatchers"
/>
```

### 新代码（零配置）
```vue
<TrAttachments v-model:items="files" />
```

### 新代码（自定义操作）
```vue
<TrAttachments v-model:items="files">
  <AttachmentList>
    <template #item="{ item, handlers }">
      <AttachmentItem :item="item">
        <template #actions="{ item, handlers }">
          <!-- 自定义操作按钮 -->
        </template>
      </AttachmentItem>
    </template>
  </AttachmentList>
</TrAttachments>
```
