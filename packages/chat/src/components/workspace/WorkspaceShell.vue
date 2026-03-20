<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'
import type { TrChatWorkspaceShellProps, ChatWorkspacePanelDefinition } from '../../types'
import {
  coerceWorkspacePanelId,
  findWorkspacePanelById,
  resolveWorkspaceCollapsedState,
  resolveWorkspaceRegionWidth,
  toWorkspacePanelHostItems,
} from './runtime'

defineOptions({ name: 'TrChatWorkspaceShell' })

const props = defineProps<TrChatWorkspaceShellProps>()
const emit = defineEmits<{
  /** v-model sync — emitted on every toggle request regardless of controlled/uncontrolled mode */
  'update:leftCollapsed': [value: boolean]
  /** v-model sync — emitted on every toggle request regardless of controlled/uncontrolled mode */
  'update:rightCollapsed': [value: boolean]
  /** v-model sync — emitted when the active left panel changes */
  'update:leftActivePanelId': [value: string]
  /** v-model sync — emitted when the active right panel changes */
  'update:rightActivePanelId': [value: string]
  /** Side-effect event: true = collapsed, false = expanded. Fires after update:leftCollapsed. */
  'left-toggle': [value: boolean]
  /** Side-effect event: true = collapsed, false = expanded. Fires after update:rightCollapsed. */
  'right-toggle': [value: boolean]
  /** Fires when the active left panel changes; undefined when no matching panel is found */
  'left-panel-change': [panel: ChatWorkspacePanelDefinition | undefined]
  /** Fires when the active right panel changes; undefined when no matching panel is found */
  'right-panel-change': [panel: ChatWorkspacePanelDefinition | undefined]
}>()
const slots = useSlots()

const showToolbar = computed(() => Boolean(props.badge || props.title || props.description || slots['toolbar-actions']))
const showLeftRegion = computed(() => props.leftRegion?.enabled !== false && Boolean(slots.left || props.leftRailLabel))
const showRightRegion = computed(
  () => props.rightRegion?.enabled !== false && Boolean(slots.right || props.rightRailLabel),
)
const leftRegionStyle = computed(() => ({
  '--workspace-region-width': resolveWorkspaceRegionWidth(props.leftRegion?.width, 'left'),
}))
const rightRegionStyle = computed(() => ({
  '--workspace-region-width': resolveWorkspaceRegionWidth(props.rightRegion?.width, 'right'),
}))
const isLeftCollapsible = computed(() => props.leftRegion?.collapsible !== false)
const isRightCollapsible = computed(() => props.rightRegion?.collapsible !== false)
const isLeftHiddenMode = computed(() => (props.leftRegion?.collapseMode ?? 'hidden') === 'hidden')
const isRightHiddenMode = computed(() => (props.rightRegion?.collapseMode ?? 'hidden') === 'hidden')
const uncontrolledLeftCollapsed = ref(props.leftRegion?.defaultOpen === false)
const uncontrolledRightCollapsed = ref(props.rightRegion?.defaultOpen === false)
const uncontrolledLeftActivePanelId = ref(props.leftRegion?.activePanelId ?? props.leftRegion?.panels?.[0]?.id)
const uncontrolledRightActivePanelId = ref(props.rightRegion?.activePanelId ?? props.rightRegion?.panels?.[0]?.id)

watch(
  () => props.leftCollapsed,
  (nextValue) => {
    if (nextValue !== undefined) {
      uncontrolledLeftCollapsed.value = nextValue
    }
  },
)

watch(
  () => props.rightCollapsed,
  (nextValue) => {
    if (nextValue !== undefined) {
      uncontrolledRightCollapsed.value = nextValue
    }
  },
)

watch(
  () => props.leftRegion?.defaultOpen,
  (defaultOpen) => {
    if (props.leftCollapsed === undefined && isLeftCollapsible.value) {
      uncontrolledLeftCollapsed.value = defaultOpen === false
    }
  },
)

watch(
  () => props.leftRegion?.activePanelId,
  (activePanelId) => {
    if (activePanelId !== undefined) {
      uncontrolledLeftActivePanelId.value = activePanelId
    }
  },
)

