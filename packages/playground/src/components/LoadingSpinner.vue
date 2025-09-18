<template>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: 'Loading...',
})
</script>

<style scoped lang="less">
.loading-container {
  // CSS 自定义属性定义
  --spinner-size: 32px;
  --spinner-border-width: 3px;
  --container-padding: 40px;
  --container-gap: 16px;
  --animation-duration: 1s;

  // 亮色模式颜色变量
  --primary-color: #655bf8;
  --spinner-bg: #f3f3f3;
  --text-color: #666;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--container-padding);
  gap: var(--container-gap);

  .loading-spinner {
    width: var(--spinner-size);
    height: var(--spinner-size);
    border: var(--spinner-border-width) solid var(--spinner-bg);
    border-top: var(--spinner-border-width) solid var(--primary-color);
    border-radius: 50%;
    animation: spin var(--animation-duration) linear infinite;
  }

  .loading-text {
    color: var(--text-color);
    font-size: 14px;
    margin: 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// Dark theme
:global(.dark) .loading-container {
  // 暗色模式颜色变量覆盖
  --primary-color: #58a6ff;
  --spinner-bg: #30363d;
  --text-color: #ccc;
}
</style>
