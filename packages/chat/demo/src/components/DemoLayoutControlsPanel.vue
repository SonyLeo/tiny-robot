<script setup lang="ts">
const leftSidebarWidth = defineModel<number>('leftSidebarWidth', { required: true })
const leftRailWidth = defineModel<number>('leftRailWidth', { required: true })
const rightPanelWidth = defineModel<number>('rightPanelWidth', { required: true })
</script>

<template>
  <section class="demo-card">
    <h2>布局参数</h2>

    <label class="demo-range">
      <span>左侧展开宽度：{{ leftSidebarWidth }}px</span>
      <input v-model.number="leftSidebarWidth" type="range" min="220" max="420" />
    </label>

    <label class="demo-range">
      <span>左侧 rail 宽度：{{ leftRailWidth }}px</span>
      <input v-model.number="leftRailWidth" type="range" min="0" max="96" />
    </label>

    <label class="demo-range">
      <span>右侧宽度：{{ rightPanelWidth }}px</span>
      <input v-model.number="rightPanelWidth" type="range" min="260" max="420" />
    </label>
  </section>
</template>

<style scoped>
.demo-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #dbe1ea;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.demo-card h2 {
  margin: 0;
  font-size: 18px;
}

.demo-range {
  display: grid;
  gap: 8px;
}
</style>