watch(
  () => props.rightRegion?.activePanelId,
  (activePanelId) => {
    if (activePanelId !== undefined) {
      uncontrolledRightActivePanelId.value = activePanelId
    }
  },
)

watch(
  () => props.rightRegion?.defaultOpen,
  (defaultOpen) => {
    if (props.rightCollapsed === undefined && isRightCollapsible.value) {
      uncontrolledRightCollapsed.value = defaultOpen === false
    }
  },
)

watch(isLeftCollapsible, (collapsible) => {
  if (!collapsible) {
    uncontrolledLeftCollapsed.value = false
  }
})

watch(isRightCollapsible, (collapsible) => {
  if (!collapsible) {
    uncontrolledRightCollapsed.value = false
  }
})

watch(
  () => props.leftRegion?.panels,
  (panels) => {
    const currentId = props.leftRegion?.activePanelId ?? uncontrolledLeftActivePanelId.value
    uncontrolledLeftActivePanelId.value = coerceWorkspacePanelId({ items: panels, requestedId: currentId })
  },
  { deep: true },
)

watch(
  () => props.rightRegion?.panels,
  (panels) => {
    const currentId = props.rightRegion?.activePanelId ?? uncontrolledRightActivePanelId.value
    uncontrolledRightActivePanelId.value = coerceWorkspacePanelId({ items: panels, requestedId: currentId })
  },
  { deep: true },
)

const leftCollapsedState = computed(() => {
  return resolveWorkspaceCollapsedState({
    collapsible: isLeftCollapsible.value,
    controlledCollapsed: props.leftCollapsed,
    uncontrolledCollapsed: uncontrolledLeftCollapsed.value,
  })
})
const rightCollapsedState = computed(() => {
  return resolveWorkspaceCollapsedState({
    collapsible: isRightCollapsible.value,
    controlledCollapsed: props.rightCollapsed,
    uncontrolledCollapsed: uncontrolledRightCollapsed.value,
  })
})
const workspaceShellClass = computed(() => ({
  'is-full-width': props.viewState?.fullWidth,
}))
const leftPanels = computed(() => props.leftRegion?.panels ?? [])
const rightPanels = computed(() => props.rightRegion?.panels ?? [])
const leftPanelItems = computed(() => toWorkspacePanelHostItems(leftPanels.value))
const rightPanelItems = computed(() => toWorkspacePanelHostItems(rightPanels.value))
const leftActivePanelIdState = computed(() =>
  coerceWorkspacePanelId({
    items: leftPanels.value,
    requestedId: props.leftRegion?.activePanelId ?? uncontrolledLeftActivePanelId.value,
  }),
)
const rightActivePanelIdState = computed(() =>
  coerceWorkspacePanelId({
    items: rightPanels.value,
    requestedId: props.rightRegion?.activePanelId ?? uncontrolledRightActivePanelId.value,
  }),
)

function updateLeftCollapsed(nextValue: boolean) {
  const resolvedValue = isLeftCollapsible.value ? nextValue : false

  if (props.leftCollapsed === undefined) {
    uncontrolledLeftCollapsed.value = resolvedValue
  }

  emit('update:leftCollapsed', resolvedValue)
  emit('left-toggle', resolvedValue)
}

function updateRightCollapsed(nextValue: boolean) {
  const resolvedValue = isRightCollapsible.value ? nextValue : false

  if (props.rightCollapsed === undefined) {
    uncontrolledRightCollapsed.value = resolvedValue
  }

  emit('update:rightCollapsed', resolvedValue)
  emit('right-toggle', resolvedValue)
}

function toggleLeftRegion() {
  updateLeftCollapsed(!leftCollapsedState.value)
}

function toggleRightRegion() {
  updateRightCollapsed(!rightCollapsedState.value)
}

function updateLeftActivePanelId(nextValue: string) {
  if (props.leftRegion?.activePanelId === undefined) {
    uncontrolledLeftActivePanelId.value = nextValue
  }

  emit('update:leftActivePanelId', nextValue)
  emit('left-panel-change', findWorkspacePanelById(leftPanels.value, nextValue))
}

