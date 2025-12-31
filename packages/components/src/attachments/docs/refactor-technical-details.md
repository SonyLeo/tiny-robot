# Attachments 组件重构 - 技术细节

> 本文档补充说明重构过程中的关键技术细节和最佳实践

## 一、ID 生成策略

### 问题
原有设计要求用户手动生成 ID，增加使用成本。

### 解决方案
组件内部自动生成 ID，用户输入时 `id` 可选。

```typescript
// 类型定义
export interface Attachment {
  id: string  // 内部必需
  // ...
}

export type PartialAttachment = Partial<Attachment>  // 用户输入时 id 可选

// 标准化逻辑
function normalizeAttachment(input: AttachmentInput): Attachment {
  return {
    id: input.id || generateID(),  // 保留用户的 id，否则自动生成
    // ...
  }
}

function generateID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

### 使用场景

```typescript
// 场景 1：不需要关心 ID（最常见）
const files = ref([
  { url: 'https://example.com/file.pdf', size: 1024 }
  // ✅ 组件自动生成 id
])

// 场景 2：使用后端的 ID
const files = ref([
  { id: 'backend-id-123', url: '...', size: 1024 }
  // ✅ 保留后端的 id
])
```

---

## 二、URL 文件类型检测

### 问题
原有实现无法处理：
1. 查询参数（`?token=xxx`）
2. Hash（`#page=2`）
3. URL 编码
4. 无扩展名的 URL

### 解决方案

#### 1. 改进 URL 解析

```typescript
/**
 * 从 URL 提取文件名
 */
export function extractFileNameFromUrl(url: string): string {
  try {
    // 使用 URL API 解析（自动处理查询参数和 hash）
    const urlObj = new URL(url)
    let pathname = urlObj.pathname
    
    // 解码 URL 编码
    pathname = decodeURIComponent(pathname)
    
    // 提取最后一段路径
    const segments = pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] || 'unknown'
  } catch {
    // 回退逻辑
    const cleanUrl = url.split('?')[0].split('#')[0]
    const fileName = cleanUrl.split('/').pop() || 'unknown'
    try {
      return decodeURIComponent(fileName)
    } catch {
      return fileName
    }
  }
}
```

#### 2. 智能类型检测

```typescript
/**
 * 智能检测文件类型（优先级）
 */
export function detectFileTypeSmart(input: {
  rawFile?: File
  contentType?: string
  name?: string
  url?: string
}): FileType {
  // 优先级 1：从 File 对象检测
  if (input.rawFile?.type) {
    const type = detectFileTypeFromContentType(input.rawFile.type)
    if (type !== 'other') return type
  }
  
  // 优先级 2：从 Content-Type 检测
  if (input.contentType) {
    const type = detectFileTypeFromContentType(input.contentType)
    if (type !== 'other') return type
  }
  
  // 优先级 3：从文件名检测
  if (input.name) {
    const type = detectFileTypeFromName(input.name)
    if (type !== 'other') return type
  }
  
  // 优先级 4：从 URL 检测
  if (input.url) {
    const fileName = extractFileNameFromUrl(input.url)
    return detectFileTypeFromName(fileName)
  }
  
  return 'other'
}

/**
 * 从 Content-Type 检测
 */
function detectFileTypeFromContentType(contentType: string): FileType {
  const type = contentType.toLowerCase().split(';')[0].trim()
  
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf') return 'pdf'
  if (type.includes('word')) return 'word'
  if (type.includes('excel') || type.includes('sheet')) return 'excel'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'ppt'
  
  return 'other'
}

/**
 * 从文件名检测
 */
function detectFileTypeFromName(fileName: string): FileType {
  // 清理文件名（去除查询参数和 hash）
  const cleanName = fileName.split('?')[0].split('#')[0]
  const ext = cleanName.split('.').pop()?.toLowerCase()
  
  if (!ext) return 'other'
  
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
    return 'image'
  }
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  
  return 'other'
}
```

### 最佳实践

**业务侧应该提供完整的元数据**：

