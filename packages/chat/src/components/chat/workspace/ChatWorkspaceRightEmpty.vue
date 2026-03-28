<script setup lang="ts">
import { IconFileFolder } from '@opentiny/tiny-robot-svgs'

defineOptions({ name: 'TrChatWorkspaceRightEmpty' })
</script>

<template>
  <div class="tr-chat-workspace-right-empty">
    <span class="tr-chat-workspace-right-empty__icon">
      <IconFileFolder />
    </span>
    <strong>暂无扩展内容</strong>
    <span>后续可在此查看文件、链接或扩展结果。</span>
  </div>
</template>

<style scoped>
.tr-chat-workspace-right-empty {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 28px;
  text-align: center;
  color: var(--workspace-shell-text-secondary, var(--tr-text-secondary, #6b7280));
}

.tr-chat-workspace-right-empty__icon {
  width: 72px;
  height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: color-mix(in srgb, var(--workspace-shell-hover-bg, rgba(15, 23, 42, 0.06)) 72%, transparent);
  color: var(--workspace-shell-text-secondary, var(--tr-text-secondary, #6b7280));
  margin: 0 auto 8px;
}

.tr-chat-workspace-right-empty__icon :deep(svg) {
  width: 32px;
  height: 32px;
}

.tr-chat-workspace-right-empty strong {
  color: var(--workspace-shell-text-primary, var(--tr-text-primary, #111827));
  font-size: 18px;
  font-weight: 700;
}

.tr-chat-workspace-right-empty span {
  font-size: 14px;
  line-height: 1.7;
  max-width: 280px;
  margin: 0 auto;
}
</style>
