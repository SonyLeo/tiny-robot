<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFloatingDropdown } from '../composables/useFloatingDropdown'
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation'
import { getProviderIcon } from '../utils/iconMap'

const props = defineProps<{
  models: string[]
}>()

const currentModel = defineModel<string>()

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)

const { isOpen } = useFloatingDropdown(referenceEl, floatingEl)

const { highlightedIndex, setHighlightedIndex } = useKeyboardNavigation({
  enabled: isOpen,
  itemCount: computed(() => props.models.length),
  onSelect: (index) => {
    handleSelectModel(props.models[index])
  },
  onClose: () => {
    isOpen.value = false
  },
})

// 打开时高亮当前选中的模型
const handleOpenDropdown = () => {
  isOpen.value = true
  const currentIndex = props.models.indexOf(currentModel.value ?? '')
  setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0)
}

function handleSelectModel(model: string) {
  currentModel.value = model
  isOpen.value = false
}

function toggleDropdown() {
  if (isOpen.value) {
    isOpen.value = false
  } else {
    handleOpenDropdown()
  }
}

function handleMouseEnter(index: number) {
  highlightedIndex.value = index
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
      <component v-if="currentProvider" :is="currentProvider" class="tr-model-selector__icon-provider" :size="20" />
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
                  <component
                    v-if="getProviderIcon(model)"
                    :is="getProviderIcon(model)"
                    class="tr-model-selector__option-icon"
                    :size="18"
                  />
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
