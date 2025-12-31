# Phase 1: Attachments 组件重构方案（简化版）

## 目录
- [组件定位](#组件定位)
- [问题分析](#问题分析)
- [业界最佳实践](#业界最佳实践)
- [类型系统重构](#类型系统重构)
- [组件架构设计](#组件架构设计)
- [使用示例](#使用示例)
- [实施步骤](#实施步骤)

---

## 组件定位

### 核心职责

Attachments 是一个**纯展示组件**，职责明确：

✅ **负责：**
- 渲染附件列表（卡片/图片墙）
- 展示文件状态（上传中/成功/失败）
- 提供交互事件（预览/下载/删除/重试）
- 自动检测文件类型和图标
- 图片预览功能

❌ **不负责：**
- 文件上传逻辑（由业务侧实现）
- 文件验证（大小、格式限制等）
- 网络请求
- 状态管理（上传进度、队列等）

### 使用场景示意

```typescript
// 业务侧负责上传
const handleUpload = async (file: File) => {
  // 1. 创建附件对象，状态为 uploading
  const attachment = {
    uid: generateUID(),
    name: file.name,
    size: file.size,
    originFile: file,
    status: 'uploading',
    percent: 0,
  }
  files.value.push(attachment)
  
  // 2. 业务侧执行上传
  try {
    const response = await uploadAPI(file, {
      onProgress: (percent) => {
        // 更新进度
        updateAttachment(attachment.uid, { percent })
      }
    })
    
    // 3. 上传成功，更新状态
    updateAttachment(attachment.uid, {
      status: 'success',
      url: response.url,
      percent: 100,
    })
  } catch (error) {
    // 4. 上传失败，更新状态
    updateAttachment(attachment.uid, {
      status: 'error',
      message: '上传失败',
    })
  }
}

// Attachments 组件只负责渲染
<TrAttachments 
  v-model:items="files"
  @retry="handleRetry"
  @remove="handleRemove"
/>
```

---

## 问题分析

### 当前问题清单

#### 1. 类型定义矛盾 ⭐⭐⭐⭐⭐

```typescript
// ❌ 问题：UrlAttachment 不应该包含 rawFile
interface UrlAttachment extends BaseAttachment {
  url: string
  size: number
  rawFile?: File  // 矛盾！网络文件为什么有本地 File 对象？
}
```

**影响：**
- 无法序列化到 localStorage
- 类型语义不清晰
- 状态转换逻辑混乱

#### 2. normalizeAttachments 存在 undefined 漏洞 ⭐⭐⭐⭐⭐

```typescript
const normalizeAttachments = (items: InputItem[]): Attachment[] => {
  return items.map((item) => {
    if (isUrlSizeItem(item)) {
      return transformUrlItem(item)
    } else if (isRawFileItem(item)) {
      return transformRawFileItem(item)
    }
    // ❌ 没有 return，会返回 undefined！
  }) as Attachment[]
}
```

#### 3. 缺少 UID 机制 ⭐⭐⭐

```typescript
interface BaseAttachment {
  id?: string  // ❌ 可选，可能导致重复或缺失
}
```

#### 4. 组件职责不清 ⭐⭐⭐

当前设计混合了展示和业务逻辑，导致：
- 组件过于复杂
- 难以扩展
- 业务侧不够灵活

---

## 业界最佳实践

### Ant Design Upload 组件

```typescript
interface UploadFile {
  uid: string              // ✅ 必需，唯一标识
  name: string
  status: 'uploading' | 'done' | 'error' | 'removed'
  url?: string
  thumbUrl?: string
  originFileObj?: File     // ✅ 原始文件对象
  response?: any
  error?: any
  percent?: number
}
```

**关键点：**
- 统一的数据结构
- `originFileObj` 表示原始文件
- 组件只负责渲染，不负责上传

### Element Plus Upload 组件

```typescript
interface UploadFile {
  name: string
  url?: string
  status: 'ready' | 'uploading' | 'success' | 'fail'
  raw?: File
  response?: any
  percentage?: number
}
```

**关键点：**
- 使用 `raw` 表示原始文件
- 组件提供钩子，业务侧实现上传

### 对比总结

| 维度 | Ant Design | Element Plus | 当前方案 | 目标方案 |
|------|-----------|--------------|---------|---------|
| 类型设计 | 统一类型 | 统一类型 | 联合类型 | 统一类型 |
| UID 机制 | ✅ 必需 | ❌ 可选 | ❌ 可选 | ✅ 必需 |
| 上传逻辑 | 业务侧 | 业务侧 | 混合 | 业务侧 |
| 组件职责 | 纯展示 | 纯展示 | 混合 | 纯展示 |

---

## 类型系统重构

### 新的统一类型设计（简化版）

```typescript
/**
 * 统一的附件类型
 * 
 * 设计理念：
 * 1. 不再区分 RawFileAttachment 和 UrlAttachment
 * 2. 使用 originFile 表示原始文件对象（可选）
 * 3. url 和 originFile 可以共存
 * 4. 组件只负责渲染，不管理上传状态
 */
export interface Attachment {
  // ============ 核心标识 ============
  uid: string              // ✅ 必需，唯一标识符
  name: string             // 文件名
  
  // ============ 状态相关 ============
  status?: FileStatus      // 'uploading' | 'success' | 'error'，默认 'success'
  message?: string         // 状态提示信息（如"上传中..."、"上传失败"）
  percent?: number         // 上传进度 0-100（可选，由业务侧管理）
  
  // ============ 文件来源 ============
  url?: string             // 文件 URL（网络文件必需，本地文件上传后有）
  originFile?: File        // 原始 File 对象（本地文件有，网络文件没有）
  
  // ============ 元数据 ============
  size: number             // ✅ 必需，文件大小（字节）
  fileType?: FileType      // 文件类型（自动检测，可覆盖）
  
  // ============ 扩展字段 ============
  response?: any           // 服务器响应（业务侧使用）
  error?: any              // 错误信息（业务侧使用）
  [key: string]: any       // 允许业务侧扩展
}

export type FileStatus = 'uploading' | 'success' | 'error'
export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other' | string
```

### 类型守卫（简化版）

```typescript
/**
 * 判断是否为本地文件
 */
export function isLocalFile(att: Attachment): boolean {
  return att.originFile instanceof File
}

/**
 * 判断是否为网络文件
 */
export function isRemoteFile(att: Attachment): boolean {
  return typeof att.url === 'string' && att.url.length > 0
}

/**
 * 判断是否可序列化（没有 File 对象）
 */
export function isSerializable(att: Attachment): boolean {
  return !att.originFile
}
```

### 工具函数（简化版）

```typescript
/**
 * 生成唯一 ID
 */
export function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 转换为可序列化格式（移除 File 对象）
 */
export function toSerializable(att: Attachment): Omit<Attachment, 'originFile'> {
  const { originFile, ...rest } = att
  return rest
}

/**
 * 批量转换为可序列化格式
 */
export function toSerializableList(attachments: Attachment[]): Array<Omit<Attachment, 'originFile'>> {
  return attachments.map(toSerializable)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}
```

**注意：不再提供 `markUploading`、`markSuccess` 等方法，这些是业务逻辑。**

---

## 组件架构设计

### 设计原则

遵循以下核心原则：

1. **拒绝布尔值地狱**：使用配置对象代替多个布尔 props
2. **插槽优先**：组件结构由使用者通过插槽定义
3. **哑容器 + 聪明子组件**：主容器提供结构和状态，子组件独立可复用
4. **Context 共享**：使用 provide/inject 避免 props drilling

### 组件结构（简化版）

```
Attachments (哑容器)
├── AttachmentsContext (Context Provider)
│   ├── items: Ref<Attachment[]>
│   ├── config: { disabled, variant }
│   └── events: { onRemove, onPreview, onDownload, onRetry }
│
└── <slot name="default">
    └── AttachmentList (默认布局)
        └── <slot name="item" v-for="item">
            └── AttachmentItem (聪明子组件)
                ├── <slot name="icon">
                ├── <slot name="content">
                ├── <slot name="actions">
                └── <slot name="status">
```

### Context 设计（简化版）

```typescript
// attachments-context.ts
export interface AttachmentsContext {
  // 状态（只读）
  items: Readonly<Ref<Attachment[]>>
  
  // 配置（只读）
  config: {
    disabled: Readonly<Ref<boolean>>
    variant: Readonly<Ref<'picture' | 'card' | 'auto'>>
  }
  
  // 事件（由业务侧处理）
  emit: {
    remove: (uid: string) => void
    preview: (uid: string) => void
    download: (uid: string) => void
    retry: (uid: string) => void
  }
  
  // 工具方法
  utils: {
    getFileIcon: (fileType?: FileType) => Component
    formatSize: (size: number) => string
    isImage: (item: Attachment) => boolean
  }
}

export const AttachmentsContextKey: InjectionKey<AttachmentsContext> = Symbol('attachments')

export function useAttachmentsContext(): AttachmentsContext {
  const context = inject(AttachmentsContextKey)
  if (!context) {
    throw new Error('useAttachmentsContext must be used within Attachments component')
  }
  return context
}
```

### 主容器组件（哑容器）

```vue
<!-- Attachments.vue -->
<script setup lang="ts">
import { provide, computed, toRef } from 'vue'
import { AttachmentsContextKey } from './attachments-context'
import AttachmentList from './AttachmentList.vue'

interface Props {
  items?: Attachment[]
  disabled?: boolean
  variant?: 'picture' | 'card' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  disabled: false,
  variant: 'auto',
})

const emit = defineEmits<{
  'update:items': [items: Attachment[]]
  'remove': [uid: string]
  'preview': [uid: string]
  'download': [uid: string]
  'retry': [uid: string]
}>()

// 内部状态（响应式）
const fileList = ref<Attachment[]>([])

// 监听 props 变化
watch(() => props.items, (newItems) => {
  if (newItems) {
    // 简单验证：确保有 uid 和 size
    fileList.value = newItems.map(item => ({
      uid: item.uid || generateUID(),
      status: item.status || 'success',
      ...item,
    }))
  }
}, { deep: true, immediate: true })

// 提供 Context（简化版）
provide(AttachmentsContextKey, {
  items: readonly(fileList),
  
  config: {
    disabled: toRef(props, 'disabled'),
    variant: toRef(props, 'variant'),
  },
  
  emit: {
    remove: (uid: string) => {
      const index = fileList.value.findIndex(item => item.uid === uid)
      if (index !== -1) {
        fileList.value.splice(index, 1)
        emit('update:items', fileList.value)
        emit('remove', uid)
      }
    },
    preview: (uid: string) => emit('preview', uid),
    download: (uid: string) => emit('download', uid),
    retry: (uid: string) => emit('retry', uid),
  },
  
  utils: {
    getFileIcon: (fileType) => getFileIconComponent(fileType),
    formatSize: (size) => formatFileSize(size),
    isImage: (item) => item.fileType === 'image',
  },
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
```

### 列表组件（聪明子组件）

```vue
<!-- AttachmentList.vue -->
<script setup lang="ts">
import { useAttachmentsContext } from './attachments-context'
import AttachmentItem from './AttachmentItem.vue'

const context = useAttachmentsContext()

// 自动检测展示模式
const actualVariant = computed(() => {
  if (context.config.variant.value !== 'auto') {
    return context.config.variant.value
  }
  
  // 全部是图片且有 URL → picture
  const allImages = context.items.value.every(
    item => context.utils.isImage(item) && item.url
  )
  return allImages ? 'picture' : 'card'
})
</script>

<template>
  <div 
    v-if="context.items.value.length > 0"
    :class="['tr-attachment-list', `tr-attachment-list--${actualVariant}`]"
  >
    <!-- 项插槽：允许自定义每一项 -->
    <slot 
      v-for="item in context.items.value" 
      :key="item.uid"
      name="item"
      :item="item"
      :variant="actualVariant"
    >
      <!-- 默认使用 AttachmentItem -->
      <AttachmentItem :item="item" :variant="actualVariant" />
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
  gap: 8px;
  
  &--card {
    flex-direction: column;
  }
  
  &--picture {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
```

### 项组件（聪明子组件）

```vue
<!-- AttachmentItem.vue -->
<script setup lang="ts">
import { useAttachmentsContext } from './attachments-context'

interface Props {
  item: Attachment
  variant: 'picture' | 'card'
}

const props = defineProps<Props>()
const context = useAttachmentsContext()

const handleRemove = () => {
  if (!context.config.disabled.value) {
    context.emit.remove(props.item.uid)
  }
}

const handlePreview = () => {
  context.emit.preview(props.item.uid)
}

const handleDownload = () => {
  context.emit.download(props.item.uid)
}

const handleRetry = () => {
  context.emit.retry(props.item.uid)
}
</script>

<template>
  <div :class="['tr-attachment-item', `tr-attachment-item--${variant}`]">
    <!-- 图标插槽 -->
    <div class="tr-attachment-item__icon">
      <slot name="icon" :item="item">
        <component :is="context.utils.getFileIcon(item.fileType)" />
      </slot>
    </div>
    
    <!-- 内容插槽 -->
    <div class="tr-attachment-item__content">
      <slot name="content" :item="item">
        <div class="tr-attachment-item__name">{{ item.name }}</div>
        <div class="tr-attachment-item__size">
          {{ context.utils.formatSize(item.size) }}
        </div>
      </slot>
    </div>
    
    <!-- 状态插槽 -->
    <div v-if="item.status !== 'success'" class="tr-attachment-item__status">
      <slot name="status" :item="item">
        <div v-if="item.status === 'uploading'" class="tr-attachment-item__uploading">
          <IconLoading />
          <span v-if="item.percent">{{ item.percent }}%</span>
          <span v-if="item.message">{{ item.message }}</span>
        </div>
        <div v-else-if="item.status === 'error'" class="tr-attachment-item__error">
          <IconError />
          <span v-if="item.message">{{ item.message }}</span>
        </div>
      </slot>
    </div>
    
    <!-- 操作插槽 -->
    <div class="tr-attachment-item__actions">
      <slot 
        name="actions" 
        :item="item"
        :handlers="{ handlePreview, handleDownload, handleRetry, handleRemove }"
      >
        <!-- 默认操作按钮 -->
        <button 
          v-if="context.utils.isImage(item) && item.url"
          @click="handlePreview"
        >
          预览
        </button>
        <button v-if="item.url" @click="handleDownload">下载</button>
        <button v-if="item.status === 'error'" @click="handleRetry">重试</button>
        <button 
          v-if="!context.config.disabled.value"
          @click="handleRemove"
        >
          删除
        </button>
      </slot>
    </div>
  </div>
</template>
```

---

## 使用示例

### 示例 1：基础用法（业务侧管理上传）

```vue
<template>
  <div>
    <!-- 上传按钮 -->
    <input type="file" @change="handleFileSelect" multiple />
    
    <!-- 附件列表 -->
    <TrAttachments 
      v-model:items="files"
      @retry="handleRetry"
      @remove="handleRemove"
      @download="handleDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateUID } from '@opentiny/tiny-robot'

const files = ref<Attachment[]>([])

// 业务侧：处理文件选择
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  
  for (const file of selectedFiles) {
    // 创建附件对象
    const attachment: Attachment = {
      uid: generateUID(),
      name: file.name,
      size: file.size,
      originFile: file,
      status: 'uploading',
      percent: 0,
      message: '上传中...',
    }
    
    files.value.push(attachment)
    
    // 业务侧：执行上传
    await uploadFile(attachment)
  }
}

// 业务侧：上传逻辑
const uploadFile = async (attachment: Attachment) => {
  try {
    const formData = new FormData()
    formData.append('file', attachment.originFile!)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    // 上传成功
    updateAttachment(attachment.uid, {
      status: 'success',
      url: data.url,
      percent: 100,
      message: undefined,
    })
  } catch (error) {
    // 上传失败
    updateAttachment(attachment.uid, {
      status: 'error',
      message: '上传失败',
    })
  }
}

// 业务侧：更新附件
const updateAttachment = (uid: string, updates: Partial<Attachment>) => {
  const index = files.value.findIndex(f => f.uid === uid)
  if (index !== -1) {
    files.value[index] = { ...files.value[index], ...updates }
  }
}

// 业务侧：重试上传
const handleRetry = (uid: string) => {
  const attachment = files.value.find(f => f.uid === uid)
  if (attachment) {
    updateAttachment(uid, { status: 'uploading', percent: 0 })
    uploadFile(attachment)
  }
}

// 业务侧：删除附件
const handleRemove = (uid: string) => {
  console.log('Removed:', uid)
}

// 业务侧：下载附件
const handleDownload = (uid: string) => {
  const attachment = files.value.find(f => f.uid === uid)
  if (attachment?.url) {
    window.open(attachment.url, '_blank')
  }
}
</script>
```

### 示例 2：自定义项渲染

```vue
<template>
  <TrAttachments v-model:items="files">
    <template #item="{ item, variant }">
      <div class="custom-item">
        <img v-if="variant === 'picture'" :src="item.url" />
        <div v-else>
          <FileIcon :type="item.fileType" />
          <span>{{ item.name }}</span>
          <span v-if="item.status === 'uploading'">
            {{ item.percent }}%
          </span>
        </div>
      </div>
    </template>
  </TrAttachments>
</template>
```

### 示例 3：自定义操作按钮

```vue
<template>
  <TrAttachments v-model:items="files">
    <AttachmentList>
      <template #item="{ item, variant }">
        <AttachmentItem :item="item" :variant="variant">
          <template #actions="{ handlers }">
            <button @click="handlers.handleDownload">下载</button>
            <button @click="handleShare(item)">分享</button>
            <button @click="handlers.handleRemove">删除</button>
          </template>
        </AttachmentItem>
      </template>
    </AttachmentList>
  </TrAttachments>
</template>

<script setup lang="ts">
const handleShare = (item: Attachment) => {
  navigator.share({ url: item.url })
}
</script>
```

### 示例 4：序列化到 localStorage

```vue
<script setup lang="ts">
import { toSerializableList } from '@opentiny/tiny-robot'

// 保存到 localStorage
const saveToStorage = () => {
  const serializable = toSerializableList(files.value)
  localStorage.setItem('attachments', JSON.stringify(serializable))
}

// 从 localStorage 恢复
const loadFromStorage = () => {
  const data = localStorage.getItem('attachments')
  if (data) {
    files.value = JSON.parse(data)
  }
}
</script>
```

---

## 实施步骤

### Step 1: 类型系统重构（向后兼容）

1. 新增统一的 `Attachment` 类型
2. 标记旧类型为 `@deprecated`
3. 导出简化的工具函数（generateUID, toSerializable, formatFileSize）

### Step 2: Context 设计

1. 创建 `attachments-context.ts`
2. 实现 `useAttachmentsContext` hook
3. 保持简单，只提供必要的状态和方法

### Step 3: 组件重构

1. 重构 `Attachments.vue`（哑容器）
   - 移除上传相关逻辑
   - 提供 Context
   - 支持默认插槽

2. 创建 `AttachmentList.vue`（聪明子组件）
   - 自动检测 variant
   - 提供 item 插槽
   - 提供 empty 插槽

3. 重构 `AttachmentItem.vue`（聪明子组件）
   - 使用 Context
   - 提供多个插槽（icon, content, status, actions）
   - 移除业务逻辑

### Step 4: 文档和示例

1. 更新 API 文档
2. 添加业务侧上传示例
3. 说明组件职责边界
4. 提供迁移指南

### Step 5: 测试和发布

1. 单元测试（只测试渲染逻辑）
2. 集成测试
3. 发布 beta 版本收集反馈

---

## 总结

### 简化后的优势

1. **职责清晰** ✅
   - 组件只负责渲染
   - 业务侧负责上传

2. **更易使用** ✅
   - 不需要学习复杂的 Helper 类
   - 直接操作数据即可

3. **更灵活** ✅
   - 业务侧完全控制上传逻辑
   - 可以使用任何上传库

4. **符合设计原则** ✅
   - 拒绝布尔值地狱
   - 插槽优先
   - 哑容器 + 聪明子组件
   - Context 共享

### 与旧版本对比

| 维度 | 旧版本 | 新版本 |
|------|--------|--------|
| 组件职责 | 渲染 + 部分上传逻辑 | 纯渲染 |
| 工具类 | 复杂（markUploading等） | 简单（序列化、格式化） |
| 使用难度 | 中等 | 简单 |
| 灵活性 | 中等 | 高 |
| 代码量 | 多 | 少 |
| 学习成本 | 高 | 低 |

### 核心改进点

1. **类型统一**：不再区分 RawFileAttachment 和 UrlAttachment
2. **职责分离**：组件只渲染，业务侧管理上传
3. **插槽丰富**：提供多个插槽支持自定义
4. **Context 共享**：避免 props drilling
5. **工具简化**：只提供必要的工具函数
