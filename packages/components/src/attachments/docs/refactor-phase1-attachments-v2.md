# Phase 1: Attachments 组件重构方案（简化版）

## 目录
- [组件定位](#组件定位)
- [问题分析](#问题分析)
- [业界最佳实践](#业界最佳实践)
- [类型系统重构](#类型系统重构)
- [Actions 操作按钮系统设计](#actions-操作按钮系统设计)
- [FileTypeConfig 文件类型配置系统](#filetypeconfig-文件类型配置系统)
- [组件架构设计](#组件架构设计)
- [Composables 优化方案](#composables-优化方案)
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
    id: generateID(),
    name: file.name,
    size: file.size,
    rawFile: file,
    status: 'uploading',
    message: '上传中...',
  }
  files.value.push(attachment)
  
  // 2. 业务侧执行上传
  try {
    const response = await uploadAPI(file)
    
    // 3. 上传成功，更新状态
    updateAttachment(attachment.id, {
      status: 'success',
      url: response.url,
      message: undefined,
    })
  } catch (error) {
    // 4. 上传失败，更新状态
    updateAttachment(attachment.id, {
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

#### 3. ID 机制 ⭐⭐⭐

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

**注意：** Ant Design 使用 `uid` 作为唯一标识，但我们保持 `id` 命名以向后兼容。

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
| ID 机制 | ✅ 必需 | ❌ 可选 | ❌ 可选 | ✅ 必需 |
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
export interface Attachment {
  // ============ 核心标识 ============
  id: string               // ✅ 必需，唯一标识符
  name: string             // 文件名
  
  // ============ 状态相关 ============
  status?: FileStatus      // 'uploading' | 'success' | 'error'，默认 'success'
  message?: string         // 状态提示信息（如"上传中..."、"上传失败"）
  
  // ============ 文件来源 ============
  url?: string             // 文件 URL（网络文件必需，本地文件上传后有）
  rawFile?: File           // 原始 File 对象（本地文件有，网络文件没有）
  
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
  return att.rawFile instanceof File
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
  return !att.rawFile
}
```

### 工具函数（简化版）

```typescript
/**
 * 生成唯一 ID
 */
export function generateID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 转换为可序列化格式（移除 File 对象）
 */
export function toSerializable(att: Attachment): Omit<Attachment, 'rawFile'> {
  const { rawFile, ...rest } = att
  return rest
}

/**
 * 批量转换为可序列化格式
 */
export function toSerializableList(attachments: Attachment[]): Array<Omit<Attachment, 'rawFile'>> {
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

## Actions 操作按钮系统设计

### 设计目标

1. **渐进式配置**：零配置可用，按需配置
2. **符合直觉**：图片高频操作内置，其他文件按需配置
3. **灵活性高**：支持全局配置、按类型配置、插槽自定义

### 核心原则

| 文件类型 | 默认行为 | 说明 |
|---------|---------|------|
| **图片（Image）** | 内置预览+下载 | 高频场景，开箱即用 |
| **其他文件** | 不显示操作 | 由业务侧按需配置 |
| **重试按钮** | 所有类型内置 | Error 状态始终显示 |

---

### 交互逻辑

#### 图片类型（Image）- 卡片模式

| 状态 | 未悬浮显示 | 悬浮显示 | 说明 |
|------|-----------|---------|------|
| **Success** | `IMAGE  3.50 MB` | `预览  下载` | 高频操作，悬浮显示 |
| **Uploading** | `上传中...` | - | 无操作 |
| **Error** | `上传失败  重试` | - | 重试按钮始终显示 |

#### 其他文件类型（PDF/Word/Excel等）- 卡片模式

| 状态 | 未悬浮显示 | 悬浮显示 | 说明 |
|------|-----------|---------|------|
| **Success** | `PDF  2.30 MB` | （无） | 需业务侧配置 |
| **Uploading** | `上传中...` | - | 无操作 |
| **Error** | `上传失败  重试` | - | 重试按钮始终显示 |

---

### 类型定义

```typescript
/**
 * 操作按钮配置
 */
interface ActionButton {
  type: string                          // 操作类型（preview, download, retry 等）
  label: string                         // 按钮文本
  trigger?: 'hover' | 'always'          // 触发时机，默认 'hover'
  handler?: (file: Attachment) => void  // 自定义处理函数（可选）
}

/**
 * 按状态配置操作按钮
 */
interface ActionConfig {
  success?: ActionButton[]    // 成功状态的操作
  uploading?: ActionButton[]  // 上传中状态的操作
  error?: ActionButton[]      // 失败状态的操作
}

/**
 * 组件 Props
 */
interface AttachmentListProps {
  items?: Attachment[]
  disabled?: boolean
  variant?: 'picture' | 'card' | 'auto'
  wrap?: boolean
  
  /**
   * 按文件类型配置操作按钮（优先级高）
   * 
   * @example
   * actionsByType: {
   *   pdf: {
   *     success: [
   *       { type: 'download', label: '下载', trigger: 'hover' },
   *       { type: 'print', label: '打印', trigger: 'hover' }
   *     ]
   *   }
   * }
   */
  actionsByType?: Record<FileType, ActionConfig>
  
  /**
   * 全局操作按钮（应用到所有文件类型，优先级低）
   * 
   * @example
   * actions: [
   *   { type: 'download', label: '下载', trigger: 'hover' }
   * ]
   */
  actions?: ActionButton[]
}
```

---

### 默认行为

```typescript
// 组件内置默认行为
const DEFAULT_ACTIONS = {
  // 图片类型：内置预览+下载
  image: {
    success: [
      { type: 'preview', label: '预览', trigger: 'hover' },
      { type: 'download', label: '下载', trigger: 'hover' },
    ],
    error: [
      { type: 'retry', label: '重试', trigger: 'always' },
    ],
  },
  
  // 其他文件类型：默认不显示操作
  other: {
    success: [],  // 不显示任何操作
    error: [
      { type: 'retry', label: '重试', trigger: 'always' },
    ],
  },
}
```

---

### 使用示例

#### 示例 1：零配置（使用默认行为）

```vue
<template>
  <TrAttachments v-model:items="files" />
</template>

<script setup lang="ts">
const files = ref<Attachment[]>([
  { url: 'image.jpg', size: 1024, fileType: 'image' },  // 悬浮显示：预览 下载
  { url: 'doc.pdf', size: 2048, fileType: 'pdf' },      // 不显示任何操作
])
</script>
```

---

#### 示例 2：为特定文件类型配置操作

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :actions-by-type="{
      pdf: {
        success: [
          { type: 'download', label: '下载', trigger: 'hover' },
          { type: 'print', label: '打印', trigger: 'hover' }
        ]
      },
      word: {
        success: [
          { type: 'download', label: '下载', trigger: 'hover' },
          { type: 'edit', label: '编辑', trigger: 'hover', handler: handleEdit }
        ]
      }
    }"
  />
</template>

<script setup lang="ts">
const handleEdit = (file: Attachment) => {
  console.log('编辑文件:', file)
}
</script>
```

---

#### 示例 3：全局配置（应用到所有文件）

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :actions="[
      { type: 'download', label: '下载', trigger: 'hover' },
      { type: 'share', label: '分享', trigger: 'hover', handler: handleShare }
    ]"
  />
</template>

<script setup lang="ts">
// 结果：
// - 图片：预览 下载 分享（默认 + 全局）
// - 其他文件：下载 分享（全局）
</script>
```

---

#### 示例 4：覆盖图片的默认行为

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :actions-by-type="{
      image: {
        success: [
          { type: 'preview', label: '预览', trigger: 'hover' },
          { type: 'download', label: '下载', trigger: 'hover' },
          { type: 'share', label: '分享', trigger: 'hover' }
        ]
      }
    }"
  />
</template>

<script setup lang="ts">
// 结果：图片显示 预览 下载 分享（覆盖默认）
</script>
```

---

#### 示例 5：完全自定义（插槽）

```vue
<template>
  <TrAttachments v-model:items="files">
    <AttachmentList>
      <template #item="{ item, variant }">
        <AttachmentItem :item="item" :variant="variant">
          <template #actions="{ item, handlers }">
            <!-- 完全自定义逻辑 -->
            <button v-if="item.fileType === 'pdf'" @click="handlePrint(item)">
              打印
            </button>
            <button @click="handlers.handleDownload">
              下载
            </button>
          </template>
        </AttachmentItem>
      </template>
    </AttachmentList>
  </TrAttachments>
</template>
```

---

### 优先级规则

```
插槽自定义 > actionsByType > actions > 默认行为
```

**示例：**
```vue
<TrAttachments 
  :actions="[{ type: 'download', label: '下载' }]"
  :actions-by-type="{
    pdf: {
      success: [{ type: 'print', label: '打印' }]
    }
  }"
>
  <template #actions="{ item }">
    <!-- 插槽优先级最高 -->
  </template>
</TrAttachments>

<!-- 结果：
  - 如果有插槽：使用插槽
  - 如果没有插槽：
    - PDF：使用 actionsByType（打印）
    - 图片：使用默认行为（预览 下载）+ actions（下载）
    - 其他：使用 actions（下载）
-->
```

---

### Trigger 机制

```typescript
interface ActionButton {
  trigger?: 'hover' | 'always'  // 默认 'hover'
}

// 渲染逻辑
const shouldShowAction = (action: ActionButton, isHovered: boolean) => {
  if (action.trigger === 'always') return true
  if (action.trigger === 'hover') return isHovered
  return isHovered  // 默认 hover
}
```

**效果：**
- `trigger: 'hover'`：悬浮时显示（默认）
- `trigger: 'always'`：始终显示（如重试按钮）

---

### 内置操作类型

组件内置处理以下操作类型：

```typescript
const BUILT_IN_ACTIONS = {
  preview: (file: Attachment) => {
    // 触发 preview 事件
    emit('preview', file)
  },
  download: (file: Attachment) => {
    // 触发 download 事件
    emit('download', file)
  },
  retry: (file: Attachment) => {
    // 触发 retry 事件
    emit('retry', file)
  },
  remove: (file: Attachment) => {
    // 触发 remove 事件
    emit('remove', file)
  },
}

// 如果 action.handler 存在，优先使用自定义 handler
// 否则使用内置处理
```

---

### 完整的交互矩阵

| 文件类型 | 状态 | 未悬浮 | 悬浮 | 配置方式 |
|---------|------|--------|------|---------|
| **Image** | Success | 类型+大小 | 预览 下载 | 内置默认 |
| **Image** | Uploading | 上传中... | - | 内置默认 |
| **Image** | Error | 上传失败 重试 | - | 内置默认 |
| **PDF** | Success | 类型+大小 | （无） | 需配置 actionsByType |
| **PDF** | Error | 上传失败 重试 | - | 内置默认 |
| **Word** | Success | 类型+大小 | （无） | 需配置 actionsByType |
| **Word** | Error | 上传失败 重试 | - | 内置默认 |
| **其他** | Success | 类型+大小 | （无） | 需配置 actions 或 actionsByType |
| **其他** | Error | 上传失败 重试 | - | 内置默认 |

---

### 设计优势

1. ✅ **渐进式复杂度**：零配置可用，按需配置
2. ✅ **符合直觉**：图片高频操作内置，其他文件按需配置
3. ✅ **灵活性高**：支持全局配置、按类型配置、插槽自定义
4. ✅ **向后兼容**：保留原有的 actions 概念，扩展为 actionsByType
5. ✅ **类型安全**：完整的 TypeScript 类型定义

---

## FileTypeConfig 文件类型配置系统

### 设计目标

1. **统一配置**：合并原有的 `fileIcons` 和 `fileMatchers` 为一个配置
2. **渐进式复杂度**：简单场景用对象，复杂场景用数组
3. **灵活性高**：`matcher` 可选，不提供则使用默认逻辑

### 问题分析

**原有方案的问题：**

```typescript
// 问题 1：配置分散
fileIcons: { pdf: CustomPdfIcon }
fileMatchers: [{ type: 'pdf', matcher: ..., icon: ... }]

// 问题 2：功能重叠
// fileIcons 只能配置图标
// fileMatchers 可以配置图标 + 匹配逻辑

// 问题 3：优先级不明确
// 如果同时配置了 fileIcons 和 fileMatchers，哪个优先？
```

---

### 类型定义

```typescript
/**
 * 文件类型配置项（完整模式）
 */
interface FileTypeConfigItem {
  type: string                                    // 文件类型标识（必需）
  icon?: Component                                // 自定义图标（可选）
  matcher?: (file: File | string) => boolean      // 自定义匹配函数（可选）
  label?: string                                  // 类型显示名称（可选，如 "PDF文档"）
}

/**
 * 文件类型配置
 * 
 * 支持两种格式：
 * 1. 对象格式（简化模式）：只覆盖图标，使用默认匹配逻辑
 * 2. 数组格式（完整模式）：支持自定义匹配逻辑
 */
type FileTypeConfig = 
  | Record<string, Component>                     // 简化模式：类型 -> 图标
  | FileTypeConfigItem[]                          // 完整模式：完整配置数组

/**
 * 组件 Props
 */
interface AttachmentListProps {
  items?: Attachment[]
  disabled?: boolean
  variant?: 'picture' | 'card' | 'auto'
  wrap?: boolean
  
  // Actions 配置
  actions?: ActionButton[]
  actionsByType?: Record<FileType, ActionConfig>
  
  /**
   * 文件类型配置
   * 
   * @example
   * // 简化模式：只覆盖图标
   * fileTypeConfig: {
   *   pdf: CustomPdfIcon,
   *   word: CustomWordIcon
   * }
   * 
   * @example
   * // 完整模式：自定义类型 + 匹配逻辑
   * fileTypeConfig: [
   *   {
   *     type: 'markdown',
   *     icon: IconMarkdown,
   *     matcher: (file) => file.endsWith('.md'),
   *     label: 'Markdown文档'
   *   }
   * ]
   */
  fileTypeConfig?: FileTypeConfig
}
```

---

### 使用示例

#### 示例 1：简化模式（只覆盖图标）

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :file-type-config="{
      pdf: CustomPdfIcon,
      word: CustomWordIcon,
      excel: CustomExcelIcon
    }"
  />
</template>

<script setup lang="ts">
import { CustomPdfIcon, CustomWordIcon, CustomExcelIcon } from './icons'

// 使用默认的匹配逻辑
// 只覆盖图标显示
</script>
```

**效果：**
- PDF 文件使用 `CustomPdfIcon`
- Word 文件使用 `CustomWordIcon`
- Excel 文件使用 `CustomExcelIcon`
- 其他文件类型使用默认图标

---

#### 示例 2：完整模式（新增自定义类型）

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :file-type-config="[
      {
        type: 'markdown',
        icon: IconMarkdown,
        matcher: (file) => {
          if (typeof file === 'string') {
            return file.endsWith('.md') || file.endsWith('.markdown')
          }
          return file.name.endsWith('.md') || file.name.endsWith('.markdown')
        },
        label: 'Markdown文档'
      },
      {
        type: 'zip',
        icon: IconZip,
        matcher: (file) => {
          if (typeof file === 'string') {
            return /\.(zip|rar|7z)$/i.test(file)
          }
          return /\.(zip|rar|7z)$/i.test(file.name)
        },
        label: '压缩包'
      }
    ]"
  />
</template>

<script setup lang="ts">
import { IconMarkdown, IconZip } from './icons'

// 新增自定义文件类型
// 提供完整的匹配逻辑
</script>
```

**效果：**
- `.md` 和 `.markdown` 文件识别为 `markdown` 类型
- `.zip`、`.rar`、`.7z` 文件识别为 `zip` 类型
- 显示自定义图标

---

#### 示例 3：覆盖默认类型的图标

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :file-type-config="[
      {
        type: 'pdf',
        icon: CustomPdfIcon,
        // 不提供 matcher，使用默认的 PDF 匹配逻辑
      },
      {
        type: 'image',
        icon: CustomImageIcon,
        // 不提供 matcher，使用默认的图片匹配逻辑
      }
    ]"
  />
</template>

<script setup lang="ts">
// 只覆盖图标，保留默认匹配逻辑
</script>
```

---

#### 示例 4：扩展默认类型的匹配逻辑

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :file-type-config="[
      {
        type: 'image',
        matcher: (file) => {
          // 扩展默认的图片匹配逻辑，支持更多格式
          if (typeof file === 'string') {
            return /\.(png|jpg|jpeg|gif|webp|bmp|svg|ico|tiff)$/i.test(file)
          }
          return file.type?.startsWith('image/') || 
                 /\.(png|jpg|jpeg|gif|webp|bmp|svg|ico|tiff)$/i.test(file.name)
        },
        // 不提供 icon，使用默认图标
      }
    ]"
  />
</template>

<script setup lang="ts">
// 扩展匹配逻辑，支持 .ico 和 .tiff 格式
</script>
```

---

### 内部处理逻辑

#### 1. 配置标准化

```typescript
// ============================================
// composables/useFileTypeDetector.ts
// ============================================
export function useFileTypeDetector(config?: FileTypeConfig) {
  // 标准化配置为数组格式
  const normalizedConfig = computed(() => {
    if (!config) return []
    
    // 如果是对象格式（简化模式），转换为数组格式
    if (!Array.isArray(config)) {
      return Object.entries(config).map(([type, icon]) => ({
        type,
        icon,
        // 不提供 matcher，后续使用默认匹配逻辑
      }))
    }
    
    // 已经是数组格式（完整模式）
    return config
  })
  
  // 合并自定义配置和默认匹配器
  const allMatchers = computed(() => {
    // 提取有 matcher 的自定义配置
    const customMatchers = normalizedConfig.value
      .filter(item => item.matcher)
      .map(item => ({
        type: item.type,
        matcher: item.matcher!,
        icon: item.icon,
      }))
    
    // ✅ 自定义匹配器优先（放在前面）
    return [...customMatchers, ...defaultMatchers]
  })
  
  const detectFileType = (file: File | string): FileType => {
    for (const matcher of allMatchers.value) {
      if (matcher.matcher(file)) {
        return matcher.type
      }
    }
    return 'other'
  }
  
  return { detectFileType }
}
```

---

#### 2. 图标获取

```typescript
// ============================================
// composables/useFileIcon.ts
// ============================================
export function useFileIcon(
  fileType: MaybeRefOrGetter<FileType>,
  config?: FileTypeConfig
) {
  // 标准化配置
  const normalizedConfig = computed(() => {
    if (!config) return []
    
    // 对象格式转数组
    if (!Array.isArray(config)) {
      return Object.entries(config).map(([type, icon]) => ({
        type,
        icon,
      }))
    }
    
    return config
  })
  
  return computed(() => {
    const type = toValue(fileType)
    
    // 1. 优先使用自定义图标
    const customIcon = normalizedConfig.value.find(item => item.type === type)?.icon
    if (customIcon) return customIcon
    
    // 2. 使用默认图标
    return DefaultIcons[type as BaseFileType] || DefaultIcons.other
  })
}
```

---

### 优先级规则

```
自定义配置 > 默认配置
```

**详细说明：**

1. **匹配逻辑优先级**：
   ```
   自定义 matcher > 默认 matcher
   ```
   - 自定义匹配器在数组前面，优先匹配
   - 如果自定义匹配器返回 true，不再检查默认匹配器

2. **图标优先级**：
   ```
   自定义 icon > 默认 icon
   ```
   - 先查找自定义配置中的图标
   - 找不到再使用默认图标

---

### 内置文件类型

组件内置以下文件类型及其匹配逻辑：

| 类型 | 扩展名 | 说明 |
|------|--------|------|
| `image` | png, jpg, jpeg, gif, webp, bmp, svg | 图片文件 |
| `pdf` | pdf | PDF 文档 |
| `word` | doc, docx | Word 文档 |
| `excel` | xls, xlsx | Excel 表格 |
| `ppt` | ppt, pptx | PowerPoint 演示文稿 |
| `folder` | - | 文件夹（特殊类型） |
| `other` | - | 其他未知类型 |

---

### 配置对比

| 维度 | 旧方案 | 新方案 |
|------|--------|--------|
| **配置数量** | 2 个（fileIcons + fileMatchers） | 1 个（fileTypeConfig） |
| **简单场景** | `fileIcons: { pdf: Icon }` | `fileTypeConfig: { pdf: Icon }` |
| **复杂场景** | `fileMatchers: [...]` | `fileTypeConfig: [...]` |
| **学习成本** | 中等（需要理解两个配置） | 低（只需要一个配置） |
| **灵活性** | 中等 | 高 |
| **优先级** | 不明确 | 明确（自定义优先） |

---

### 设计优势

1. ✅ **统一配置**：不再分散为 `fileIcons` 和 `fileMatchers`
2. ✅ **渐进式复杂度**：简单场景用对象，复杂场景用数组
3. ✅ **向后兼容**：对象格式兼容原来的 `fileIcons`
4. ✅ **灵活性高**：`matcher` 可选，不提供则使用默认逻辑
5. ✅ **类型安全**：完整的 TypeScript 类型定义
6. ✅ **优先级明确**：自定义配置始终优先于默认配置

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
  'remove': [file: Attachment]
  'preview': [file: Attachment]
  'download': [file: Attachment]
  'retry': [file: Attachment]
}>()

// 内部状态（响应式）
const fileList = ref<Attachment[]>([])

// 监听 props 变化
watch(() => props.items, (newItems) => {
  if (newItems) {
    // 简单验证：确保有 id 和 size
    fileList.value = newItems.map(item => ({
      id: item.id || generateID(),
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
    remove: (file: Attachment) => {
      const index = fileList.value.findIndex(item => item.id === file.id)
      if (index !== -1) {
        fileList.value.splice(index, 1)
        emit('update:items', fileList.value)
        emit('remove', file)
      }
    },
    preview: (file: Attachment) => emit('preview', file),
    download: (file: Attachment) => emit('download', file),
    retry: (file: Attachment) => emit('retry', file),
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
      :key="item.id"
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
    context.emit.remove(props.item)
  }
}

const handlePreview = () => {
  context.emit.preview(props.item)
}

const handleDownload = () => {
  context.emit.download(props.item)
}

const handleRetry = () => {
  context.emit.retry(props.item)
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

## Composables 优化方案

### 现状分析

基于对现有 composables 的分析，参考 Bubble 组件的 Context 设计模式，我们需要对以下文件进行优化：

#### 1. useFileType.ts - ⚠️ 需要重构

**存在问题：**

1. **职责过多**：混合了多个不相关的功能
   - 文件类型检测
   - 图标获取
   - ID 生成
   - 文件大小格式化
   - 数据标准化（normalizeAttachments）

2. **normalizeAttachments 存在 undefined 漏洞**
   ```typescript
   return items.map((item) => {
     if (isUrlSizeItem(item)) {
       return transformUrlItem(item)
     } else if (isRawFileItem(item)) {
       return transformRawFileItem(item)
     }
     // ❌ 没有 return，会返回 undefined！
   }) as Attachment[]
   ```

3. **类型守卫不完整**：缺少对 `Partial<Attachment>` 的处理

4. **返回 ComputedRef 不合理**：`getIconComponent` 返回 `ComputedRef<Component>`，但调用者可能不需要响应式

#### 2. useListType.ts - ✅ 基本合理，小优化

**存在问题：**

1. **检测逻辑可以更严谨**：应该检查图片是否有 `url` 和 `status`

#### 3. useFileCard.ts - ✅ 设计良好，小优化

**存在问题：**

1. **下载逻辑可以提取**：`downloadLocalFile` 可以独立为工具函数

#### 4. useImagePreview.ts - ⏸️ 暂不处理

**说明：**

- 后期会独立为 ImagePreview 组件，不属于 Attachments 的核心职责
- 避免重复工作，等待独立组件重构时一并处理

---

### 优化方案

#### 方案概述

参考 Bubble 组件的设计模式，采用**轻量级 Context 方案**：

1. **分层的 Context 系统**
   - `setupXxx()` - 在容器组件提供配置
   - `useXxx()` - 在子组件中消费配置
   - 使用 `MaybeRefOrGetter` 支持响应式

2. **职责分离**
   - 拆分 `useFileType.ts` 为多个独立的 composables
   - 提取纯工具函数到 `utils/` 目录

3. **类型安全**
   - 使用 `InjectionKey` 确保类型安全
   - 修复 undefined 漏洞

---

### 详细优化计划

#### 1. 拆分 useFileType.ts

**拆分为 4 个文件：**

```typescript
// ============================================
// 📁 composables/useFileTypeDetector.ts
// 职责：文件类型检测
// ============================================
export function useFileTypeDetector(customMatchers?: FileTypeMatcher[]) {
  const allMatchers = computed(() => {
    return customMatchers 
      ? [...customMatchers, ...defaultMatchers]
      : defaultMatchers
  })
  
  const detectFileType = (file: File | string): FileType => {
    for (const matcher of allMatchers.value) {
      if (matcher.matcher(file)) {
        return matcher.type
      }
    }
    return 'other'
  }
  
  return { detectFileType }
}

// ============================================
// 📁 composables/useFileIcon.ts
// 职责：图标获取
// ============================================
export function useFileIcon(
  fileType: MaybeRefOrGetter<FileType>,
  options?: {
    customIcons?: Record<string, Component>
    fileMatchers?: FileTypeMatcher[]
  }
) {
  return computed(() => {
    const type = toValue(fileType)
    
    // 1. 优先使用自定义图标
    if (options?.customIcons?.[type]) {
      return options.customIcons[type]
    }
    
    // 2. 查找匹配器中的图标
    if (options?.fileMatchers) {
      const matcher = options.fileMatchers.find(m => m.type === type)
      if (matcher?.icon) return matcher.icon
    }
    
    // 3. 使用默认图标
    return DefaultIcons[type as BaseFileType] || DefaultIcons.other
  })
}

// ============================================
// 📁 composables/useAttachmentNormalizer.ts
// 职责：数据标准化
// ============================================
export function useAttachmentNormalizer(options?: {
  fileMatchers?: FileTypeMatcher[]
}) {
  const { detectFileType } = useFileTypeDetector(options?.fileMatchers)
  
  const normalizeAttachments = (items: InputItem[]): Attachment[] => {
    return items
      .map((item) => {
        if (isUrlSizeItem(item)) {
          return transformUrlItem(item)
        } else if (isRawFileItem(item)) {
          return transformRawFileItem(item)
        } else if (isPartialAttachment(item)) {
          // ✅ 修复：处理 Partial<Attachment>
          return transformPartialItem(item)
        }
        // ✅ 修复：返回 null 而不是 undefined
        console.warn('[Attachments] Invalid item:', item)
        return null
      })
      .filter(Boolean) as Attachment[] // ✅ 过滤掉 null
  }
  
  // ✅ 新增：处理 Partial<Attachment>
  const isPartialAttachment = (item: InputItem): item is Partial<Attachment> => {
    return !isUrlSizeItem(item) && !isRawFileItem(item)
  }
  
  const transformPartialItem = (item: Partial<Attachment>): Attachment | null => {
    // 必须有 name 或 url
    if (!item.name && !item.url) {
      return null
    }
    
    const common = getCommonProps(item)
    return {
      ...common,
      name: common.name || item.url?.split('/').pop() || 'unknown',
      size: item.size || 0,
      fileType: item.fileType || detectFileType(item.name || item.url || ''),
      url: item.url,
      originFile: item.originFile,
    } as Attachment
  }
  
  return { normalizeAttachments }
}

// ============================================
// 📁 utils/fileHelpers.ts
// 职责：纯工具函数
// ============================================
export function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

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

---

#### 2. 优化 useListType.ts

```typescript
export function useListType(
  fileList: Ref<Attachment[]>, 
  variant?: DisplayVariant
) {
  const actualVariant = computed(() => {
    // 明确指定且不是 auto，直接使用
    if (variant && variant !== 'auto') {
      return variant
    }
    
    // 空列表默认 card
    if (fileList.value.length === 0) {
      return 'card'
    }
    
    // ✅ 更严谨：检查是否所有文件都是可展示的图片
    const allValidImages = fileList.value.every(
      (file) => 
        file.fileType === 'image' && 
        file.url && // 必须有 URL
        file.status === 'success' // 必须上传成功
    )
    
    return allValidImages ? 'picture' : 'card'
  })
  
  return { actualVariant }
}
```

---

#### 3. 优化 useFileCard.ts

```typescript
// ============================================
// 📁 utils/download.ts
// 职责：下载逻辑
// ============================================
export function downloadLocalFile(url: string, fileName: string): void {
  if (!url.startsWith('blob:') && !url.startsWith('data:')) {
    console.warn('[Attachments] downloadLocalFile only supports blob: or data: URLs')
    return
  }
  
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  
  requestAnimationFrame(() => {
    link.click()
    document.body.removeChild(link)
  })
}

// ============================================
// 📁 composables/useFileCard.ts
// 优化：使用独立的下载工具函数
// ============================================
import { downloadLocalFile } from '../utils/download'

export function useFileCard(props: FileCardProps, emit: FileCardEmits) {
  // ... 其他代码不变
  
  const handleDownload = (event: MouseEvent) => {
    emit('download', event, props.file)
    if (event.defaultPrevented) return
    
    // 对于本地文件，执行内部下载逻辑
    if (props.file.originFile && !props.file.url) {
      const blobUrl = createBlobUrl(props.file.originFile)
      downloadLocalFile(blobUrl, props.file.name || props.file.originFile.name)
    }
  }
  
  return {
    isImage,
    handlePreview,
    handleDownload, // ✅ 改名：downloadFile -> handleDownload
    handleRemove,
    handleRetry,
    handleCustomAction,
  }
}
```

---

#### 4. 新增 Context 管理

```typescript
// ============================================
// 📁 constants.ts
// 职责：InjectionKey 定义
// ============================================
import { InjectionKey, MaybeRefOrGetter } from 'vue'

export const ATTACHMENTS_CONFIG_KEY: InjectionKey<MaybeRefOrGetter<AttachmentsConfig>> = 
  Symbol('attachments-config')

export const ATTACHMENTS_ITEMS_KEY: InjectionKey<MaybeRefOrGetter<Attachment[]>> = 
  Symbol('attachments-items')

export const ATTACHMENTS_EMIT_KEY: InjectionKey<AttachmentsEmitFn> = 
  Symbol('attachments-emit')

// ============================================
// 📁 composables/useAttachmentsContext.ts
// 职责：Context 管理（参考 Bubble 设计）
// ============================================
export interface AttachmentsConfig {
  disabled: boolean
  variant: 'picture' | 'card' | 'auto'
}

export interface AttachmentsEmitFn {
  remove: (file: Attachment) => void
  preview: (file: Attachment) => void
  download: (file: Attachment) => void
  retry: (file: Attachment) => void
}

// Setup Functions（在容器组件中使用）
export function setupAttachmentsConfig(config: MaybeRefOrGetter<AttachmentsConfig>): void {
  provide(ATTACHMENTS_CONFIG_KEY, config)
}

export function setupAttachmentsItems(items: MaybeRefOrGetter<Attachment[]>): void {
  provide(ATTACHMENTS_ITEMS_KEY, items)
}

export function setupAttachmentsEmit(emitFn: AttachmentsEmitFn): void {
  provide(ATTACHMENTS_EMIT_KEY, emitFn)
}

// Use Functions（在子组件中使用）
export function useAttachmentsConfig(): ComputedRef<AttachmentsConfig> {
  const config = inject(ATTACHMENTS_CONFIG_KEY, undefined)
  if (!config) {
    throw new Error('useAttachmentsConfig must be used within Attachments component')
  }
  return computed(() => toValue(config))
}

export function useAttachmentsItems(): ComputedRef<Attachment[]> {
  const items = inject(ATTACHMENTS_ITEMS_KEY, undefined)
  if (!items) {
    throw new Error('useAttachmentsItems must be used within Attachments component')
  }
  return computed(() => toValue(items))
}

export function useAttachmentsEmit(): AttachmentsEmitFn {
  const emitFn = inject(ATTACHMENTS_EMIT_KEY, undefined)
  if (!emitFn) {
    throw new Error('useAttachmentsEmit must be used within Attachments component')
  }
  return emitFn
}
```

---

### 优化后的目录结构

```
attachments/
├── composables/
│   ├── index.ts
│   ├── useAttachmentsContext.ts      // ✨ 新增：Context 管理
│   ├── useFileTypeDetector.ts        // ✨ 拆分自 useFileType
│   ├── useFileIcon.ts                // ✨ 拆分自 useFileType
│   ├── useAttachmentNormalizer.ts    // ✨ 拆分自 useFileType
│   ├── useListType.ts                // ✅ 优化
│   ├── useFileCard.ts                // ✅ 优化
│   └── useImagePreview.ts            // ⏸️ 保持不变
├── utils/
│   ├── fileHelpers.ts                // ✨ 新增：工具函数
│   └── download.ts                   // ✨ 新增：下载逻辑
├── constants.ts                      // ✨ 新增：InjectionKey
└── ...
```

---

### 优化收益

#### 1. 职责清晰

- 每个 composable 只负责一个功能
- 工具函数独立，易于测试和复用

#### 2. 类型安全

- 使用 `InjectionKey` 确保类型安全
- 修复 undefined 漏洞

#### 3. 易于维护

- 代码结构清晰，易于理解
- 参考 Bubble 的成熟设计模式

#### 4. 向后兼容

- 保持现有 API 不变
- 逐步迁移，降低风险

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
import { generateID } from '@opentiny/tiny-robot'

const files = ref<Attachment[]>([])

// 业务侧：处理文件选择
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  
  for (const file of selectedFiles) {
    // 创建附件对象
    const attachment: Attachment = {
      id: generateID(),
      name: file.name,
      size: file.size,
      rawFile: file,
      status: 'uploading',
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
    formData.append('file', attachment.rawFile!)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    // 上传成功
    updateAttachment(attachment.id, {
      status: 'success',
      url: data.url,
      message: undefined,
    })
  } catch (error) {
    // 上传失败
    updateAttachment(attachment.id, {
      status: 'error',
      message: '上传失败',
    })
  }
}

// 业务侧：更新附件
const updateAttachment = (id: string, updates: Partial<Attachment>) => {
  const index = files.value.findIndex(f => f.id === id)
  if (index !== -1) {
    files.value[index] = { ...files.value[index], ...updates }
  }
}

// 业务侧：重试上传
const handleRetry = (file: Attachment) => {
  updateAttachment(file.id, { status: 'uploading', message: '上传中...' })
  uploadFile(file)
}

// 业务侧：删除附件
const handleRemove = (file: Attachment) => {
  console.log('Removed:', file)
}

// 业务侧：下载附件
const handleDownload = (file: Attachment) => {
  if (file.url) {
    window.open(file.url, '_blank')
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
            {{ item.message }}
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
