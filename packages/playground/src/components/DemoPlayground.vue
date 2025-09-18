<template>
  <div class="demo-playground">
    <DemoSidebar @demo-selected="handleDemoSelected" />
    <div class="main-content">
      <DemoActionBar v-if="selectedDemo" :demo="selectedDemo" @reset="handleReset" />
      <div class="repl-container">
        <Repl
          v-if="replStore"
          ref="replRef"
          :store="replStore"
          :editor="Monaco"
          :show-compile-output="false"
          :show-import-map="true"
          :clear-console="false"
          :theme="isDark ? 'dark' : 'light'"
          @keydown="handleKeydown"
        />
        <div v-else class="loading-placeholder">
          <LoadingSpinner title="Demo Playground" text="请在左侧选择一个 Demo 示例开始编辑" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, provide, Ref } from 'vue'
import { Repl } from '@vue/repl'
import { useStore, type Store } from '@vue/repl/core'
import Monaco from '@vue/repl/monaco-editor'
import type { DemoFile } from '../types/demo'
import DemoSidebar from './DemoSidebar.vue'
import DemoActionBar from './DemoActionBar.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { generateImportMap } from '../utils/import-map'

// 从父组件注入主题状态
const isDark = inject<Ref<boolean>>('isDark', ref(false))

const selectedDemo = ref<DemoFile | null>(null)
const replStore = ref<Store | null>(null)
const replRef = ref<InstanceType<typeof Repl>>()
const currentContent = ref('')

// 为 DemoActionBar 提供内容状态
provide('currentContent', currentContent)

// 当选择 demo 时，创建新的 repl store 并加载文件
const handleDemoSelected = async (demo: DemoFile) => {
  selectedDemo.value = demo

  try {
    // 创建新的 store 实例
    const store = useStore()
    store.init()

    // 设置 demo 文件
    const files = {
      'App.vue': demo.content,
      'utils.js': `// Demo utilities
export const demoInfo = {
  name: '${demo.name}',
  component: '${demo.component}',
  path: '${demo.path}'
}`,
      'index.css': `/* TinyRobot 样式导入 */
@import url('https://unpkg.com/@opentiny/tiny-robot@0.3.0-rc.4/dist/style.css');
/* TinyVue 样式导入 */
@import url('https://registry.npmmirror.com/@opentiny/vue-theme/3.22/files/index.css');

body {
  background: #f5f5f5;
}
`,
    }

    await store.setFiles(files, 'App.vue')

    // 设置 import map
    const importMap = await generateImportMap({
      tinyRobotVersion: 'latest',
      vueVersion: 'latest',
      typescriptVersion: 'latest',
    })
    store.setImportMap(importMap)

    replStore.value = store
    currentContent.value = demo.content
  } catch (error) {
    console.error('Failed to load demo:', error)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    // TODO: 保存功能
  }
}

const handleReset = async () => {
  if (selectedDemo.value) {
    await handleDemoSelected(selectedDemo.value)
  }
}
</script>

<style scoped>
.demo-playground {
  height: 100vh;
  display: flex;
  background: var(--tr-bg-primary);
  transition: var(--tr-transition-normal);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.repl-container {
  flex: 1;
  overflow: hidden;
}

.loading-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tr-bg-secondary);
}
</style>
