# Tag 扩展设计文档

## 概述

Tag 扩展用于在 ChatInput 输入框中显示一个可交互的标签块，常用于显示当前激活的技能、场景或模式。标签块固定在输入框开头，支持悬浮交互和多种删除方式。

## 核心特性

- **固定位置**：标签块始终位于输入框开头（position 0）
- **唯一性**：一次只能存在一个标签块，新标签会自动替换旧标签
- **响应式**：支持通过 ref 响应式控制标签的显示/隐藏
- **多种删除方式**：点击关闭按钮、点击标签块本身、按 ESC 键
- **悬浮交互**：鼠标悬浮时显示提示文字和关闭按钮
- **不可编辑**：标签块为原子节点，不可选中、不可拖拽、光标不能进入

## 使用场景

1. **技能模式**：显示当前激活的 AI 技能（如 "深度研究"、"帮我写作"）
2. **场景切换**：显示当前对话场景（如 "代码审查"、"文档翻译"）
3. **上下文标识**：显示当前对话的上下文信息（如 "基于文件 xxx"）

## 数据结构

### TagItem

```typescript
interface TagItem {
  /**
   * 唯一标识
   */
  id: string

  /**
   * 显示文本
   */
  label: string

  /**
   * 可选图标（VNode）
   * 
   * @example
   * import { h } from 'vue'
   * import IconSearch from './IconSearch.vue'
   * 
   * const tag = {
   *   id: '1',
   *   label: '深度研究',
   *   icon: h(IconSearch)
   * }
   */
  icon?: VNode

  /**
   * 自定义数据（用于业务扩展）
   */
  data?: string
}
```

### TagOptions

```typescript
interface TagOptions {
  /**
   * 标签数据（支持响应式）
   * 
   * - 传入 ref：自动响应式更新，值为 null 时自动删除标签块
   * - 传入对象：静态初始化
   * 
   * @example 响应式配置
   * const currentTag = ref<TagItem | null>({
   *   id: '1',
   *   label: '深度研究'
   * })
   * ChatInput.tag(currentTag)
   * 
   * // 删除标签
   * currentTag.value = null
   */
  item?: TagItem | Ref<TagItem | null>

  /**
   * 自定义 HTML 属性
   */
  HTMLAttributes?: Record<string, any>

  /**
   * 悬浮提示文字
   * @default "点击退出"
   */
  hoverText?: string

  /**
   * 是否显示关闭按钮
   * @default true
   */
  showCloseButton?: boolean

  /**
   * 标签插入时的回调
   * 
   * @param tag - 插入的标签数据
   * 
   * @example
   * onInsert: (tag) => {
   *   console.log('标签已插入:', tag)
   * }
   */
  onInsert?: (tag: TagItem) => void

  /**
   * 标签删除时的回调
   * 
   * @param tag - 删除的标签数据
   * 
   * @example
   * onRemove: (tag) => {
   *   console.log('标签已删除:', tag)
   * }
   */
  onRemove?: (tag: TagItem) => void
}
```



## 交互设计

### 视觉状态

#### 未悬浮状态
- 显示标签块：浅蓝色背景，圆角矩形
- 显示图标（如果有）和文字
- 不显示关闭按钮
- 不显示提示文字

#### 悬浮状态
- 标签块保持原样
- 上方显示黑色半透明提示框，内容为 "点击退出"（或自定义文字）
- 标签块右上角显示圆形关闭按钮（黑色背景，白色 × 图标）
- 关闭按钮悬浮时高亮

### 删除方式

标签块支持三种删除方式，优先级相同：

#### 1. 点击关闭按钮
- 鼠标悬浮时，点击右上角的圆形关闭按钮
- 立即删除标签块，无动画

#### 2. 点击标签块本身
- 点击标签块的任意位置（除关闭按钮外）
- 立即删除标签块，无动画

#### 3. 按 ESC 键
- 编辑器聚焦时，按下 ESC 键
- 立即删除标签块，无动画
- 不需要标签块被选中或光标在特定位置

### 删除后行为

1. **删除节点**：从编辑器中移除标签块节点
2. **触发回调**：触发 `onRemove` 回调，传递被删除的 TagItem 数据
3. **光标定位**：将光标定位到编辑器开始位置（position 0）
4. **响应式同步**：如果使用 ref 配置，自动将 ref 值设为 null

