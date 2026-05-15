<script setup lang="ts">
import type { ChatLeftSidebarMode } from '@/types/layout'

defineProps<{
  mode: ChatLeftSidebarMode
}>()
</script>

<template>
  <section class="demo-sidebar-content-area">
    <div class="demo-sidebar-content-area__placeholder">
      <strong>自定义内容区</strong>
      <p>这里后续可以替换成 History、Tabs 或任意自定义内容。</p>
      <span>当前模式：{{ mode }}</span>
    </div>
  </section>
</template>

<style scoped>
.demo-sidebar-content-area {
  min-height: 0;
}

.demo-sidebar-content-area__placeholder {
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: 220px;
  padding: 16px;
  border: 1px dashed #dbe1ea;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #ffffff 100%);
}

.demo-sidebar-content-area__placeholder strong {
  font-size: 14px;
}

.demo-sidebar-content-area__placeholder p,
.demo-sidebar-content-area__placeholder span {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}
</style>
