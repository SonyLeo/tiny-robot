<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMagicKeys, onKeyStroke } from '@vueuse/core'
import { useFloatingDropdown } from '../composables/useFloatingDropdown'

const props = defineProps<{
  models: string[]
}>()

const currentModel = defineModel<string>()

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)

// 内联 composable - 仅在此组件使用
const { isOpen } = useFloatingDropdown(referenceEl, floatingEl)

// 键盘导航状态
const highlightedIndex = ref(0)
const { ArrowUp, ArrowDown } = useMagicKeys()

// 监听下拉框打开/关闭，重置高亮
watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
    // 打开时，高亮当前选中的模型
    const currentIndex = props.models.indexOf(currentModel.value ?? '')
    highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
  } else {
    // 关闭时重置
    highlightedIndex.value = 0
  }
})

// 上下导航（使用 useMagicKeys 的响应式状态）
watch(ArrowUp, (pressed) => {
  if (pressed && isOpen.value) {
    highlightedIndex.value = Math.max(0, highlightedIndex.value - 1)
  }
})

watch(ArrowDown, (pressed) => {
  if (pressed && isOpen.value) {
    highlightedIndex.value = Math.min(props.models.length - 1, highlightedIndex.value + 1)
  }
})

// Enter 选择（使用 onKeyStroke 并 preventDefault 阻止后续 click 事件）
onKeyStroke('Enter', (event) => {
  if (isOpen.value && props.models[highlightedIndex.value]) {
    event.preventDefault()
    handleSelectModel(props.models[highlightedIndex.value])
  }
})

function handleSelectModel(model: string) {
  currentModel.value = model
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleMouseEnter(index: number) {
  highlightedIndex.value = index
}

function getProviderIcon(model: string): string {
  if (model.includes('gpt')) return '🧠'
  if (model.includes('deepseek')) return '🔷'
  if (model.includes('llama')) return '🦙'
  if (model.includes('qwen')) return '🌟'
  if (model.includes('claude')) return '🤖'
  return '✨'
}

const currentProvider = computed(() => getProviderIcon(currentModel.value ?? ''))
</script>

<template>
  <div class="tr-model-selector__wrapper">
    <button
      ref="referenceEl"
      class="tr-model-selector__trigger"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      :title="currentModel"
      aria-label="选择模型"
    >
      <span class="tr-model-selector__icon-provider">{{ currentProvider }}</span>
      <span class="tr-model-selector__value">{{ currentModel }}</span>
      <svg
        class="tr-model-selector__chevron"
        :class="{ 'is-open': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <transition name="tr-model-selector-fade">
      <div v-if="isOpen" ref="floatingEl" class="tr-model-selector__dropdown-wrapper">
        <div class="tr-model-selector__dropdown">
          <div class="tr-model-selector__content">
            <div
              v-for="(model, index) in models"
              :key="model"
              class="tr-model-selector__item"
              @mouseenter="handleMouseEnter(index)"
            >
              <button
                class="tr-model-selector__option"
                :class="{
                  'is-selected': currentModel === model,
                  'is-highlighted': highlightedIndex === index,
                }"
                @click="handleSelectModel(model)"
              >
                <div class="tr-model-selector__option-left">
                  <span class="tr-model-selector__option-icon">{{ getProviderIcon(model) }}</span>
                  <span class="tr-model-selector__option-label" :title="model">{{ model }}</span>
                </div>
                <svg
                  v-if="currentModel === model"
                  class="tr-model-selector__check"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="less">
// 样式已迁移到 packages/chat/src/styles/model-selector.less
// 使用全局 CSS 变量支持主题切换和暗色模式
</style>
