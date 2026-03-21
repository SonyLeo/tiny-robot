<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { TrChatWorkspaceShellProps, ChatWorkspacePanelDefinition } from '@/types'
import { useWorkspaceRegion } from './useWorkspaceRegion'

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
const colorModeAttr = computed(() => {
  return props.appearance?.mode === 'light' || props.appearance?.mode === 'dark' ? props.appearance.mode : undefined
})

const showToolbar = computed(() => Boolean(props.badge || props.title || props.description || slots['toolbar-actions']))
const showLeftRegion = computed(() => props.leftRegion?.enabled !== false && Boolean(slots.left || props.leftRailLabel))
const showRightRegion = computed(
  () => props.rightRegion?.enabled !== false && Boolean(slots.right || props.rightRailLabel),
)
const showNavigationLayer = computed(() => props.contentNavigation?.enabled !== false && Boolean(slots.navigation))
const workspaceShellClass = computed(() => ({
  'is-full-width': props.viewState?.fullWidth,
  'has-content-navigation': showNavigationLayer.value,
}))
const leftRailLabel = computed(() => props.leftRailLabel || 'Left')
const rightRailLabel = computed(() => props.rightRailLabel || 'Right')
const leftRailAriaLabel = computed(() => `Expand ${leftRailLabel.value} panel`)
const rightRailAriaLabel = computed(() => `Expand ${rightRailLabel.value} panel`)
const leftRegionConfig = computed(() => props.leftRegion)
const rightRegionConfig = computed(() => props.rightRegion)
const controlledLeftCollapsed = computed(() => props.leftCollapsed)
const controlledRightCollapsed = computed(() => props.rightCollapsed)

const leftRegionState = useWorkspaceRegion({
  side: 'left',
  region: leftRegionConfig,
  controlledCollapsed: controlledLeftCollapsed,
  onUpdateCollapsed: (value) => emit('update:leftCollapsed', value),
  onToggle: (value) => emit('left-toggle', value),
  onUpdateActivePanelId: (value) => emit('update:leftActivePanelId', value),
  onPanelChange: (panel) => emit('left-panel-change', panel),
})
const {
  regionStyle: leftRegionStyle,
  isCollapsible: isLeftCollapsible,
  isHiddenMode: isLeftHiddenMode,
  panels: leftPanels,
  panelItems: leftPanelItems,
  collapsedState: leftCollapsedState,
  activePanelIdState: leftActivePanelIdState,
  updateActivePanelId: updateLeftActivePanelId,
  toggleRegion: toggleLeftRegion,
} = leftRegionState

const rightRegionState = useWorkspaceRegion({
  side: 'right',
  region: rightRegionConfig,
  controlledCollapsed: controlledRightCollapsed,
  onUpdateCollapsed: (value) => emit('update:rightCollapsed', value),
  onToggle: (value) => emit('right-toggle', value),
  onUpdateActivePanelId: (value) => emit('update:rightActivePanelId', value),
  onPanelChange: (panel) => emit('right-panel-change', panel),
})
const {
  regionStyle: rightRegionStyle,
  isCollapsible: isRightCollapsible,
  isHiddenMode: isRightHiddenMode,
  panels: rightPanels,
  panelItems: rightPanelItems,
  collapsedState: rightCollapsedState,
  activePanelIdState: rightActivePanelIdState,
  updateActivePanelId: updateRightActivePanelId,
  toggleRegion: toggleRightRegion,
} = rightRegionState
</script>