## 插入逻辑

### 插入方式

支持两种插入方式：

#### 1. 配置式（响应式）

通过 `item` 配置项传入响应式 ref：

```typescript
const currentTag = ref<TagItem | null>(null)

// 配置扩展
const extensions = [ChatInput.tag(currentTag)]

// 插入标签
currentTag.value = {
  id: '1',
  label: '深度研究',
  icon: h(IconSearch)
}

// 删除标签
currentTag.value = null
```

#### 2. 命令式

通过编辑器命令手动插入：

```typescript
// 插入标签
editor.commands.insertTag({
  id: '1',
  label: '深度研究',
  icon: h(IconSearch)
})

// 删除标签
editor.commands.removeTag()
```

### 插入位置

- 标签块始终插入到文档开头（position 0）
- 插入时会自动将光标定位到标签块后面

### 替换逻辑

当已存在标签块时，插入新标签会自动替换旧标签：

1. 删除旧标签块
2. 在开头插入新标签块
3. 触发 `onRemove` 回调（旧标签）
4. 触发 `onInsert` 回调（新标签）



## 位置约束

### 固定在开头

标签块必须始终位于输入框开头，通过以下机制保证：

#### 1. 插入时定位
- 插入标签时，强制定位到 position 0
- 如果文档已有内容，标签块会插入到内容前面

#### 2. 阻止前置输入
- 通过 ProseMirror 插件监听输入事件
- 阻止用户在标签块前面插入内容
- 如果用户尝试在开头输入，自动将内容插入到标签块后面

#### 3. 粘贴处理
- 如果在标签块前粘贴内容，自动将内容移到标签块后面
- 保持标签块始终在最前面

### 唯一性保证

一次只能存在一个标签块：

1. **插入检查**：插入新标签前，检查是否已存在标签块
2. **自动替换**：如果已存在，先删除旧标签，再插入新标签
3. **命令封装**：`insertTag` 命令内部处理替换逻辑

## 编辑行为

### 节点属性

```typescript
{
  name: 'tag',
  group: 'inline',
  inline: true,
  atom: true,           // 原子节点，光标不能进入
  selectable: false,    // 不可选中
  draggable: false,     // 不可拖拽
}
```

### 键盘交互

| 按键      | 行为                     | 说明                                   |
| --------- | ------------------------ | -------------------------------------- |
| ESC       | 删除标签块               | 编辑器聚焦时即可触发                   |
| Backspace | 删除标签块               | 光标在标签块后紧邻位置时，按删除键删除 |

**说明**：
- 标签块固定在开头，光标只能在标签块后面，不存在"跳过"或"从前面删除"的场景
- 标签块为原子节点（`atom: true`），光标不能进入内部

### 复制粘贴

- **复制**：标签块不可选中，不参与复制操作
- **粘贴**：粘贴内容会插入到标签块后面（如果光标在标签块后）

## 样式设计

### 标签块样式

```less
.tag-block {
  display: inline-flex;
  align-items: center;
  gap: 6px;                          // 图标和文字间距
  padding: 4px 12px;                 // 内边距
  margin-right: 8px;                 // 右侧间距
  background: var(--tr-color-primary-light);  // 浅蓝色背景
  color: var(--tr-color-primary);    // 蓝色文字
  border-radius: 4px;                // 圆角
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
  user-select: none;
  max-width: 200px;                  // 最大宽度
  
  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
}
```

### 悬浮提示框样式

```less
.tag-hover-tooltip {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;                // 与标签块的间距
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.75);   // 黑色半透明
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;              // 不阻挡鼠标事件
  z-index: 10;
}
```

### 关闭按钮样式

```less
.tag-close-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);    // 黑色背景
  border-radius: 50%;                // 圆形
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 1);    // 悬浮时加深
  }
  
  svg {
    width: 12px;
    height: 12px;
    color: #fff;                     // 白色图标
  }
}
```



## 回调系统

Tag 扩展通过配置选项中的回调函数处理事件，而不是在 ChatInput 组件上监听事件。

### onInsert

标签块插入时触发。

**签名**：
```typescript
onInsert?: (tag: TagItem) => void
```

**触发时机**：
- 通过命令插入标签时
- 响应式 ref 从 null 变为有值时

