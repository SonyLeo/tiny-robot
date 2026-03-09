<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFloatingDropdown } from '../composables/useFloatingDropdown'

defineProps<{
  models: string[]
}>()

const currentModel = defineModel<string>()

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)
const { isOpen } = useFloatingDropdown(referenceEl, floatingEl)

function handleSelectModel(model: string) {
  currentModel.value = model
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
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
  <div class="tr-model-selector-wrapper">
    <button
      ref="referenceEl"
      class="tr-model-selector-trigger"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-label="选择模型"
    >
      <span class="tr-model-selector-icon-provider">{{ currentProvider }}</span>
      <span class="tr-model-selector-value">{{ currentModel }}</span>
      <svg
        class="tr-model-selector-chevron"
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

    <!-- 分离定位层和样式层：外层用于 floating-ui 定位，内层用于样式和过渡 -->
    <transition name="tr-model-selector-fade">
      <div v-if="isOpen" ref="floatingEl" class="tr-model-selector-dropdown-wrapper">
        <div class="tr-model-selector-dropdown">
          <div class="tr-model-selector-content">
            <div v-for="model in models" :key="model" class="tr-model-selector-item">
              <button
                class="tr-model-selector-option"
                :class="{ 'is-selected': currentModel === model }"
                @click="handleSelectModel(model)"
              >
                <div class="tr-model-selector-option-left">
                  <span class="tr-model-selector-option-icon">{{ getProviderIcon(model) }}</span>
                  <span class="tr-model-selector-option-label">{{ model }}</span>
                </div>
                <svg
                  v-if="currentModel === model"
                  class="tr-model-selector-check"
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

<style scoped>
.tr-model-selector-wrapper {
  position: relative;
  display: inline-block;
}

.tr-model-selector-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 40px;
}

.tr-model-selector-trigger:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.tr-model-selector-trigger:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tr-model-selector-icon-provider {
  font-size: 16px;
  flex-shrink: 0;
}

.tr-model-selector-value {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-model-selector-chevron {
  flex-shrink: 0;
  color: #6b7280;
  transition: transform 0.2s ease;
  margin-left: auto;
}

.tr-model-selector-chevron.is-open {
  transform: rotate(180deg);
}

/* 定位层：floating-ui 只负责计算和应用 transform */
.tr-model-selector-dropdown-wrapper {
  position: absolute;
  width: max-content;
  top: 0;
  left: 0;
  z-index: 9999;
}

/* 样式层：处理外观、过渡、阴影等 */
.tr-model-selector-dropdown {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 240px;
  overflow: hidden;
}

.tr-model-selector-content {
  padding: 6px;
  max-height: 320px;
  overflow-y: auto;
}

.tr-model-selector-item {
  padding: 0;
}

.tr-model-selector-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  border-radius: 6px;
}

.tr-model-selector-option:hover {
  background-color: #f3f4f6;
}

.tr-model-selector-option.is-selected {
  background-color: #eff6ff;
  color: #1e40af;
  font-weight: 500;
}

.tr-model-selector-option-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.tr-model-selector-option-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tr-model-selector-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-model-selector-check {
  flex-shrink: 0;
  margin-left: 8px;
  color: #3b82f6;
}

.tr-model-selector-fade-enter-active,
.tr-model-selector-fade-leave-active {
  transition: all 0.15s ease;
}

.tr-model-selector-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tr-model-selector-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.tr-model-selector-content::-webkit-scrollbar {
  width: 6px;
}

.tr-model-selector-content::-webkit-scrollbar-track {
  background: transparent;
}

.tr-model-selector-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.tr-model-selector-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