```typescript
// ✅ 推荐：从后端 API 获取元数据
const fetchFiles = async () => {
  const response = await fetch('/api/files')
  const data = await response.json()
  
  const files = data.map(file => ({
    id: file.id,
    name: file.fileName,
    size: file.fileSize,
    fileType: file.fileType,      // ✅ 后端提供类型（最可靠）
    contentType: file.mimeType,   // ✅ 后端提供 MIME 类型
    url: file.downloadUrl,
  }))
  
  fileList.value = files
}

// ⚠️ 不推荐：只提供 URL（组件会尝试推测，可能不准确）
const files = ref([
  { url: 'https://api.example.com/download/12345' }
  // ❌ 无法从 URL 推测类型
])
```

---

## 三、类型守卫和标准化

### 类型守卫

```typescript
/**
 * 判断是否为 File 对象
 */
export function isFileInput(input: any): input is File {
  return input instanceof File
}

/**
 * 判断是否为 URL 输入（简化格式）
 */
export function isUrlInput(input: any): input is UrlInput {
  return (
    typeof input === 'object' &&
    'url' in input &&
    typeof input.url === 'string' &&
    !('id' in input) &&      // 没有 id 字段（区分简化格式）
    !('rawFile' in input)    // 没有 rawFile 字段
  )
}

/**
 * 判断是否为部分 Attachment（完整格式）
 */
export function isPartialAttachment(input: any): input is PartialAttachment {
  return (
    typeof input === 'object' &&
    !isFileInput(input) &&
    !isUrlInput(input)
  )
}
```

### 标准化逻辑

```typescript
/**
 * 标准化输入为 Attachment
 */
export function normalizeAttachment(input: AttachmentInput): Attachment {
  // 1. File 对象
  if (isFileInput(input)) {
    return normalizeFileInput(input)
  }
  
  // 2. URL 输入（简化格式）
  if (isUrlInput(input)) {
    return normalizeUrlInput(input)
  }
  
  // 3. 部分 Attachment（完整格式）
  if (isPartialAttachment(input)) {
    return normalizePartialAttachment(input)
  }
  
  // 4. 兜底逻辑（永远不返回 undefined）
  console.warn('[Attachments] Invalid input:', input)
  return {
    id: generateID(),
    name: 'unknown',
    size: 0,
    status: 'error',
    message: '无效的附件数据',
  }
}

function normalizeFileInput(file: File): Attachment {
  return {
    id: generateID(),
    name: file.name,
    size: file.size,
    rawFile: file,
    fileType: detectFileTypeFromFile(file),
    contentType: file.type,
    status: 'success',
  }
}

function normalizeUrlInput(input: UrlInput): Attachment {
  const name = input.name || extractFileNameFromUrl(input.url)
  
  return {
    id: generateID(),
    name,
    size: input.size || 0,
    url: input.url,
    fileType: input.fileType || detectFileTypeSmart({
      contentType: input.contentType,
      name,
      url: input.url,
    }),
    contentType: input.contentType,
    status: 'success',
  }
}

function normalizePartialAttachment(input: PartialAttachment): Attachment {
  return {
    id: input.id || generateID(),  // 保留用户的 id
    name: input.name || 
          input.rawFile?.name || 
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

function extractExtensionFields(input: any): Record<string, any> {
  const knownFields = [
    'id', 'name', 'size', 'fileType', 'url', 'rawFile',
    'status', 'message', 'contentType'
  ]
  
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => !knownFields.includes(key))
  )
}
```

---

## 四、Context 设计模式

### 为什么使用 Context？

1. ✅ **避免 props drilling**：不需要逐层传递 props
2. ✅ **代码更简洁**：子组件直接从 Context 获取状态
3. ✅ **类型安全**：使用 `InjectionKey` 确保类型安全
4. ✅ **易于扩展**：新增状态或方法只需要修改 Context

### Context 定义

```typescript
// attachments-context.ts
import { InjectionKey, Ref, ComputedRef } from 'vue'

export interface AttachmentsContext {
  // 状态（只读）
  items: Readonly<Ref<Attachment[]>>
  disabled: Readonly<Ref<boolean>>
  variant: ComputedRef<'picture' | 'card'>
  
  // 事件处理
  handlers: {
    remove: (item: Attachment) => void
    preview: (item: Attachment) => void
    download: (item: Attachment) => void
    retry: (item: Attachment) => void
  }
  
  // 工具方法
  utils: {
    getFileIcon: (fileType?: FileType) => Component
    formatSize: (size: number) => string
    isImage: (item: Attachment) => boolean
  }
}

export const AttachmentsContextKey: InjectionKey<AttachmentsContext> = 
  Symbol('attachments-context')

export function useAttachmentsContext(): AttachmentsContext {
  const context = inject(AttachmentsContextKey)
  if (!context) {
    throw new Error('useAttachmentsContext must be used within TrAttachments')
  }
  return context
}
```