**使用示例**：
```typescript
const extensions = [
  ChatInput.tag(currentTag, {
    onInsert: (tag) => {
      console.log('标签已插入:', tag)
      // 可以在这里记录日志、更新状态等
    }
  })
]
```

### onRemove

标签块删除时触发。

**签名**：
```typescript
onRemove?: (tag: TagItem) => void
```

**触发时机**：
- 点击关闭按钮
- 点击标签块本身
- 按 ESC 键
- 按 Backspace 键删除（光标在标签块后紧邻位置）
- 响应式 ref 从有值变为 null 时
- 插入新标签替换旧标签时

**使用示例**：
```typescript
const extensions = [
  ChatInput.tag(currentTag, {
    onRemove: (tag) => {
      console.log('标签已删除:', tag)
      // 可以在这里清理状态、通知后端等
    }
  })
]
```

## 命令 API

### insertTag

插入标签块到编辑器开头。

**签名**：
```typescript
editor.commands.insertTag(tag: TagItem): boolean
```

**参数**：
- `tag`: 标签数据

**返回值**：
- `true`: 插入成功
- `false`: 插入失败

**行为**：
1. 检查是否已存在标签块
2. 如果存在，先删除旧标签（触发 `onRemove` 回调）
3. 在 position 0 插入新标签
4. 触发 `onInsert` 回调
5. 将光标定位到标签块后面

**示例**：
```typescript
editor.commands.insertTag({
  id: '1',
  label: '深度研究',
  icon: h(IconSearch),
  data: 'research-mode'
})
```

### removeTag

删除标签块。

**签名**：
```typescript
editor.commands.removeTag(): boolean
```

**返回值**：
- `true`: 删除成功
- `false`: 删除失败（不存在标签块）

**行为**：
1. 查找标签块节点
2. 删除节点
3. 触发 `onRemove` 回调
4. 将光标定位到开始位置

**示例**：
```typescript
editor.commands.removeTag()
```

### hasTag

检查是否存在标签块。

**签名**：
```typescript
editor.commands.hasTag(): boolean
```

**返回值**：
- `true`: 存在标签块
- `false`: 不存在标签块

**示例**：
```typescript
if (editor.commands.hasTag()) {
  console.log('已有标签块')
}
```

### getTag

获取当前标签块数据。

**签名**：
```typescript
editor.commands.getTag(): TagItem | null
```

**返回值**：
- 标签块数据（如果存在）
- `null`（如果不存在）

**示例**：
```typescript
const tag = editor.commands.getTag()
if (tag) {
  console.log('当前标签:', tag.label)
}
```



## 插件系统

### ESC 键处理插件

监听 ESC 键，删除标签块。

**实现要点**：
```typescript
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const escKeyPlugin = () => {
  return new Plugin({
    key: new PluginKey('tagEscKey'),
    
    props: {
      handleKeyDown(view, event) {
        // 按下 ESC 键
        if (event.key === 'Escape') {
          const { state, dispatch } = view
          const tagNode = findTagNode(state)
          
          if (tagNode) {
            // 删除标签块
            const tr = state.tr.delete(tagNode.pos, tagNode.pos + tagNode.node.nodeSize)
            dispatch(tr)
            return true  // 阻止默认行为
          }
        }
        return false
      }
    }
  })
}
```

### 位置保证插件

确保标签块始终在开头，阻止在标签块前插入内容。

**实现要点**：
```typescript
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const positionGuardPlugin = () => {
  return new Plugin({
    key: new PluginKey('tagPositionGuard'),
    
    appendTransaction(transactions, oldState, newState) {
      const tagNode = findTagNode(newState)
      
      if (!tagNode) return null
      
      // 检查标签块是否在开头
      if (tagNode.pos !== 0) {
        // 移动标签块到开头
        const tr = newState.tr
        const node = tagNode.node
        
        // 删除当前位置的标签块
        tr.delete(tagNode.pos, tagNode.pos + node.nodeSize)
        
        // 在开头插入标签块
        tr.insert(0, node)
        
        return tr
      }
      
      return null
    }
  })
}
```

### 粘贴处理插件

处理粘贴内容，确保不会粘贴到标签块前面。

