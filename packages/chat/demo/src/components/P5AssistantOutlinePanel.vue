<script setup lang="ts">
import { computed } from 'vue'
import { useAssistantOutlineContext } from '@/components/chat/assistant-outline/context'

defineOptions({ name: 'P5AssistantOutlinePanel' })

const context = useAssistantOutlineContext()

const shouldShow = computed(() => Boolean(context && context.items.value.length > 0))
const items = computed(() => context?.items.value ?? [])
const activeItemId = computed(() => context?.activeItemId.value)

function handleSelect(itemId: string) {
  const messageIndex = context?.activeMessageIndex.value

  if (!context || messageIndex === undefined) {
    return
  }

  context.selectItem(messageIndex, itemId)
}
</script>

<template>
  <div class="p5-assistant-outline-panel">
    <div v-if="shouldShow" class="p5-assistant-outline-panel__list" data-testid="p5-outline-panel">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="p5-assistant-outline-panel__item"
        :class="{ 'is-active': item.id === activeItemId }"
        :data-item-id="item.id"
        @click="handleSelect(item.id)"
      >
        <span class="p5-assistant-outline-panel__level">H{{ item.level }}</span>
        <span class="p5-assistant-outline-panel__label">{{ item.label }}</span>
      </button>
    </div>

    <div v-else class="p5-assistant-outline-panel__empty">
      <span>Outline</span>
      <strong>Send a prompt or pick a heading-rich answer to see the section map.</strong>
    </div>
  </div>
</template>

<style scoped>
.p5-assistant-outline-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.p5-assistant-outline-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.p5-assistant-outline-panel__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--chat-panel-border);
  border-radius: 14px;
  background: var(--chat-panel-bg);
  color: var(--chat-text-primary);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.p5-assistant-outline-panel__item:hover {
  border-color: var(--chat-accent-border);
  background: var(--chat-surface-bg-hover);
}

.p5-assistant-outline-panel__item.is-active {
  border-color: var(--chat-accent-border);
  background: var(--chat-accent-bg);
  transform: translateX(-2px);
}

.p5-assistant-outline-panel__level {
  min-width: 28px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--chat-surface-bg-muted);
  color: var(--chat-text-secondary);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.p5-assistant-outline-panel__label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.p5-assistant-outline-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px dashed var(--chat-panel-border);
  border-radius: 14px;
  background: var(--chat-panel-bg-muted);
}

.p5-assistant-outline-panel__empty span {
  font-size: 11px;
  color: var(--chat-text-secondary);
}

.p5-assistant-outline-panel__empty strong {
  font-size: 12px;
  color: var(--chat-text-primary);
}
</style>