### 在主容器中提供 Context

```typescript
// TrAttachments.vue
const fileList = ref<Attachment[]>([])

const handlers = {
  remove: (item: Attachment) => { /* ... */ },
  preview: (item: Attachment) => { /* ... */ },
  download: (item: Attachment) => { /* ... */ },
  retry: (item: Attachment) => { /* ... */ },
}

const utils = {
  getFileIcon: (fileType?: FileType) => getFileIconComponent(fileType),
  formatSize: (size: number) => formatFileSize(size),
  isImage: (item: Attachment) => item.fileType === 'image',
}

provide(AttachmentsContextKey, {
  items: readonly(fileList),
  disabled: toRef(props, 'disabled'),
  variant,
  handlers,
  utils,
})
```

### 在子组件中使用 Context

```typescript
// AttachmentItem.vue
const context = useAttachmentsContext()

// 直接使用 Context 中的状态和方法
const isImage = computed(() => context.utils.isImage(props.item))

const handleRemove = () => {
  context.handlers.remove(props.item)
}
```

---

## 五、插槽设计模式

### 插槽层级

```
TrAttachments
└── <slot> (默认插槽 - 完全自定义布局)
    │
    └── AttachmentList
        ├── <slot name="item"> (项插槽 - 自定义每一项)
        │   │
        │   └── AttachmentItem
        │       ├── <slot name="preview"> (预览插槽)
        │       ├── <slot name="icon"> (图标插槽)
        │       ├── <slot name="content"> (内容插槽)
        │       ├── <slot name="status"> (状态插槽)
        │       └── <slot name="actions"> (操作插槽)
        │
        └── <slot name="empty"> (空状态插槽)
```

### 插槽设计原则

1. ✅ **每一层都可以完全替换**
2. ✅ **提供合理的默认实现**
3. ✅ **传递必要的数据和方法**
4. ✅ **保持插槽 API 简洁**

### 插槽使用示例

#### 1. 自定义操作按钮

```vue
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
```

#### 2. 自定义内容显示

```vue
<TrAttachments v-model:items="files">
  <AttachmentList>
    <template #item="{ item }">
      <AttachmentItem :item="item">
        <template #content="{ item, utils }">
          <!-- 自定义内容显示 -->
          <div>
            <h4>{{ item.name }}</h4>
            <p>大小：{{ utils.formatSize(item.size) }}</p>
            <p>类型：{{ item.fileType }}</p>
            <p>上传时间：{{ item.uploadTime }}</p>
          </div>
        </template>
      </AttachmentItem>
    </template>
  </AttachmentList>
</TrAttachments>
```

#### 3. 完全自定义布局

```vue
<TrAttachments v-model:items="files">
  <!-- 完全自定义布局 -->
  <div class="custom-grid">
    <div v-for="item in files" :key="item.id" class="custom-card">
      <img v-if="item.fileType === 'image'" :src="item.url" />
      <div class="custom-info">
        <h3>{{ item.name }}</h3>
        <p>{{ formatFileSize(item.size) }}</p>
      </div>
      <div class="custom-actions">
        <button @click="handleDownload(item)">下载</button>
        <button @click="handleRemove(item)">删除</button>
      </div>
    </div>
  </div>
</TrAttachments>
```

---

## 六、工具函数

### 文件大小格式化

```typescript
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}
```

### 文件图标获取

```typescript
import {
  IconFileImage,
  IconFilePdf,
  IconFileWord,
  IconFileExcel,
  IconFilePpt,
  IconFileOther,
} from '@opentiny/tiny-robot-svgs'

const DefaultIcons: Record<FileType, Component> = {
  image: IconFileImage,
  pdf: IconFilePdf,
  word: IconFileWord,
  excel: IconFileExcel,
  ppt: IconFilePpt,
  other: IconFileOther,
}

export function getFileIconComponent(fileType?: FileType): Component {
  if (!fileType) return DefaultIcons.other
  return DefaultIcons[fileType] || DefaultIcons.other
}
```

---

## 七、测试策略

### 单元测试