**实现要点**：
```typescript
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const pasteHandlerPlugin = () => {
  return new Plugin({
    key: new PluginKey('tagPasteHandler'),
    
    props: {
      handlePaste(view, event, slice) {
        const { state } = view
        const { selection } = state
        const tagNode = findTagNode(state)
        
        if (!tagNode) return false
        
        // 如果粘贴位置在标签块前面或内部
        if (selection.from <= tagNode.pos + tagNode.node.nodeSize) {
          // 将粘贴位置调整到标签块后面
          const tr = state.tr
          const afterTagPos = tagNode.pos + tagNode.node.nodeSize
          
          tr.insert(afterTagPos, slice.content)
          tr.setSelection(TextSelection.create(tr.doc, afterTagPos + slice.content.size))
          
          view.dispatch(tr)
          return true  // 阻止默认粘贴行为
        }
        
        return false
      }
    }
  })
}
```

## 工具函数

### findTagNode

查找标签块节点。

**签名**：
```typescript
function findTagNode(state: EditorState): { node: Node; pos: number } | null
```

**实现**：
```typescript
export function findTagNode(state: EditorState) {
  let tagNode: { node: Node; pos: number } | null = null
  
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'tag') {
      tagNode = { node, pos }
      return false  // 停止遍历
    }
  })
  
  return tagNode
}
```

### getTagData

获取标签块数据。

**签名**：
```typescript
function getTagData(editor: Editor): TagItem | null
```

**实现**：
```typescript
export function getTagData(editor: Editor): TagItem | null {
  const tagNode = findTagNode(editor.state)
  
  if (!tagNode) return null
  
  return {
    id: tagNode.node.attrs.id,
    label: tagNode.node.attrs.label,
    icon: tagNode.node.attrs.icon,
    data: tagNode.node.attrs.data,
  }
}
```



## 响应式实现

### 监听 ref 变化

当使用 ref 配置时，需要监听 ref 的变化并同步到编辑器。

**实现要点**：
```typescript
import { watch, isRef } from 'vue'

export const Tag = Node.create<TagOptions>({
  name: 'tag',
  
  onCreate() {
    const { item } = this.options
    
    if (item && isRef(item)) {
      watch(
        item,
        (newValue, oldValue) => {
          if (newValue) {
            // 插入或替换标签
            this.editor.commands.insertTag(newValue)
          } else if (oldValue) {
            // 删除标签
            this.editor.commands.removeTag()
          }
        },
        { immediate: true }
      )
    }
  },
})
```

### 双向同步

删除标签时，需要同步更新 ref 的值。

**实现要点**：
```typescript
// 在 removeTag 命令中
removeTag: () => ({ state, dispatch, editor }) => {
  const tagNode = findTagNode(state)
  
  if (!tagNode) return false
  
  if (dispatch) {
    const tr = state.tr.delete(tagNode.pos, tagNode.pos + tagNode.node.nodeSize)
    dispatch(tr)
    
    // 获取标签数据
    const tagData = getTagData(editor)
    
    // 触发回调
    const tagExtension = editor.extensionManager.extensions.find(ext => ext.name === 'tag')
    const { item, onRemove } = tagExtension?.options || {}
    
    if (onRemove && tagData) {
      onRemove(tagData)
    }
    
    // 同步 ref
    if (item && isRef(item) && item.value) {
      item.value = null
    }
  }
  
  return true
}
```

## 使用示例

### 基础用法（响应式）

```vue
<template>
  <ChatInput v-model="content" :extensions="extensions" />
  <button @click="activateTag">激活标签</button>
  <button @click="clearTag">清除标签</button>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import IconSearch from './IconSearch.vue'

const content = ref('')
const currentTag = ref<TagItem | null>(null)

// 配置扩展
const extensions = [
  ChatInput.tag(currentTag, {
    hoverText: '点击退出场景',
    onInsert: (tag) => {
      console.log('标签已插入:', tag)
    },
    onRemove: (tag) => {
      console.log('标签已删除:', tag)
    }
  })
]

// 激活标签
const activateTag = () => {
  currentTag.value = {
    id: 'research',
    label: '深度研究',
    icon: h(IconSearch),
    data: 'research-mode'
  }
}

// 清除标签
const clearTag = () => {
  currentTag.value = null
}
</script>
```

### 命令式用法

