<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type { LayoutMainScrollHost } from '@opentiny/tiny-robot'
import './demo.css'

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const messages = Array.from({ length: 36 }, (_, index) => ({
  role: index % 2 === 0 ? 'assistant' : 'user',
  content: `layout message ${index + 1}`,
}))
</script>

<template>
  <div class="layout-demo-shell layout-demo-shell--scroll">
    <TrLayout class="layout-demo-layout">
      <template #header>
        <div class="layout-demo-header">Main Scroll</div>
      </template>

      <template #main>
        <TrLayout.Main :scroll-host="scrollHostRef">
          <BubbleList ref="scrollHostRef" class="layout-demo-scroll-host" :messages="messages" />
        </TrLayout.Main>
      </template>

      <template #footer>
        <div class="layout-demo-footer">Footer</div>
      </template>
    </TrLayout>
  </div>
</template>
