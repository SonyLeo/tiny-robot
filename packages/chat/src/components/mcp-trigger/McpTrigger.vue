<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import { MCP_MANAGER_KEY } from '@/context'
import ChatMcpPanel from '../chat/ChatMcpPanel.vue'

defineOptions({ name: 'TrMcpTrigger' })

const props = withDefaults(
  defineProps<{
    label?: string
    showCount?: boolean
  }>(),
  {
    label: '扩展',
    showCount: true,
  },
)

const visibleModel = defineModel<boolean>('visible')
const internalVisible = ref(false)
const mcpManager = inject(MCP_MANAGER_KEY, null)

if (!mcpManager) {
  throw new Error('mcpManager not provided')
}

const isVisible = computed({
  get: () => visibleModel.value ?? internalVisible.value,
  set: (value: boolean) => {
    internalVisible.value = value
    visibleModel.value = value
  },
})

const activeCount = computed(() => mcpManager.activeCount.value)
const isActive = computed(() => activeCount.value > 0)
const triggerTitle = computed(() =>
  isActive.value ? `${props.label}，已激活 ${activeCount.value} 个插件` : `${props.label}，当前没有激活插件`,
)

function openPanel() {
  isVisible.value = true
}
</script>

<template>
  <div class="tr-mcp-trigger__wrapper" data-testid="chat-mcp-trigger">
    <button
      type="button"
      class="tr-mcp-trigger__button"
      :class="{ 'is-active': isActive }"
      :aria-expanded="isVisible"
      :aria-label="triggerTitle"
      :title="triggerTitle"
      data-testid="chat-mcp-trigger-button"
      @click="openPanel"
    >
      <IconPlugin class="tr-mcp-trigger__icon" />
      <span class="tr-mcp-trigger__label" data-testid="chat-mcp-trigger-label">{{ label }}</span>
      <span
        v-if="showCount && activeCount"
        class="tr-mcp-trigger__count"
        data-testid="chat-mcp-trigger-count"
        aria-hidden="true"
      >
        {{ activeCount }}
      </span>
    </button>

    <ChatMcpPanel v-model:visible="isVisible" />
  </div>
</template>
