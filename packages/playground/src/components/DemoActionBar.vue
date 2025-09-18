<template>
  <div class="demo-actions-bar">
    <div class="demo-info">
      <h3 class="demo-title">{{ demoTitle }}</h3>
      <span class="demo-path">{{ demo?.path }}</span>
    </div>
    <div class="editor-actions">
      <button class="action-btn" @click="resetDemo" title="重置到原始版本">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
        重置
      </button>
      <button class="action-btn" @click="copyCode" title="复制代码">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
          />
        </svg>
        复制
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import type { DemoFile } from '../types/demo'
import { getDemoTitle } from '../utils/demo-loader'

interface Props {
  demo: DemoFile | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reset: []
  save: []
  copy: []
  openNewTab: []
}>()

// 从父组件注入当前内容
const currentContent = inject<Ref<string>>('currentContent', ref(''))

const demoTitle = computed(() => {
  return props.demo ? getDemoTitle(props.demo.name) : ''
})

const resetDemo = () => {
  emit('reset')
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(currentContent.value)
    showNotification('代码已复制到剪贴板', 'success')
    emit('copy')
  } catch (error) {
    console.error('Failed to copy code:', error)
    showNotification('复制失败', 'error')
  }
}

// 简单的通知函数
const showNotification = (message: string, type: 'success' | 'error') => {
  // 创建通知元素
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
  `

  document.body.appendChild(notification)

  // 3秒后移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}
</script>

<style scoped>
.demo-actions-bar {
  padding: var(--tr-spacing-md) var(--tr-spacing-lg);
  border-bottom: 1px solid var(--tr-border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--tr-bg-secondary);
  backdrop-filter: blur(8px);
  height: var(--tr-action-bar-height);
}

.demo-info {
  flex: 1;
}

.demo-title {
  margin: 0 0 var(--tr-spacing-xs) 0;
  font-size: var(--tr-font-lg);
  font-weight: 600;
  color: var(--tr-text-primary);
}

.demo-path {
  font-size: var(--tr-font-sm);
  color: var(--tr-text-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: var(--tr-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--tr-radius-sm);
  border: 1px solid var(--tr-border-primary);
}

.editor-actions {
  display: flex;
  gap: var(--tr-spacing-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--tr-spacing-sm) var(--tr-spacing-md);
  border: 1px solid var(--tr-border-primary);
  border-radius: var(--tr-radius-lg);
  background: var(--tr-bg-primary);
  color: var(--tr-text-primary);
  font-size: var(--tr-font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--tr-transition-normal);
  box-shadow: 0 1px 2px var(--tr-shadow-sm);
}

.action-btn:hover:not(:disabled) {
  background: var(--tr-bg-tertiary);
  border-color: var(--tr-color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--tr-shadow-md);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px var(--tr-shadow-sm);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn.primary {
  background: var(--tr-color-primary);
  color: white;
  border-color: var(--tr-color-primary);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--tr-color-primary-hover);
  border-color: var(--tr-color-primary-hover);
}

.action-btn svg {
  opacity: 0.8;
  transition: opacity var(--tr-transition-fast);
}

.action-btn:hover svg {
  opacity: 1;
}
</style>