function updateRightActivePanelId(nextValue: string) {
  if (props.rightRegion?.activePanelId === undefined) {
    uncontrolledRightActivePanelId.value = nextValue
  }

  emit('update:rightActivePanelId', nextValue)
  emit('right-panel-change', findWorkspacePanelById(rightPanels.value, nextValue))
}
</script>

<template>
  <div
    class="tr-workspace-shell"
    :class="workspaceShellClass"
    :data-full-width="props.viewState?.fullWidth ? 'true' : 'false'"
  >
    <header v-if="showToolbar" class="tr-workspace-shell__toolbar">
      <div v-if="props.badge || props.title || props.description" class="tr-workspace-shell__brand">
        <span v-if="props.badge" class="tr-workspace-shell__badge">{{ props.badge }}</span>
        <div class="tr-workspace-shell__brand-copy">
          <strong v-if="props.title">{{ props.title }}</strong>
          <span v-if="props.description">{{ props.description }}</span>
        </div>
      </div>

      <div v-if="$slots['toolbar-actions']" class="tr-workspace-shell__actions">
        <!--
          slot: toolbar-actions
          scope:
            leftCollapsed  boolean  — current left region collapse state
            rightCollapsed boolean  — current right region collapse state
            toggleLeft     ()=>void — toggle left region collapse
            toggleRight    ()=>void — toggle right region collapse
        -->
        <slot
          name="toolbar-actions"
          :leftCollapsed="leftCollapsedState"
          :rightCollapsed="rightCollapsedState"
          :toggleLeft="toggleLeftRegion"
          :toggleRight="toggleRightRegion"
        />
      </div>
    </header>

    <div v-if="$slots.meta" class="tr-workspace-shell__meta">
      <!-- slot: meta — chip/tag row rendered below the toolbar, no scope -->
      <slot name="meta" />
    </div>

    <div class="tr-workspace-shell__body">
      <aside
        v-if="showLeftRegion"
        class="tr-workspace-shell__region tr-workspace-shell__region--left"
        :class="{
          'is-collapsed': leftCollapsedState,
          'is-collapse-hidden': leftCollapsedState && isLeftHiddenMode,
        }"
        :style="leftRegionStyle"
      >
        <div
          v-if="!(isLeftHiddenMode && leftCollapsedState)"
          class="tr-workspace-shell__rail"
          :class="{ 'is-visible': isLeftCollapsible && leftCollapsedState, 'is-interactive': isLeftCollapsible }"
          @click="isLeftCollapsible && leftCollapsedState && toggleLeftRegion()"
        >
          <span class="tr-workspace-shell__rail-label">{{ props.leftRailLabel || 'Left' }}</span>
        </div>
        <div
          class="tr-workspace-shell__region-content"
          :class="{ 'is-hidden': isLeftCollapsible && leftCollapsedState }"
        >
          <!--
            slot: left
            scope:
              collapsed      boolean                        — whether the region is currently collapsed
              toggle         ()=>void                       — toggle collapse state
              region         ChatWorkspaceRegionConfig      — the leftRegion prop value
              panels         ChatWorkspacePanelDefinition[] — resolved panel definitions
              panelItems     ChatWorkspacePanelHostItem[]   — tab-bar items derived from panels
              activePanelId  string                         — currently active panel id (coerced to first panel if unset)
              setActivePanel (id: string)=>void             — activate a panel by id; emits update:leftActivePanelId + left-panel-change
          -->
          <slot
            name="left"
            :collapsed="leftCollapsedState"
            :toggle="toggleLeftRegion"
            :region="props.leftRegion"
            :panels="leftPanels"
            :panelItems="leftPanelItems"
            :activePanelId="leftActivePanelIdState"
            :setActivePanel="updateLeftActivePanelId"
          />
        </div>
      </aside>

      <section class="tr-workspace-shell__center">
        <!-- slot: default — center content area, typically a TrChat instance -->
        <slot />
      </section>

      <aside
        v-if="showRightRegion"
        class="tr-workspace-shell__region tr-workspace-shell__region--right"
        :class="{
          'is-collapsed': rightCollapsedState,
          'is-collapse-hidden': rightCollapsedState && isRightHiddenMode,
        }"
        :style="rightRegionStyle"
      >
        <div
          v-if="!(isRightHiddenMode && rightCollapsedState)"
          class="tr-workspace-shell__rail"
          :class="{ 'is-visible': isRightCollapsible && rightCollapsedState, 'is-interactive': isRightCollapsible }"
          @click="isRightCollapsible && rightCollapsedState && toggleRightRegion()"
        >
          <span class="tr-workspace-shell__rail-label">{{ props.rightRailLabel || 'Right' }}</span>
        </div>
        <div
          class="tr-workspace-shell__region-content"
          :class="{ 'is-hidden': isRightCollapsible && rightCollapsedState }"
        >
          <!--
            slot: right
            scope:
              collapsed      boolean                        — whether the region is currently collapsed
              toggle         ()=>void                       — toggle collapse state
              region         ChatWorkspaceRegionConfig      — the rightRegion prop value
              panels         ChatWorkspacePanelDefinition[] — resolved panel definitions
              panelItems     ChatWorkspacePanelHostItem[]   — tab-bar items derived from panels
              activePanelId  string                         — currently active panel id (coerced to first panel if unset)
              setActivePanel (id: string)=>void             — activate a panel by id; emits update:rightActivePanelId + right-panel-change
          -->
          <slot
            name="right"
            :collapsed="rightCollapsedState"
            :toggle="toggleRightRegion"
            :region="props.rightRegion"
            :panels="rightPanels"
            :panelItems="rightPanelItems"
            :activePanelId="rightActivePanelIdState"
            :setActivePanel="updateRightActivePanelId"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.tr-workspace-shell {
  --workspace-chat-header-inline-padding: 28px;
  --workspace-chat-inline-padding: clamp(28px, 4vw, 44px);
  --workspace-chat-prompts-max-width: 760px;
  --workspace-chat-bubbles-max-width: 900px;
  --workspace-chat-welcome-max-width: 920px;
  --workspace-chat-footer-max-width: 920px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.985) 0%, rgba(248, 250, 252, 0.97) 100%);
  box-shadow:
    0 24px 80px rgba(15, 23, 42, 0.06),
    0 4px 14px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(10px);
}

