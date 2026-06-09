<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

type LayoutMainScrollHost = HTMLElement | { $el: Element | null } | null | undefined

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const sections = Array.from({ length: 12 }, (_, index) => ({
  title: `Section ${index + 1}`,
  text: '普通滚动容器同样可以直接交给 Layout.Main 管理。',
}))
</script>

<template>
  <TrLayout class="layout-main-scroll-example layout-main-scroll-example--div">
    <template #main>
      <TrLayout.Main :scroll-host="scrollHostRef">
        <div ref="scrollHostRef" class="layout-main-scroll-div__host">
          <article v-for="section in sections" :key="section.title" class="layout-main-scroll-div__card">
            <strong>{{ section.title }}</strong>
            <p>{{ section.text }}</p>
          </article>
        </div>
      </TrLayout.Main>
    </template>
  </TrLayout>
</template>

<style scoped>
.layout-main-scroll-example {
  height: 100%;
  --tr-layout-height: 100%;
}

.layout-main-scroll-div__host {
  display: grid;
  gap: 12px;
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding: 16px;
}

.layout-main-scroll-div__card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 12px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-main-scroll-div__card p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
