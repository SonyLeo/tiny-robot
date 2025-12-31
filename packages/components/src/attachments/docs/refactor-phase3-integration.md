# Phase 3: 组件整合设计（简化版）

## 目录
- [整合目标](#整合目标)
- [架构设计](#架构设计)
- [类型系统对齐](#类型系统对齐)
- [Attachments 与 ImagePreview 的集成](#attachments-与-imagepreview-的集成)
- [完整使用示例](#完整使用示例)
- [迁移指南](#迁移指南)
- [性能优化](#性能优化)

---

## 整合目标

### 核心目标

1. **Attachments 内部使用 ImagePreview 组件**：复用图片预览能力
2. **保持独立性**：ImagePreview 组件可以独立使用
3. **统一体验**：预览交互保持一致
4. **类型对齐**：Attachment 和 PreviewImage 类型无缝转换

### 整合原则

- ✅ 组件职责清晰：Attachments 管理文件列表，ImagePreview 负责图片预览
- ✅ 避免重复代码：预览逻辑由 ImagePreview 组件提供
- ✅ 配置简化：使用配置对象，避免布尔值地狱
- ✅ 插槽透传：Attachments 的预览插槽透传给 ImagePreview
- ✅ 类型简单：Attachment → PreviewImage 转换清晰

---

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Attachments (哑容器)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            AttachmentsContext (Provider)              │  │
│  │  - items: Ref<Attachment[]>                          │  │
│  │  - config: { disabled, variant }                     │  │
│  │  - emit: { remove, preview, download, retry }        │  │
│  │  - utils: { getFileIcon, formatSize, isImage }       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AttachmentList (聪明子组件)               │  │
│  │  ├── AttachmentItem (card 模式)                       │  │
│  │  │   ├── <slot name="icon">                          │  │
│  │  │   ├── <slot name="content">                       │  │
│  │  │   ├── <slot name="status">                        │  │
│  │  │   └── <slot name="actions">                       │  │
│  │  │                                                     │  │
│  │  └── AttachmentItem (picture 模式)                    │  │
│  │      ├── <img> 缩略图                                  │  │
│  │      ├── 状态遮罩 (uploading/error)                   │  │
│  │      └── 删除按钮                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         ImagePreview (Teleport to body) ✨            │  │
│  │  - 点击 picture 模式的图片触发                         │  │
│  │  - 自动收集所有成功的图片附件                          │  │
│  │  - 支持左右切换、缩略图、键盘导航                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 ImagePreview (独立组件)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      ImagePreviewContext (Provider)                   │  │
│  │  - currentIndex: Ref<number>                          │  │
│  │  - images: PreviewImage[]                             │  │
│  │  - currentImage: ComputedRef<PreviewImage>            │  │
│  │  - prev(), next(), goTo(), close()                    │  │
│  │  - hasPrev, hasNext                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ├── <slot name="toolbar"> (预留)                            │
│  ├── ImageViewer (主图区域)                                  │
│  │   ├── <slot name="navigation"> (左右按钮)                │
│  │   └── <slot name="content"> (图片内容)                   │
│  └── <slot name="thumbnails"> (缩略图)                       │
└─────────────────────────────────────────────────────────────┘
```

### 设计要点

1. **Attachments 组件**：
   - 纯展示组件，不管理上传逻辑
   - 使用统一的 `Attachment` 类型
   - 通过 Context 共享状态和方法
   - 自动检测 variant（picture/card）

2. **ImagePreview 组件**：
   - 独立组件，可脱离 Attachments 使用
   - 使用简化的 `PreviewImage` 类型
   - 通过 Teleport 挂载到 body
   - 支持键盘导航和缩略图

3. **类型转换**：
   - `Attachment` → `PreviewImage` 转换简单
   - 只需提取 `uid`、`url`、`name` 字段

---

## 类型系统对齐

### Phase 1: Attachment 类型（统一类型）

```typescript
/**
 * 统一的附件类型（来自 Phase 1）
 */
export interface Attachment {
  // 核心标识
  uid: string              // ✅ 必需，唯一标识符
  name: string             // 文件名
  
  // 状态相关
  status?: FileStatus      // 'uploading' | 'success' | 'error'
  message?: string         // 状态提示信息
  percent?: number         // 上传进度 0-100
  
  // 文件来源
  url?: string             // 文件 URL
  originFile?: File        // 原始 File 对象
  
  // 元数据
  size: number             // ✅ 必需，文件大小（字节）
  fileType?: FileType      // 文件类型
  
  // 扩展字段
  [key: string]: any
}
```

### Phase 2: PreviewImage 类型（简化类型）

```typescript
/**
 * 图片预览类型（来自 Phase 2）
 */
export interface PreviewImage {
  uid: string      // 唯一标识
  url: string      // 图片 URL
  alt?: string     // 图片描述
}
```

### 类型转换工具

```typescript
/**
 * 将 Attachment 转换为 PreviewImage
 */
export function toPreviewImage(attachment: Attachment): PreviewImage | null {
  // 只转换成功的图片附件
  if (
    attachment.fileType !== 'image' ||
    attachment.status !== 'success' ||
    !attachment.url
  ) {
    return null
  }
  
  return {
    uid: attachment.uid,
    url: attachment.url,
    alt: attachment.name,
  }
}

/**
 * 批量转换
 */
export function toPreviewImageList(attachments: Attachment[]): PreviewImage[] {
  return attachments
    .map(toPreviewImage)
    .filter((img): img is PreviewImage => img !== null)
}
```

---

## Attachments 与 ImagePreview 的集成

### 1. Attachments 组件更新（添加预览功能）

```vue
<!-- Attachments.vue -->
<script setup lang="ts">
import { provide, computed, ref, toRef } from 'vue'
import { AttachmentsContextKey } from './attachments-context'
import { toPreviewImageList } from './utils'
import AttachmentList from './AttachmentList.vue'
import ImagePreview from '../image-preview/ImagePreview.vue'

interface Props {
  items?: Attachment[]
  disabled?: boolean
  variant?: 'picture' | 'card' | 'auto'
  
  // 新增：图片预览配置（简化版）
  previewConfig?: {
    teleport?: string | boolean  // 默认 'body'
    zIndex?: number              // 默认 9999
    maskClosable?: boolean       // 默认 true
    keyboard?: boolean           // 默认 true
  }
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  disabled: false,
  variant: 'auto',
  previewConfig: () => ({}),
})

const emit = defineEmits<{
  'update:items': [items: Attachment[]]
  'remove': [uid: string]
  'preview': [uid: string]
  'download': [uid: string]
  'retry': [uid: string]
}>()

// 内部状态
const fileList = ref<Attachment[]>([])

// 监听 props 变化
watch(() => props.items, (newItems) => {
  if (newItems) {
    fileList.value = newItems.map(item => ({
      uid: item.uid || generateUID(),
      status: item.status || 'success',
      ...item,
    }))
  }
}, { deep: true, immediate: true })

// 图片预览状态
const previewVisible = ref(false)
const previewIndex = ref(0)

// 获取所有可预览的图片
const previewImages = computed(() => {
  return toPreviewImageList(fileList.value)
})

// 打开预览
const handlePreview = (uid: string) => {
  const index = previewImages.value.findIndex(img => img.uid === uid)
  if (index !== -1) {
    previewIndex.value = index
    previewVisible.value = true
    emit('preview', uid)
  }
}

// 提供 Context
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
    preview: handlePreview,
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
    <!-- 附件列表 -->
    <slot>
      <AttachmentList />
    </slot>
    
    <!-- 图片预览 -->
    <ImagePreview
      v-if="previewVisible && previewImages.length > 0"
      :images="previewImages"
      v-model="previewIndex"
      :config="previewConfig"
      @close="previewVisible = false"
    >
      <!-- 透传预览插槽 -->
      <template v-if="$slots['preview-toolbar']" #toolbar="slotProps">
        <slot name="preview-toolbar" v-bind="slotProps" />
      </template>
      
      <template v-if="$slots['preview-navigation']" #navigation="slotProps">
        <slot name="preview-navigation" v-bind="slotProps" />
      </template>
      
      <template v-if="$slots['preview-content']" #content="slotProps">
        <slot name="preview-content" v-bind="slotProps" />
      </template>
      
      <template v-if="$slots['preview-thumbnails']" #thumbnails="slotProps">
        <slot name="preview-thumbnails" v-bind="slotProps" />
      </template>
    </ImagePreview>
  </div>
</template>
```

### 2. AttachmentItem 组件更新（picture 模式点击预览）

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

// 点击图片触发预览
const handleImageClick = () => {
  if (props.item.fileType === 'image' && props.item.url && props.item.status === 'success') {
    context.emit.preview(props.item.uid)
  }
}

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
    <!-- Picture 模式：图片墙 -->
    <template v-if="variant === 'picture'">
      <div 
        class="tr-attachment-item__picture"
        :class="{
          'tr-attachment-item__picture--clickable': item.status === 'success' && item.url,
        }"
        @click="handleImageClick"
      >
        <!-- 图片 -->
        <img
          v-if="item.url"
          :src="item.url"
          :alt="item.name"
          class="tr-attachment-item__image"
        />
        
        <!-- 占位符（无 URL 时） -->
        <div v-else class="tr-attachment-item__placeholder">
          <IconImage />
        </div>
        
        <!-- 状态遮罩 -->
        <div v-if="item.status !== 'success'" class="tr-attachment-item__overlay">
          <div v-if="item.status === 'uploading'" class="tr-attachment-item__loading">
            <IconLoading />
            <span v-if="item.percent !== undefined">{{ item.percent }}%</span>
            <span v-if="item.message" class="tr-attachment-item__message">
              {{ item.message }}
            </span>
          </div>
          <div v-else-if="item.status === 'error'" class="tr-attachment-item__error">
            <IconError />
            <span v-if="item.message" class="tr-attachment-item__message">
              {{ item.message }}
            </span>
          </div>
        </div>
        
        <!-- 删除按钮 -->
        <button
          v-if="!context.config.disabled.value"
          class="tr-attachment-item__remove"
          @click.stop="handleRemove"
        >
          <IconClose />
        </button>
      </div>
    </template>
    
    <!-- Card 模式：卡片布局 -->
    <template v-else>
      <div class="tr-attachment-item__card">
        <!-- 文件图标 -->
        <div class="tr-attachment-item__icon">
          <slot name="icon" :item="item">
            <component :is="context.utils.getFileIcon(item.fileType)" />
          </slot>
        </div>
        
        <!-- 文件信息 -->
        <div class="tr-attachment-item__content">
          <slot name="content" :item="item">
            <div class="tr-attachment-item__name">{{ item.name }}</div>
            <div class="tr-attachment-item__size">
              {{ context.utils.formatSize(item.size) }}
            </div>
          </slot>
        </div>
        
        <!-- 状态 -->
        <div v-if="item.status !== 'success'" class="tr-attachment-item__status">
          <slot name="status" :item="item">
            <div v-if="item.status === 'uploading'" class="tr-attachment-item__uploading">
              <IconLoading />
              <span v-if="item.percent !== undefined">{{ item.percent }}%</span>
              <span v-if="item.message">{{ item.message }}</span>
            </div>
            <div v-else-if="item.status === 'error'" class="tr-attachment-item__error">
              <IconError />
              <span v-if="item.message">{{ item.message }}</span>
            </div>
          </slot>
        </div>
        
        <!-- 操作按钮 -->
        <div class="tr-attachment-item__actions">
          <slot 
            name="actions" 
            :item="item"
            :handlers="{ handlePreview, handleDownload, handleRetry, handleRemove }"
          >
            <button 
              v-if="context.utils.isImage(item) && item.url && item.status === 'success'"
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
  </div>
</template>

<style scoped>
/* Picture 模式样式 */
.tr-attachment-item--picture {
  position: relative;
  width: 100px;
  height: 100px;
}

.tr-attachment-item__picture {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
  
  &--clickable {
    cursor: pointer;
    
    &:hover {
      opacity: 0.9;
    }
  }
}

.tr-attachment-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tr-attachment-item__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.tr-attachment-item__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.tr-attachment-item__loading,
.tr-attachment-item__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.tr-attachment-item__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  .tr-attachment-item__picture:hover & {
    opacity: 1;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

/* Card 模式样式 */
.tr-attachment-item--card {
  .tr-attachment-item__card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    
    &:hover {
      background-color: #f9f9f9;
    }
  }
  
  .tr-attachment-item__icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
  }
  
  .tr-attachment-item__content {
    flex: 1;
    min-width: 0;
  }
  
  .tr-attachment-item__name {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .tr-attachment-item__size {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
  
  .tr-attachment-item__actions {
    display: flex;
    gap: 8px;
    
    button {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background-color: white;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
```

---

## 完整使用示例

### 示例 1：基础用法

```vue
<template>
  <div>
    <!-- 上传按钮 -->
    <input type="file" @change="handleFileSelect" multiple accept="image/*" />
    
    <!-- 附件列表（自动预览） -->
    <TrAttachments 
      v-model:items="files"
      @retry="handleRetry"
      @remove="handleRemove"
      @download="handleDownload"
      @preview="handlePreview"
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
      fileType: 'image',
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

// 业务侧：预览回调
const handlePreview = (uid: string) => {
  console.log('Preview:', uid)
}
</script>
```

### 示例 2：自定义预览配置

```vue
<template>
  <TrAttachments 
    v-model:items="files"
    :preview-config="{
      teleport: 'body',
      zIndex: 10000,
      maskClosable: true,
      keyboard: true,
    }"
  />
</template>
```

### 示例 3：自定义预览工具栏

```vue
<template>
  <TrAttachments v-model:items="files">
    <!-- 自定义预览工具栏 -->
    <template #preview-toolbar="{ currentImage, currentIndex, close }">
      <div class="custom-toolbar">
        <span>{{ currentImage.alt }} ({{ currentIndex + 1 }}/{{ files.length }})</span>
        <button @click="handleShare(currentImage.url)">
          <IconShare /> 分享
        </button>
        <button @click="close">
          <IconClose /> 关闭
        </button>
      </div>
    </template>
  </TrAttachments>
</template>

<script setup lang="ts">
const handleShare = (url: string) => {
  navigator.share({ url })
}
</script>
```

### 示例 4：自定义预览导航

```vue
<template>
  <TrAttachments v-model:items="files">
    <!-- 自定义预览导航按钮 -->
    <template #preview-navigation="{ prev, next, hasPrev, hasNext }">
      <button v-if="hasPrev" class="my-nav-btn my-nav-btn--left" @click="prev">
        ← 上一张
      </button>
      <button v-if="hasNext" class="my-nav-btn my-nav-btn--right" @click="next">
        下一张 →
      </button>
    </template>
  </TrAttachments>
</template>
```

### 示例 5：自定义缩略图

```vue
<template>
  <TrAttachments v-model:items="files">
    <!-- 自定义缩略图 -->
    <template #preview-thumbnails="{ images, currentIndex, goTo }">
      <div class="my-thumbnails">
        <div
          v-for="(img, index) in images"
          :key="img.uid"
          class="my-thumbnail"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
        >
          <img :src="img.url" :alt="img.alt" />
          <span>{{ index + 1 }}</span>
        </div>
      </div>
    </template>
  </TrAttachments>
</template>
```

### 示例 6：独立使用 ImagePreview

```vue
<template>
  <div>
    <!-- 图片列表 -->
    <div class="image-grid">
      <img
        v-for="(img, index) in images"
        :key="index"
        :src="img.url"
        @click="openPreview(index)"
      />
    </div>
    
    <!-- 独立的图片预览 -->
    <TrImagePreview
      v-if="previewVisible"
      :images="images"
      v-model="currentIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PreviewImage } from '@opentiny/tiny-robot'

const images = ref<PreviewImage[]>([
  { uid: '1', url: 'https://example.com/1.jpg', alt: '图片1' },
  { uid: '2', url: 'https://example.com/2.jpg', alt: '图片2' },
  { uid: '3', url: 'https://example.com/3.jpg', alt: '图片3' },
])

const previewVisible = ref(false)
const currentIndex = ref(0)

const openPreview = (index: number) => {
  currentIndex.value = index
  previewVisible.value = true
}
</script>
```

### 示例 7：完全自定义布局

```vue
<template>
  <TrAttachments v-model:items="files">
    <!-- 自定义整体布局 -->
    <div class="my-custom-layout">
      <div class="my-header">
        <h3>我的附件 ({{ files.length }})</h3>
        <button @click="handleUpload">上传</button>
      </div>
      
      <AttachmentList>
        <template #item="{ item }">
          <div class="my-custom-item">
            <!-- 自定义渲染 -->
            <img v-if="item.fileType === 'image'" :src="item.url" />
            <div v-else>
              <FileIcon :type="item.fileType" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </template>
      </AttachmentList>
    </div>
  </TrAttachments>
</template>
```

---

## 迁移指南

### 从旧版本迁移

#### 1. 类型迁移

```typescript
// ❌ 旧版本：分离的类型
import { RawFileAttachment, UrlAttachment } from '@opentiny/tiny-robot'

const file1: RawFileAttachment = {
  rawFile: file,
  url: 'https://example.com/file.pdf',
}

const file2: UrlAttachment = {
  url: 'https://example.com/file.pdf',
  size: 1024,
}

// ✅ 新版本：统一的类型
import { Attachment, generateUID } from '@opentiny/tiny-robot'

const file1: Attachment = {
  uid: generateUID(),
  name: file.name,
  size: file.size,
  originFile: file,
  status: 'uploading',
}

const file2: Attachment = {
  uid: generateUID(),
  name: 'file.pdf',
  size: 1024,
  url: 'https://example.com/file.pdf',
  status: 'success',
}
```

#### 2. 序列化迁移

```typescript
// ❌ 旧版本：手动处理
const serializable = files.map(file => {
  const { rawFile, originFile, ...rest } = file
  return rest
})

// ✅ 新版本：使用工具函数
import { toSerializable, toSerializableList } from '@opentiny/tiny-robot'

// 单个转换
const serializable = toSerializable(file)

// 批量转换
const serializableList = toSerializableList(files)
```

#### 3. 预览配置迁移

```vue
<!-- ❌ 旧版本：多个布尔 props -->
<TrAttachments
  v-model:items="files"
  :preview-zoom="true"
  :preview-rotate="true"
  :preview-download="false"
  :preview-teleport="'body'"
  :preview-z-index="10000"
/>

<!-- ✅ 新版本：配置对象 -->
<TrAttachments
  v-model:items="files"
  :preview-config="{
    teleport: 'body',
    zIndex: 10000,
    maskClosable: true,
    keyboard: true,
  }"
/>
```

#### 4. 事件迁移

```vue
<!-- ❌ 旧版本：可能没有 preview 事件 -->
<TrAttachments
  v-model:items="files"
  @remove="handleRemove"
  @download="handleDownload"
/>

<!-- ✅ 新版本：添加 preview 事件 -->
<TrAttachments
  v-model:items="files"
  @remove="handleRemove"
  @download="handleDownload"
  @preview="handlePreview"
  @retry="handleRetry"
/>
```

#### 5. 插槽迁移

```vue
<!-- ❌ 旧版本：可能没有预览插槽 -->
<TrAttachments v-model:items="files">
  <template #item="{ item }">
    <!-- 自定义项 -->
  </template>
</TrAttachments>

<!-- ✅ 新版本：支持预览插槽 -->
<TrAttachments v-model:items="files">
  <template #item="{ item }">
    <!-- 自定义项 -->
  </template>
  
  <!-- 新增：预览插槽 -->
  <template #preview-toolbar="{ currentImage, close }">
    <!-- 自定义预览工具栏 -->
  </template>
  
  <template #preview-navigation="{ prev, next, hasPrev, hasNext }">
    <!-- 自定义预览导航 -->
  </template>
  
  <template #preview-thumbnails="{ images, currentIndex, goTo }">
    <!-- 自定义缩略图 -->
  </template>
</TrAttachments>
```

### 迁移检查清单

- [ ] 更新类型定义：`RawFileAttachment`/`UrlAttachment` → `Attachment`
- [ ] 添加 `uid` 字段（使用 `generateUID()`）
- [ ] 更新序列化逻辑（使用 `toSerializable`）
- [ ] 更新预览配置（使用 `previewConfig` 对象）
- [ ] 添加 `preview` 事件处理
- [ ] 测试图片预览功能
- [ ] 测试自定义插槽（如果使用）

---

## 性能优化

### 1. 图片懒加载

```vue
<template>
  <TrAttachments v-model:items="files">
    <template #item="{ item }">
      <AttachmentItem :item="item" :variant="actualVariant">
        <!-- 图片懒加载 -->
        <img
          v-if="item.fileType === 'image'"
          :src="item.url"
          loading="lazy"
          decoding="async"
        />
      </AttachmentItem>
    </template>
  </TrAttachments>
</template>
```

### 2. 虚拟滚动（大量附件）

```vue
<template>
  <TrAttachments v-model:items="files">
    <VirtualList
      :items="files"
      :item-height="60"
      :buffer="5"
    >
      <template #default="{ item }">
        <AttachmentItem :item="item" :variant="actualVariant" />
      </template>
    </VirtualList>
  </TrAttachments>
</template>
```

### 3. 预览图片预加载

```typescript
// useImagePreload.ts
export function useImagePreload(images: PreviewImage[]) {
  const preloadedImages = new Set<string>()
  
  const preload = (url: string) => {
    if (preloadedImages.has(url)) return
    
    const img = new Image()
    img.src = url
    img.onload = () => {
      preloadedImages.add(url)
    }
  }
  
  // 预加载相邻图片
  const preloadAdjacent = (currentIndex: number) => {
    const prev = images[currentIndex - 1]
    const next = images[currentIndex + 1]
    
    if (prev) preload(prev.url)
    if (next) preload(next.url)
  }
  
  return { preload, preloadAdjacent }
}

// 在 ImagePreview 中使用
watch(currentIndex, (index) => {
  preloadAdjacent(index)
})
```

### 4. 缩略图优化

```typescript
// 在 Attachment 类型中添加缩略图字段
export interface Attachment {
  // ... 其他字段
  thumbUrl?: string  // 缩略图 URL（可选）
}

// 使用缩略图
const toPreviewImage = (attachment: Attachment): PreviewImage | null => {
  if (
    attachment.fileType !== 'image' ||
    attachment.status !== 'success' ||
    !attachment.url
  ) {
    return null
  }
  
  return {
    uid: attachment.uid,
    url: attachment.url,           // 原图用于预览
    thumbUrl: attachment.thumbUrl, // 缩略图用于列表显示
    alt: attachment.name,
  }
}
```

```vue
<template>
  <TrAttachments v-model:items="files">
    <template #item="{ item }">
      <!-- 列表显示缩略图 -->
      <img :src="item.thumbUrl || item.url" />
    </template>
  </TrAttachments>
</template>
```

### 5. 防抖和节流

```typescript
// 防抖：搜索、过滤
import { useDebounceFn } from '@vueuse/core'

const handleSearch = useDebounceFn((keyword: string) => {
  filteredFiles.value = files.value.filter(f => 
    f.name.includes(keyword)
  )
}, 300)

// 节流：滚动加载
import { useThrottleFn } from '@vueuse/core'

const handleScroll = useThrottleFn(() => {
  if (shouldLoadMore()) {
    loadMore()
  }
}, 200)
```

### 6. 图片压缩（上传前）

```typescript
// 压缩图片
async function compressImage(file: File, maxSize: number = 1024 * 1024): Promise<File> {
  if (file.size <= maxSize) {
    return file
  }
  
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // 计算压缩比例
        const ratio = Math.sqrt(maxSize / file.size)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: file.type }))
        }, file.type, 0.9)
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

// 使用
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  
  for (const file of selectedFiles) {
    // 压缩图片
    const compressedFile = await compressImage(file)
    
    const attachment: Attachment = {
      uid: generateUID(),
      name: file.name,
      size: compressedFile.size,
      originFile: compressedFile,
      status: 'uploading',
    }
    
    files.value.push(attachment)
    await uploadFile(attachment)
  }
}
```

### 7. 内存管理

```typescript
// 清理 URL.createObjectURL 创建的 URL
onUnmounted(() => {
  files.value.forEach(file => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
})

// 限制同时上传数量
const MAX_CONCURRENT_UPLOADS = 3
const uploadQueue = ref<Attachment[]>([])
const uploading = ref<Set<string>>(new Set())

const processUploadQueue = async () => {
  while (uploadQueue.value.length > 0 && uploading.value.size < MAX_CONCURRENT_UPLOADS) {
    const attachment = uploadQueue.value.shift()!
    uploading.value.add(attachment.uid)
    
    try {
      await uploadFile(attachment)
    } finally {
      uploading.value.delete(attachment.uid)
    }
  }
}
```

---

## 总结

### 整合优势

1. **代码复用** ✅
   - Attachments 复用 Image 的预览能力
   - 避免重复实现预览逻辑

2. **独立可用** ✅
   - Image 组件可以独立使用
   - 不依赖 Attachments

3. **统一体验** ✅
   - 预览交互保持一致
   - 配置方式统一

4. **高度可定制** ✅
   - 插槽优先设计
   - 避免布尔值地狱
   - Context 共享状态

5. **性能优化** ✅
   - 懒加载
   - 预加载
   - 虚拟滚动

### 设计原则遵循

- ✅ **拒绝布尔值地狱**：使用配置对象代替多个布尔 props
- ✅ **插槽优先**：所有关键部分都提供插槽
- ✅ **哑容器 + 聪明子组件**：职责清晰，易于维护
- ✅ **Context 共享**：避免 props drilling，状态管理清晰
