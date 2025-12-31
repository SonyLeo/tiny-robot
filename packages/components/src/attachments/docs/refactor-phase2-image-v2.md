# Phase 2: Image 预览组件设计（简化版）

## 目录
- [设计目标](#设计目标)
- [现有组件分析](#现有组件分析)
- [优化方案](#优化方案)
- [组件架构](#组件架构)
- [API 设计](#api-设计)
- [实施细节](#实施细节)

---

## 设计目标

### 核心目标

1. **解决层级问题**：使用 Teleport 确保预览始终在最顶层
2. **保持简单**：只实现核心功能，避免过度设计
3. **插槽优先**：关键部分提供插槽支持自定义
4. **Context 共享**：使用 provide/inject 管理预览状态
5. **独立可用**：可以脱离 Attachments 单独使用

### 功能需求（MVP）

✅ **必需功能：**
- 单图/多图预览
- 左右切换
- 底部缩略图
- 关闭按钮
- 键盘导航（左右箭头、ESC）
- Teleport 支持

🔮 **预留扩展：**
- Toolbar 区域（预留插槽，暂不实现）
- 缩放、旋转（未来扩展）
- 下载（未来扩展）

---

## 现有组件分析

### 当前 ImagePreview 组件

**优点：**
- 功能完整：左右切换、缩略图、关闭
- 代码简洁
- 样式美观

**问题：**
- ❌ 没有使用 Teleport，层级问题未解决
- ❌ 没有 Context 设计，难以扩展
- ❌ 没有插槽，自定义能力有限
- ❌ 硬编码 z-index: 10000
- ❌ 依赖 Attachment 类型，不够独立

### 优化方向

1. **添加 Teleport**：解决层级问题
2. **引入 Context**：方便子组件访问状态
3. **添加插槽**：支持自定义（toolbar、navigation、thumbnails）
4. **简化类型**：不依赖 Attachment，使用简单的 Image 类型
5. **配置化**：z-index、teleport 目标可配置

---

## 优化方案

### 设计原则

遵循以下核心原则：

1. **拒绝布尔值地狱**：使用配置对象
2. **插槽优先**：关键部分提供插槽
3. **哑容器 + 聪明子组件**：ImagePreview 是哑容器，子组件独立
4. **Context 共享**：使用 provide/inject

### 组件结构（简化版）

```
Image (可选的包装组件)
└── <img> + 点击触发预览

ImagePreview (核心组件，通过 Teleport)
├── ImagePreviewContext (Context Provider)
│   ├── currentIndex: Ref<number>
│   ├── images: Image[]
│   ├── prev(), next(), close()
│
├── <slot name="toolbar"> (预留，暂不实现)
├── ImageViewer (主图区域)
│   ├── <slot name="navigation"> (左右按钮)
│   └── <slot name="content"> (图片内容)
└── <slot name="thumbnails"> (缩略图)
```

---

## 组件架构

### 类型定义（简化版）

```typescript
/**
 * 图片类型（简化版，不依赖 Attachment）
 */
export interface PreviewImage {
  uid: string      // 唯一标识
  url: string      // 图片 URL
  alt?: string     // 图片描述
}

/**
 * 预览配置（简化版，避免布尔值地狱）
 */
export interface ImagePreviewConfig {
  // 显示控制
  visible?: boolean
  
  // 图片列表
  images: PreviewImage[]
  initialIndex?: number
  
  // 层级配置
  teleport?: string | boolean  // 默认 'body'
  zIndex?: number              // 默认 9999
  
  // 交互配置
  maskClosable?: boolean       // 点击遮罩关闭，默认 true
  keyboard?: boolean           // 键盘导航，默认 true
  
  // 事件
  onClose?: () => void
  onChange?: (index: number) => void
}
```

### Context 设计（简化版）

```typescript
// image-preview-context.ts
export interface ImagePreviewContext {
  // 状态
  currentIndex: Ref<number>
  images: Readonly<PreviewImage[]>
  currentImage: ComputedRef<PreviewImage>
  
  // 配置
  config: Readonly<ImagePreviewConfig>
  
  // 方法
  prev: () => void
  next: () => void
  goTo: (index: number) => void
  close: () => void
  
  // 计算属性
  hasPrev: ComputedRef<boolean>
  hasNext: ComputedRef<boolean>
}

export const ImagePreviewContextKey: InjectionKey<ImagePreviewContext> = Symbol('image-preview')

export function useImagePreviewContext(): ImagePreviewContext {
  const context = inject(ImagePreviewContextKey)
  if (!context) {
    throw new Error('useImagePreviewContext must be used within ImagePreview')
  }
  return context
}
```

---

## API 设计

### ImagePreview 组件 Props

```typescript
export interface ImagePreviewProps {
  // 图片列表
  images: PreviewImage[]
  
  // 当前索引（支持 v-model）
  modelValue?: number
  
  // 配置（使用对象避免布尔值地狱）
  config?: {
    teleport?: string | boolean  // 默认 'body'
    zIndex?: number              // 默认 9999
    maskClosable?: boolean       // 默认 true
    keyboard?: boolean           // 默认 true
  }
}

export interface ImagePreviewEmits {
  'update:modelValue': [index: number]
  'close': []
  'change': [index: number]
}
```

### 使用示例

```vue
<template>
  <!-- 1. 基础用法 -->
  <TrImagePreview
    v-if="previewVisible"
    :images="images"
    v-model="currentIndex"
    @close="previewVisible = false"
  />
  
  <!-- 2. 自定义配置 -->
  <TrImagePreview
    v-if="previewVisible"
    :images="images"
    v-model="currentIndex"
    :config="{
      teleport: 'body',
      zIndex: 10000,
      maskClosable: true,
      keyboard: true,
    }"
    @close="handleClose"
    @change="handleChange"
  />
  
  <!-- 3. 自定义导航按钮 -->
  <TrImagePreview
    v-if="previewVisible"
    :images="images"
    v-model="currentIndex"
  >
    <template #navigation="{ prev, next, hasPrev, hasNext }">
      <button v-if="hasPrev" @click="prev">上一张</button>
      <button v-if="hasNext" @click="next">下一张</button>
    </template>
  </TrImagePreview>
  
  <!-- 4. 自定义缩略图 -->
  <TrImagePreview
    v-if="previewVisible"
    :images="images"
    v-model="currentIndex"
  >
    <template #thumbnails="{ images, currentIndex, goTo }">
      <div class="custom-thumbnails">
        <img
          v-for="(img, index) in images"
          :key="img.uid"
          :src="img.url"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
        />
      </div>
    </template>
  </TrImagePreview>
  
  <!-- 5. 预留 Toolbar（未来扩展） -->
  <TrImagePreview
    v-if="previewVisible"
    :images="images"
    v-model="currentIndex"
  >
    <template #toolbar="{ currentImage, close }">
      <div class="custom-toolbar">
        <span>{{ currentImage.alt }}</span>
        <button @click="close">关闭</button>
      </div>
    </template>
  </TrImagePreview>
</template>

<script setup lang="ts">
const images = ref<PreviewImage[]>([
  { uid: '1', url: 'https://example.com/1.jpg', alt: '图片1' },
  { uid: '2', url: 'https://example.com/2.jpg', alt: '图片2' },
  { uid: '3', url: 'https://example.com/3.jpg', alt: '图片3' },
])

const previewVisible = ref(false)
const currentIndex = ref(0)

const handleClose = () => {
  previewVisible.value = false
}

const handleChange = (index: number) => {
  console.log('Current index:', index)
}
</script>
```

---

## 实施细节

### 1. ImagePreview 组件实现（哑容器）

```vue
<!-- ImagePreview.vue -->
<script setup lang="ts">
import { provide, computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { ImagePreviewContextKey } from './image-preview-context'
import ImageViewer from './ImageViewer.vue'
import ImageThumbnails from './ImageThumbnails.vue'

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  modelValue: 0,
  config: () => ({
    teleport: 'body',
    zIndex: 9999,
    maskClosable: true,
    keyboard: true,
  }),
})

const emit = defineEmits<ImagePreviewEmits>()

// 当前索引
const currentIndex = ref(props.modelValue)

// 同步 v-model
watch(() => props.modelValue, (val) => {
  currentIndex.value = val
})

watch(currentIndex, (val) => {
  emit('update:modelValue', val)
  emit('change', val)
})

// 当前图片
const currentImage = computed(() => props.images[currentIndex.value])

// 是否有上一张/下一张
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.images.length - 1)

// 方法
const prev = () => {
  if (hasPrev.value) {
    currentIndex.value--
  }
}

const next = () => {
  if (hasNext.value) {
    currentIndex.value++
  }
}

const goTo = (index: number) => {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
  }
}

const close = () => {
  emit('close')
}

// 键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.config.keyboard) return
  
  switch (event.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 提供 Context
provide(ImagePreviewContextKey, {
  currentIndex,
  images: props.images,
  currentImage,
  config: props.config,
  prev,
  next,
  goTo,
  close,
  hasPrev,
  hasNext,
})
</script>

<template>
  <Teleport :to="config.teleport || 'body'" :disabled="!config.teleport">
    <div 
      class="tr-image-preview"
      :style="{ zIndex: config.zIndex || 9999 }"
      @click.self="config.maskClosable !== false && close()"
    >
      <!-- Toolbar 插槽（预留） -->
      <div v-if="$slots.toolbar" class="tr-image-preview__toolbar">
        <slot 
          name="toolbar" 
          :current-image="currentImage"
          :current-index="currentIndex"
          :total="images.length"
          :close="close"
        />
      </div>
      
      <!-- 关闭按钮 -->
      <button class="tr-image-preview__close" @click="close">
        <IconClose />
      </button>
      
      <!-- 主图区域 -->
      <ImageViewer>
        <!-- 透传插槽 -->
        <template v-if="$slots.navigation" #navigation>
          <slot 
            name="navigation"
            :prev="prev"
            :next="next"
            :has-prev="hasPrev"
            :has-next="hasNext"
          />
        </template>
        
        <template v-if="$slots.content" #content>
          <slot 
            name="content"
            :current-image="currentImage"
            :current-index="currentIndex"
          />
        </template>
      </ImageViewer>
      
      <!-- 缩略图 -->
      <div v-if="images.length > 1" class="tr-image-preview__footer">
        <slot 
          name="thumbnails"
          :images="images"
          :current-index="currentIndex"
          :go-to="goTo"
        >
          <!-- 默认缩略图 -->
          <ImageThumbnails />
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tr-image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
}

.tr-image-preview__toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.tr-image-preview__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.tr-image-preview__footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}
</style>
```

### 2. ImageViewer 组件（聪明子组件）

```vue
<!-- ImageViewer.vue -->
<script setup lang="ts">
import { useImagePreviewContext } from './image-preview-context'
import { IconArrowLeft, IconArrowRight } from '@opentiny/tiny-robot-svgs'

const context = useImagePreviewContext()
</script>

<template>
  <div class="tr-image-viewer">
    <!-- 导航插槽 -->
    <slot name="navigation">
      <!-- 默认导航按钮 -->
      <button
        v-if="context.hasPrev.value"
        class="tr-image-viewer__nav tr-image-viewer__nav--left"
        @click.stop="context.prev"
      >
        <IconArrowLeft />
      </button>
      
      <button
        v-if="context.hasNext.value"
        class="tr-image-viewer__nav tr-image-viewer__nav--right"
        @click.stop="context.next"
      >
        <IconArrowRight />
      </button>
    </slot>
    
    <!-- 内容插槽 -->
    <div class="tr-image-viewer__content">
      <slot name="content">
        <!-- 默认图片 -->
        <img
          :src="context.currentImage.value.url"
          :alt="context.currentImage.value.alt"
          class="tr-image-viewer__image"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.tr-image-viewer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tr-image-viewer__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &--left {
    left: 40px;
  }
  
  &--right {
    right: 40px;
  }
}

.tr-image-viewer__content {
  max-width: 80%;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tr-image-viewer__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
```

### 3. ImageThumbnails 组件（聪明子组件）

```vue
<!-- ImageThumbnails.vue -->
<script setup lang="ts">
import { useImagePreviewContext } from './image-preview-context'

const context = useImagePreviewContext()
</script>

<template>
  <div class="tr-image-thumbnails">
    <div
      v-for="(image, index) in context.images"
      :key="image.uid"
      class="tr-image-thumbnails__item"
      :class="{ 'tr-image-thumbnails__item--active': index === context.currentIndex.value }"
      @click="context.goTo(index)"
    >
      <img :src="image.url" :alt="image.alt" />
    </div>
  </div>
</template>

<style scoped>
.tr-image-thumbnails {
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  max-width: 80vw;
  overflow-x: auto;
}

.tr-image-thumbnails__item {
  width: 60px;
  height: 60px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    transition: background-color 0.2s;
  }
  
  &--active {
    border-color: white;
    
    &::after {
      background-color: transparent;
    }
  }
  
  &:hover::after {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
```

---

## 与 Attachments 集成

### 在 Attachments 中使用

```vue
<!-- Attachments.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import ImagePreview from './ImagePreview.vue'

// 图片预览状态
const previewVisible = ref(false)
const previewIndex = ref(0)

// 获取所有图片
const imageList = computed(() => {
  return fileList.value
    .filter(item => item.fileType === 'image' && item.url && item.status === 'success')
    .map(item => ({
      uid: item.uid,
      url: item.url!,
      alt: item.name,
    }))
})

// 打开预览
const handlePreview = (uid: string) => {
  const index = imageList.value.findIndex(img => img.uid === uid)
  if (index !== -1) {
    previewIndex.value = index
    previewVisible.value = true
  }
}
</script>

<template>
  <div class="tr-attachments">
    <AttachmentList @preview="handlePreview" />
    
    <!-- 图片预览 -->
    <ImagePreview
      v-if="previewVisible"
      :images="imageList"
      v-model="previewIndex"
      @close="previewVisible = false"
    />
  </div>
</template>
```

---

## 优势总结

### 1. 解决了层级问题 ✅

- 使用 `Teleport` 挂载到 `body`
- 可配置 `zIndex`
- 不受父容器层叠上下文影响

### 2. 避免了布尔值地狱 ✅

```typescript
// ❌ 布尔值地狱
<ImagePreview 
  :mask-closable="true"
  :keyboard="true"
  :show-toolbar="false"
  :show-thumbnails="true"
/>

// ✅ 配置对象
<ImagePreview 
  :config="{
    maskClosable: true,
    keyboard: true,
  }"
/>
```

### 3. 插槽优先，高度可定制 ✅

- toolbar 插槽（预留）
- navigation 插槽
- content 插槽
- thumbnails 插槽

### 4. Context 共享，避免 props drilling ✅

- 使用 `provide/inject`
- 子组件通过 Context 访问状态和方法

### 5. 哑容器 + 聪明子组件 ✅

- `ImagePreview` 是哑容器，提供结构
- `ImageViewer`、`ImageThumbnails` 是聪明子组件
- 子组件独立可复用

### 6. 保持简单 ✅

- 只实现核心功能
- 预留扩展空间（toolbar）
- 代码量少，易维护

---

## 实施步骤

### Step 1: 优化现有 ImagePreview

1. 添加 Teleport 支持
2. 添加 config 配置对象
3. 简化类型定义（PreviewImage）

### Step 2: 引入 Context

1. 创建 `image-preview-context.ts`
2. 实现 `useImagePreviewContext` hook

### Step 3: 拆分子组件

1. 创建 `ImageViewer.vue`
2. 创建 `ImageThumbnails.vue`
3. 添加插槽支持

### Step 4: 集成到 Attachments

1. 更新 Attachments 组件
2. 使用新的 ImagePreview
3. 测试预览功能

### Step 5: 文档和测试

1. 更新 API 文档
2. 添加使用示例
3. 单元测试

---

## 总结

### 简化后的优势

| 维度 | 旧版本 | 新版本 |
|------|--------|--------|
| 层级问题 | ❌ 未解决 | ✅ Teleport |
| 可配置性 | ❌ 硬编码 | ✅ config 对象 |
| 可扩展性 | ❌ 无插槽 | ✅ 多个插槽 |
| Context | ❌ 无 | ✅ 有 |
| 复杂度 | 简单 | 适中 |
| 功能 | 基础 | 基础 + 可扩展 |

### 核心改进点

1. **Teleport**：解决层级问题
2. **Config 对象**：避免布尔值地狱
3. **Context**：方便子组件访问状态
4. **插槽**：支持自定义
5. **简化类型**：不依赖 Attachment
6. **预留扩展**：toolbar 插槽预留

### 未来扩展方向

- 缩放功能（pinch、滚轮）
- 旋转功能
- 下载功能
- 全屏功能
- 动画效果
- 触摸手势支持