```typescript
// normalizer.test.ts
describe('normalizeAttachment', () => {
  it('should normalize File input', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const result = normalizeAttachment(file)
    
    expect(result.id).toBeDefined()
    expect(result.name).toBe('test.pdf')
    expect(result.size).toBe(file.size)
    expect(result.fileType).toBe('pdf')
    expect(result.rawFile).toBe(file)
  })
  
  it('should normalize URL input', () => {
    const input = { url: 'https://example.com/file.pdf', size: 1024 }
    const result = normalizeAttachment(input)
    
    expect(result.id).toBeDefined()
    expect(result.name).toBe('file.pdf')
    expect(result.size).toBe(1024)
    expect(result.fileType).toBe('pdf')
    expect(result.url).toBe(input.url)
  })
  
  it('should preserve user provided id', () => {
    const input = { id: 'custom-id', url: 'https://example.com/file.pdf', size: 1024 }
    const result = normalizeAttachment(input)
    
    expect(result.id).toBe('custom-id')
  })
  
  it('should handle invalid input', () => {
    const result = normalizeAttachment({} as any)
    
    expect(result.id).toBeDefined()
    expect(result.name).toBe('unknown')
    expect(result.size).toBe(0)
    expect(result.status).toBe('error')
  })
})
```

### 组件测试

```typescript
// TrAttachments.test.ts
describe('TrAttachments', () => {
  it('should render file list', () => {
    const files = [
      { url: 'https://example.com/file.pdf', size: 1024 }
    ]
    
    const wrapper = mount(TrAttachments, {
      props: { items: files }
    })
    
    expect(wrapper.find('.tr-attachment-item').exists()).toBe(true)
  })
  
  it('should emit remove event', async () => {
    const files = [
      { url: 'https://example.com/file.pdf', size: 1024 }
    ]
    
    const wrapper = mount(TrAttachments, {
      props: { items: files }
    })
    
    await wrapper.find('.tr-attachment-item__action--remove').trigger('click')
    
    expect(wrapper.emitted('remove')).toBeTruthy()
  })
})
```

---

## 八、性能优化

### 1. 避免不必要的重新渲染

```typescript
// 使用 readonly 包装状态
provide(AttachmentsContextKey, {
  items: readonly(fileList),  // ✅ 防止子组件修改
  // ...
})
```

### 2. 使用 computed 缓存计算结果

```typescript
// 自动检测 variant
const variant = computed(() => {
  if (fileList.value.length === 0) return 'card'
  
  const allSuccessImages = fileList.value.every(
    item => item.fileType === 'image' && 
            item.url && 
            item.status === 'success'
  )
  
  return allSuccessImages ? 'picture' : 'card'
})
```

### 3. 释放 Blob URL

```typescript
// 在组件销毁时释放 Blob URL
onUnmounted(() => {
  fileList.value.forEach(item => {
    if (item.url?.startsWith('blob:')) {
      URL.revokeObjectURL(item.url)
    }
  })
})
```

---

## 九、常见问题

### Q1: 如何处理需要认证的资源？

**A**: 业务侧提供完整的元数据，组件不发起网络请求。

```typescript
// ✅ 正确做法
const files = ref([
  {
    url: 'https://api.example.com/files/12345?token=xxx',
    name: 'document.pdf',
    size: 1024000,
    fileType: 'pdf',        // ✅ 业务侧提供类型
    contentType: 'application/pdf',
  }
])

// ❌ 错误做法
const files = ref([
  {
    url: 'https://api.example.com/files/12345?token=xxx',
    // ❌ 缺少元数据，组件无法准确判断类型
  }
])
```

### Q2: 如何自定义文件图标？

**A**: 通过插槽自定义。

```vue
<TrAttachments v-model:items="files">
  <AttachmentList>
    <template #item="{ item }">
      <AttachmentItem :item="item">
        <template #icon="{ item }">
          <CustomIcon :type="item.fileType" />
        </template>
      </AttachmentItem>
    </template>
  </AttachmentList>
</TrAttachments>
```

### Q3: 如何追踪特定文件？

**A**: 提供自定义 ID。

```typescript
const files = ref([
  {
    id: 'backend-file-id-123',  // ✅ 使用后端的 ID
    url: 'https://example.com/file.pdf',
    size: 1024,
  }
])

// 后续可以通过 id 追踪
const targetFile = files.value.find(f => f.id === 'backend-file-id-123')
```
