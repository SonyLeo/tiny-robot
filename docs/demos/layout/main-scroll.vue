<script setup lang="ts">
import { computed, ref } from 'vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')

const currentExample = computed(() => (activeExample.value === 'bubble' ? MainScrollBubble : MainScrollDiv))
</script>

<template>
  <div class="layout-main-scroll-demo">
    <div class="layout-main-scroll-demo__switcher" aria-label="主区滚动示例切换">
      <button
        type="button"
        class="layout-main-scroll-demo__switch"
        :class="{ 'is-active': activeExample === 'bubble' }"
        :aria-pressed="activeExample === 'bubble'"
        @click="activeExample = 'bubble'"
      >
        BubbleList
      </button>

      <button
        type="button"
        class="layout-main-scroll-demo__switch"
        :class="{ 'is-active': activeExample === 'div' }"
        :aria-pressed="activeExample === 'div'"
        @click="activeExample = 'div'"
      >
        普通 div
      </button>
    </div>

    <p class="layout-main-scroll-demo__tip">两种写法都把真实滚动容器传给 `scrollHost`，区别只在滚动内容本身是什么。</p>

    <div class="layout-main-scroll-demo__stage">
      <component :is="currentExample" />
    </div>
  </div>
</template>

<style scoped>
.layout-main-scroll-demo {
  display: grid;
  gap: 12px;
}

.layout-main-scroll-demo__switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-main-scroll-demo__switch {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  cursor: pointer;
}

.layout-main-scroll-demo__switch.is-active {
  border-color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
  color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
}

.layout-main-scroll-demo__tip {
  margin: 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__stage {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  --tr-layout-height: 400px;
}
</style>