.tr-workspace-shell[data-full-width='true'] {
  --workspace-chat-inline-padding: 20px;
  --workspace-chat-prompts-max-width: 100%;
  --workspace-chat-bubbles-max-width: 100%;
  --workspace-chat-welcome-max-width: 100%;
  --workspace-chat-footer-max-width: 100%;
}

.tr-workspace-shell__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(248, 250, 252, 0.52) 100%);
}

.tr-workspace-shell__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.tr-workspace-shell__badge {
  width: 40px;
  height: 40px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(224, 236, 255, 0.95) 0%, rgba(243, 247, 255, 0.92) 100%);
  color: #2859d6;
  font-size: 13px;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    0 2px 8px rgba(59, 130, 246, 0.08);
}

.tr-workspace-shell__brand-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tr-workspace-shell__brand-copy strong {
  font-size: 15px;
  font-weight: 700;
  color: #243043;
  line-height: 1.2;
}

.tr-workspace-shell__brand-copy span {
  font-size: 12px;
  color: #7b8494;
  line-height: 1.4;
}

.tr-workspace-shell__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.tr-workspace-shell__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(248, 250, 252, 0.52);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.tr-workspace-shell__body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.44);
}

.tr-workspace-shell__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.96) 100%);
}

.tr-workspace-shell :deep(.tr-chat) {
  flex: 1;
  height: 100%;
}

.tr-workspace-shell :deep(.tr-chat__layout) {
  background: transparent;
}

.tr-workspace-shell :deep(.tr-chat__header) {
  padding-left: 0;
  padding-right: 0;
}

.tr-workspace-shell :deep(.tr-chat__header-inner) {
  padding-left: var(--workspace-chat-header-inline-padding);
  padding-right: var(--workspace-chat-header-inline-padding);
}

.tr-workspace-shell :deep(.tr-chat__body) {
  padding-left: var(--workspace-chat-inline-padding);
  padding-right: var(--workspace-chat-inline-padding);
  transition: padding 0.24s ease;
}

