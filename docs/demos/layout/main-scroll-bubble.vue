<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type { LayoutMainScrollHost } from '@opentiny/tiny-robot'

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const messages = Array.from({ length: 24 }, (_, index) => ({
  role: index % 2 === 0 ? 'assistant' : 'user',
  content: `layout message ${index + 1}`,
}))
</script>

<template>
  <TrLayout class="layout-main-scroll-example layout-main-scroll-example--bubble">
    <template #main>
      <TrLayout.Main :scroll-host="scrollHostRef">
        <BubbleList ref="scrollHostRef" :messages="messages" />
      </TrLayout.Main>
    </template>
  </TrLayout>
</template>

<style scoped>
.layout-main-scroll-example {
  height: 100%;
  --tr-layout-height: 100%;
}

.layout-main-scroll-example--bubble {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
