<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChatWorkspacePanelHostItem } from '../../types'
import { coerceWorkspacePanelId, findWorkspacePanelById } from './runtime'

defineOptions({ name: 'TrChatWorkspacePanelHost' })

interface WorkspacePanelHostProps {
  title?: string
  subtitle?: string
  items: ChatWorkspacePanelHostItem[]
  modelValue?: string
  activePanelId?: string
  defaultActivePanelId?: string
}

const props = withDefaults(defineProps<WorkspacePanelHostProps>(), {
  title: undefined,
  subtitle: undefined,
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
  <div class="tr-workspace-panel-host">
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
  color: #243043;
}

.tr-workspace-panel-host__header span {
  font-size: 11px;
  color: #7b8798;
}

.tr-workspace-panel-host__tabs {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.tr-workspace-panel-host__tab {
  padding: 12px 12px 11px;
  border-radius: 13px;
  border: 1px solid rgba(226, 232, 240, 0.78);
  background: rgba(255, 255, 255, 0.72);
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
  border-color: rgba(59, 130, 246, 0.14);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.tr-workspace-panel-host__tab.is-active {
  border-color: rgba(59, 130, 246, 0.22);
  background: rgba(239, 246, 255, 0.7);
}

.tr-workspace-panel-host__tab strong {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #243043;
}

.tr-workspace-panel-host__tab span {
  display: block;
  font-size: 11px;
  color: #8190a5;
}

.tr-workspace-panel-host__body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.72);
  background: rgba(255, 255, 255, 0.6);
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