.tr-workspace-shell :deep(.tr-chat__footer) {
  padding-left: var(--workspace-chat-inline-padding);
  padding-right: var(--workspace-chat-inline-padding);
  padding-bottom: 22px;
  background: linear-gradient(180deg, rgba(249, 250, 251, 0) 0%, rgba(249, 250, 251, 0.9) 36%);
  transition: padding 0.24s ease;
}

.tr-workspace-shell :deep(.tr-chat__footer-inner) {
  width: 100%;
  max-width: var(--workspace-chat-footer-max-width);
  margin-left: auto;
  margin-right: auto;
  transition: max-width 0.28s ease;
}

.tr-workspace-shell :deep(.tr-sender) {
  border-radius: 26px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
}

.tr-workspace-shell :deep(.tr-prompts) {
  width: 100%;
  max-width: var(--workspace-chat-prompts-max-width);
  margin-left: auto;
  margin-right: auto;
  transition: max-width 0.28s ease;
}

.tr-workspace-shell :deep(.tr-bubble-list) {
  width: 100%;
  max-width: var(--workspace-chat-bubbles-max-width);
  margin-left: auto;
  margin-right: auto;
  transition: max-width 0.28s ease;
}

.tr-workspace-shell :deep(.tr-chat__welcome-area) {
  width: 100%;
  max-width: var(--workspace-chat-welcome-max-width);
  margin-left: auto;
  margin-right: auto;
  transition: max-width 0.28s ease;
}

.tr-workspace-shell :deep(.tr-chat__welcome) {
  width: 100%;
}

.tr-workspace-shell :deep(.tr-chat__welcome-prompts) {
  width: 100%;
}

.tr-workspace-shell__region {
  position: relative;
  flex-shrink: 0;
  width: var(--workspace-region-width);
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid rgba(148, 163, 184, 0.08);
  border-right: 1px solid rgba(148, 163, 184, 0.08);
  background: linear-gradient(180deg, rgba(247, 249, 252, 0.84) 0%, rgba(255, 255, 255, 0.82) 100%);
  transition:
    width 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.2s ease,
    background 0.2s ease;
  will-change: width;
}

.tr-workspace-shell__region--left {
  border-left: 0;
}

.tr-workspace-shell__region--right {
  border-right: 0;
}

.tr-workspace-shell__region.is-collapsed {
  width: 44px;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.94) 0%, rgba(250, 251, 253, 0.9) 100%);
}

.tr-workspace-shell__region.is-collapsed.is-collapse-hidden {
  width: 0;
  border: 0;
  overflow: hidden;
}

.tr-workspace-shell__rail {
  position: absolute;
  inset: 0;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    transform 0.24s ease;
  transform: translateX(4px);
}

.tr-workspace-shell__rail.is-interactive {
  cursor: pointer;
}

.tr-workspace-shell__rail.is-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.tr-workspace-shell__region-content {
  height: 100%;
  transition:
    opacity 0.18s ease,
    transform 0.24s ease;
}

.tr-workspace-shell__region-content.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-8px);
}

.tr-workspace-shell__rail-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8a94a6;
}

@media (max-width: 960px) {
  .tr-workspace-shell {
    --workspace-chat-header-inline-padding: 18px;
    --workspace-chat-inline-padding: 18px;
    border-radius: 24px;
  }

  .tr-workspace-shell__toolbar {
    padding: 14px 16px 10px;
  }

  .tr-workspace-shell__meta {
    padding: 10px 16px;
  }
}

@media (max-width: 640px) {
  .tr-workspace-shell__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .tr-workspace-shell__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .tr-workspace-shell__body {
    flex-direction: column;
  }

  .tr-workspace-shell__region--left,
  .tr-workspace-shell__region--right {
    width: auto;
    min-height: 84px;
    border-left: 0;
    border-right: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
  }

  .tr-workspace-shell__region.is-collapsed {
    width: auto;
    min-height: 36px;
  }

  .tr-workspace-shell__rail {
    transform: translateY(4px);
  }

  .tr-workspace-shell__rail.is-visible {
    transform: translateY(0);
  }

  .tr-workspace-shell__rail-label {
    writing-mode: horizontal-tb;
    transform: none;
    letter-spacing: 0.08em;
  }
}
</style>