```vue
<template>
  <ChatInput ref="chatInputRef" v-model="content" :extensions="extensions" />
  <button @click="insertTag">插入标签</button>
  <button @click="removeTag">删除标签</button>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import IconSearch from './IconSearch.vue'

const content = ref('')
const chatInputRef = ref()

// 配置扩展（不传 item，使用命令式）
const extensions = [
  ChatInput.tag(undefined, {
    onInsert: (tag) => {
      console.log('标签已插入:', tag)
    },
    onRemove: (tag) => {
      console.log('标签已删除:', tag)
    }
  })
]

const insertTag = () => {
  const editor = chatInputRef.value?.editor
  if (editor) {
    editor.commands.insertTag({
      id: 'research',
      label: '深度研究',
      icon: h(IconSearch),
      data: 'research-mode'
    })
  }
}

const removeTag = () => {
  const editor = chatInputRef.value?.editor
  if (editor) {
    editor.commands.removeTag()
  }
}
</script>
```

### 动态切换标签

```vue
<template>
  <ChatInput v-model="content" :extensions="extensions" />
  <button @click="switchTag('research')">深度研究</button>
  <button @click="switchTag('write')">帮我写作</button>
  <button @click="clearTag">清除标签</button>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import IconSearch from './IconSearch.vue'
import IconEdit from './IconEdit.vue'

const content = ref('')
const currentTag = ref<TagItem | null>(null)

const extensions = [
  ChatInput.tag(currentTag, {
    onRemove: (tag) => {
      console.log('标签已删除:', tag.label)
      // 响应式会自动同步，这里只做额外处理
    }
  })
]

const tags = {
  research: {
    id: 'research',
    label: '深度研究',
    icon: h(IconSearch),
    data: 'research-mode'
  },
  write: {
    id: 'write',
    label: '帮我写作',
    icon: h(IconEdit),
    data: 'write-mode'
  }
}

const switchTag = (type: 'research' | 'write') => {
  currentTag.value = tags[type]
}

const clearTag = () => {
  currentTag.value = null
}
</script>
```

## 注意事项

1. **图标类型**：`icon` 必须是 VNode，使用 `h()` 函数创建
2. **唯一性**：同一时间只能有一个标签块，新标签会自动替换旧标签
3. **位置固定**：标签块始终在开头，不能移动到其他位置
4. **响应式同步**：使用 ref 时，手动删除标签会自动将 ref 设为 null
5. **回调触发**：所有删除操作都会触发 `onRemove` 回调
6. **最大宽度**：标签文字超过 200px 会自动省略，可通过悬浮查看完整内容
7. **不可编辑**：标签块不可选中、不可拖拽、不可编辑内容

## 实现清单

### 文件结构

```
packages/components/src/chat-input/extensions/tag/
├── index.ts                 # 导出和便捷函数
├── extension.ts             # 扩展定义
├── tag-block-view.vue       # Vue 节点视图
├── commands.ts              # 命令定义
├── plugins.ts               # 插件（ESC、位置保证、粘贴处理）
├── types.ts                 # 类型定义
├── utils.ts                 # 工具函数
└── index.less               # 样式
```

### 实现步骤

1. **创建类型定义** (`types.ts`)
   - TagItem 接口
   - TagOptions 接口
   - 扩展 Commands 接口

2. **创建工具函数** (`utils.ts`)
   - findTagNode
   - getTagData

3. **创建命令** (`commands.ts`)
   - insertTag
   - removeTag
   - hasTag
   - getTag

4. **创建插件** (`plugins.ts`)
   - escKeyPlugin
   - positionGuardPlugin
   - pasteHandlerPlugin

5. **创建 Vue 组件** (`tag-block-view.vue`)
   - 标签块渲染
   - 悬浮交互
   - 关闭按钮

6. **创建扩展定义** (`extension.ts`)
   - 节点配置
   - 属性定义
   - 添加命令
   - 添加插件
   - 响应式监听

7. **创建样式** (`index.less`)
   - 标签块样式
   - 悬浮提示框样式
   - 关闭按钮样式

8. **创建导出文件** (`index.ts`)
   - 导出扩展
   - 导出类型
   - 导出便捷函数

9. **更新主导出** (`extensions/index.ts`)
   - 添加 Tag 相关导出

10. **更新主导出** (`extensions/index.ts`)
    - 添加 Tag 相关导出
