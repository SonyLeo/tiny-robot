<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChatWorkspacePanelHostItem } from '@/types'
import { coerceWorkspacePanelId, findWorkspacePanelById } from './runtime'

defineOptions({ name: 'TrChatWorkspacePanelHost' })

interface WorkspacePanelHostProps {
  title?: string
  subtitle?: string
  layout?: 'horizontal' | 'vertical'
  items: ChatWorkspacePanelHostItem[]
  modelValue?: string
  activePanelId?: string
  defaultActivePanelId?: string
}

const props = withDefaults(defineProps<WorkspacePanelHostProps>(), {
  title: undefined,
  subtitle: undefined,
  layout: 'horizontal',
  modelValue: undefined,
  activePanelId: undefined,
  defaultActivePanelId: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:activePanelId': [value: string]
  change: [panel: ChatWorkspacePanelHostItem | undefined]
}>()

const uncontrolledActivePanelId = ref(
  coerceWorkspacePanelId({
    items: props.items,
    requestedId: props.defaultActivePanelId,
  }),
)

watch(
  () => props.activePanelId,
  (nextValue) => {
    if (nextValue !== undefined) {
      uncontrolledActivePanelId.value = nextValue
    }
  },
)

watch(
  () => props.defaultActivePanelId,
  (nextValue) => {
    if (props.modelValue === undefined && props.activePanelId === undefined && nextValue !== undefined) {
      uncontrolledActivePanelId.value = nextValue
    }
  },
)

watch(
  () => props.items,
  (items) => {
    uncontrolledActivePanelId.value = coerceWorkspacePanelId({
      items,
      requestedId: props.modelValue ?? props.activePanelId ?? uncontrolledActivePanelId.value,
      fallbackId: props.defaultActivePanelId,
    })
  },
  { deep: true },
)

const activePanel = computed<ChatWorkspacePanelHostItem | undefined>(() => {
  const activeId = coerceWorkspacePanelId({
    items: props.items,
    requestedId: props.modelValue ?? props.activePanelId ?? uncontrolledActivePanelId.value,
    fallbackId: props.defaultActivePanelId,
  })

  return findWorkspacePanelById(props.items, activeId) ?? props.items[0]
})

function selectPanel(panelId: string) {
  if (props.modelValue === undefined && props.activePanelId === undefined) {
    uncontrolledActivePanelId.value = panelId
  }

  emit('update:modelValue', panelId)
  emit('update:activePanelId', panelId)
  emit('change', findWorkspacePanelById(props.items, panelId))
}
</script>

<template>
  <div class="tr-workspace-panel-host" :class="`is-layout-${props.layout}`">
    <div v-if="props.title || props.subtitle" class="tr-workspace-panel-host__header">
      <strong v-if="props.title">{{ props.title }}</strong>
      <span v-if="props.subtitle">{{ props.subtitle }}</span>
    </div>

    <div class="tr-workspace-panel-host__tabs">
      <button
        v-for="item in props.items"
        :key="item.id"
        type="button"
        class="tr-workspace-panel-host__tab"
        :class="{ 'is-active': item.id === activePanel?.id }"
        @click="selectPanel(item.id)"
      >
        <strong>{{ item.label }}</strong>
        <span v-if="item.description">{{ item.description }}</span>
      </button>
    </div>

    <Transition name="tr-workspace-panel-fade" mode="out-in">
      <div :key="activePanel?.id" class="tr-workspace-panel-host__body">
        <slot :active-panel="activePanel" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tr-workspace-panel-host {
  --workspace-panel-header-color: var(--chat-text-primary);
  --workspace-panel-subtitle-color: var(--chat-text-secondary);
  --workspace-panel-tab-bg: var(--chat-panel-bg);
  --workspace-panel-tab-border: var(--chat-panel-border);
  --workspace-panel-tab-shadow: none;
  --workspace-panel-tab-hover-bg: var(--chat-panel-bg-muted);
  --workspace-panel-tab-hover-border: var(--chat-accent-border);
  --workspace-panel-tab-hover-shadow: var(--chat-panel-shadow);
  --workspace-panel-tab-active-bg: var(--chat-panel-active-bg);
  --workspace-panel-tab-active-border: var(--chat-panel-active-border);
  --workspace-panel-tab-active-text: var(--chat-panel-active-text);
  --workspace-panel-body-bg: var(--chat-panel-bg-muted);
  --workspace-panel-body-border: var(--chat-panel-border);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.tr-workspace-panel-host__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tr-workspace-panel-host__header strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--workspace-panel-header-color);
}

.tr-workspace-panel-host__header span {
  font-size: 11px;
  color: var(--workspace-panel-subtitle-color);
}

.tr-workspace-panel-host__tabs {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.tr-workspace-panel-host__tab {
  padding: 12px 12px 11px;
  border-radius: 13px;
  border: 1px solid var(--workspace-panel-tab-border);
  background: var(--workspace-panel-tab-bg);
  box-shadow: var(--workspace-panel-tab-shadow);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.tr-workspace-panel-host__tab:hover {
  transform: translateY(-1px);
  background: var(--workspace-panel-tab-hover-bg);
  border-color: var(--workspace-panel-tab-hover-border);
  box-shadow: var(--workspace-panel-tab-hover-shadow);
}

.tr-workspace-panel-host__tab.is-active {
  border-color: var(--workspace-panel-tab-active-border);
  background: var(--workspace-panel-tab-active-bg);
}

.tr-workspace-panel-host__tab strong {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--workspace-panel-header-color);
}

.tr-workspace-panel-host__tab span {
  display: block;
  font-size: 11px;
  color: var(--workspace-panel-subtitle-color);
}

.tr-workspace-panel-host__tab.is-active strong {
  color: var(--workspace-panel-tab-active-text);
}

/* ============================
   Horizontal Layout Override
   ============================ */

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tabs {
  flex-direction: row;
  padding: 6px;
  gap: 8px;
  border-radius: 18px;
  border: 1px solid var(--workspace-panel-tabs-border);
  background: var(--workspace-panel-tabs-bg);
  box-shadow: var(--workspace-panel-tabs-shadow);
}

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  box-shadow: none;
}

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab strong {
  margin-bottom: 2px;
  color: var(--workspace-panel-tab-horizontal-text);
  font-weight: 500;
  transition:
    color 0.2s ease,
    font-weight 0.2s ease;
}

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab span {
  color: var(--workspace-panel-tab-horizontal-subtitle);
}

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab:hover {
  background: var(--workspace-panel-tab-horizontal-hover-bg);
  transform: none;
  box-shadow: none;
}

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab.is-active {
  background: var(--workspace-panel-tab-horizontal-active-bg);
  box-shadow: var(--workspace-panel-tab-horizontal-active-shadow);
}

.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab.is-active strong,
.tr-workspace-panel-host.is-layout-horizontal .tr-workspace-panel-host__tab.is-active span {
  color: var(--workspace-panel-tab-horizontal-active-text);
  font-weight: 600;
}

.tr-workspace-panel-host__body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tr-workspace-panel-fade-enter-active,
.tr-workspace-panel-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.22s ease;
}

.tr-workspace-panel-fade-enter-from,
.tr-workspace-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