<template>
  <div
    class="tr-workspace-shell"
    :class="workspaceShellClass"
    :data-tr-appearance-mode="props.appearance?.mode"
    :data-tr-color-mode="colorModeAttr"
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
        <button
          v-if="!(isLeftHiddenMode && leftCollapsedState)"
          type="button"
          class="tr-workspace-shell__rail"
          :class="{
            'is-visible': isLeftCollapsible && leftCollapsedState,
            'is-interactive': isLeftCollapsible,
          }"
          :aria-label="leftRailAriaLabel"
          :disabled="!isLeftCollapsible || !leftCollapsedState"
          @click="isLeftCollapsible && leftCollapsedState && toggleLeftRegion()"
        >
          <span class="tr-workspace-shell__rail-label">{{ leftRailLabel }}</span>
        </button>
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
        <div v-if="showNavigationLayer" class="tr-workspace-shell__content-navigation is-right">
          <slot name="navigation" />
        </div>
        <!-- slot: default — center content area, typically a TrChat instance -->
        <div class="tr-workspace-shell__center-content">
          <slot />
        </div>
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
        <button
          v-if="!(isRightHiddenMode && rightCollapsedState)"
          type="button"
          class="tr-workspace-shell__rail"
          :class="{
            'is-visible': isRightCollapsible && rightCollapsedState,
            'is-interactive': isRightCollapsible,
          }"
          :aria-label="rightRailAriaLabel"
          :disabled="!isRightCollapsible || !rightCollapsedState"
          @click="isRightCollapsible && rightCollapsedState && toggleRightRegion()"
        >
          <span class="tr-workspace-shell__rail-label">{{ rightRailLabel }}</span>
        </button>
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
  --workspace-chat-prompts-base-max-width: 760px;
  --workspace-chat-bubbles-base-max-width: 900px;
  --workspace-chat-welcome-base-max-width: 920px;
  --workspace-chat-footer-base-max-width: 920px;
  --workspace-chat-prompts-max-width: var(--workspace-chat-prompts-base-max-width);
  --workspace-chat-bubbles-max-width: var(--workspace-chat-bubbles-base-max-width);
  --workspace-chat-welcome-max-width: var(--workspace-chat-welcome-base-max-width);
  --workspace-chat-footer-max-width: var(--workspace-chat-footer-base-max-width);
  --workspace-navigation-expanded-width: 258px;
  --workspace-navigation-inline-offset: 14px;
  --workspace-navigation-reading-reserved-space: 28px;
  --workspace-navigation-full-width-reserved-space: 40px;
  --workspace-navigation-reserved-space: 0px;
  --chat-shell-radius: 30px;
  --chat-shell-toolbar-padding: 16px 24px 12px;
  --chat-shell-meta-padding: 12px 24px;
  --chat-header-padding: 0 var(--workspace-chat-header-inline-padding);
  --chat-body-padding: 0 var(--workspace-chat-inline-padding);
  --chat-footer-padding: 0 var(--workspace-chat-inline-padding) 22px;
  --chat-footer-bg: var(--chat-footer-overlay-bg);
  --chat-footer-inner-max-width: var(--workspace-chat-footer-max-width);
  --chat-welcome-area-max-width: var(--workspace-chat-welcome-max-width);
  --chat-welcome-prompts-max-width: var(--workspace-chat-prompts-max-width);
  --chat-bubble-list-max-width: var(--workspace-chat-bubbles-max-width);
  --chat-bubble-list-scrollbar-thumb: rgba(15, 23, 42, 0.18);
  --chat-bubble-list-scrollbar-thumb-hover: rgba(15, 23, 42, 0.24);
  --tr-sender-box-shadow: var(--chat-panel-shadow);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--chat-shell-radius);
  border: 1px solid var(--chat-shell-border-color);
  background: var(--chat-shell-bg);
  box-shadow: var(--chat-shell-shadow);
  backdrop-filter: blur(10px);
}

.tr-workspace-shell[data-full-width='true'] {
  --workspace-chat-inline-padding: 28px;
  --workspace-chat-prompts-max-width: 100%;
  --workspace-chat-bubbles-max-width: 100%;
  --workspace-chat-welcome-max-width: 100%;
  --workspace-chat-footer-max-width: 100%;
}

.tr-workspace-shell.has-content-navigation {
  --workspace-navigation-reserved-space: var(--workspace-navigation-reading-reserved-space);
}

.tr-workspace-shell.has-content-navigation[data-full-width='true'] {
  --workspace-navigation-reserved-space: var(--workspace-navigation-full-width-reserved-space);
  --workspace-chat-prompts-max-width: calc(100% - (var(--workspace-navigation-reserved-space) * 2));
  --workspace-chat-bubbles-max-width: calc(100% - (var(--workspace-navigation-reserved-space) * 2));
  --workspace-chat-welcome-max-width: calc(100% - (var(--workspace-navigation-reserved-space) * 2));
  --workspace-chat-footer-max-width: calc(100% - (var(--workspace-navigation-reserved-space) * 2));
}

.tr-workspace-shell__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: var(--chat-shell-toolbar-padding);
  border-bottom: 1px solid var(--chat-shell-toolbar-border-color);
  background: var(--chat-shell-toolbar-bg);
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
  background: var(--chat-shell-badge-bg);
  color: var(--chat-shell-badge-color);
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
  color: var(--chat-shell-title-color);
  line-height: 1.2;
}

.tr-workspace-shell__brand-copy span {
  font-size: 12px;
  color: var(--chat-shell-description-color);
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
  padding: var(--chat-shell-meta-padding);
  background: var(--chat-shell-meta-bg);
  border-bottom: 1px solid var(--chat-shell-meta-border-color);
}

.tr-workspace-shell__body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  background: var(--chat-shell-body-bg);
}

.tr-workspace-shell__center {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--chat-shell-center-bg);
}

.tr-workspace-shell__center-content {
  flex: 1;
  min-height: 0;
  display: flex;
  width: 100%;
}

.tr-workspace-shell__content-navigation {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  pointer-events: none;
  padding: 0 var(--workspace-navigation-inline-offset);
}

.tr-workspace-shell__content-navigation.is-right {
  right: 0;
}

.tr-workspace-shell__content-navigation.is-left {
  left: 0;
}

.tr-workspace-shell__region {
  position: relative;
  flex-shrink: 0;
  width: var(--workspace-region-width);
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid var(--chat-shell-region-border-color);
  border-right: 1px solid var(--chat-shell-region-border-color);
  background: var(--chat-shell-region-bg);
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
  background: var(--chat-shell-region-collapsed-bg);
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
  border: 0;
  background: transparent;
  padding: 0;
}

.tr-workspace-shell__rail.is-interactive {
  cursor: pointer;
}

.tr-workspace-shell__rail:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--chat-accent-color) 72%, transparent);
  outline-offset: -2px;
}

.tr-workspace-shell__rail:disabled {
  cursor: default;
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
  color: var(--chat-shell-rail-color);
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

  .tr-workspace-shell__content-navigation {
    display: none;
  }

  .tr-workspace-shell {
    --workspace-navigation-reserved-space: 0px;
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
