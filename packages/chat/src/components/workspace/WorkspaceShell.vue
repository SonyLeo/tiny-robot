<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import { computed, getCurrentInstance, useSlots } from 'vue'
import type { TrChatWorkspaceShellProps } from '@/types/workspace'
import { useWorkspaceRegion } from './useWorkspaceRegion'

defineOptions({ name: 'TrChatWorkspaceShell' })

const props = withDefaults(
  defineProps<
    TrChatWorkspaceShellProps & {
      mobile?: boolean
    }
  >(),
  {
    leftCollapsed: undefined,
    rightCollapsed: undefined,
    mobile: false,
  },
)

const emit = defineEmits<{
  'update:leftCollapsed': [value: boolean]
  'update:rightCollapsed': [value: boolean]
}>()

const slots = useSlots()
const themeScopeId = `tr-workspace-theme-scope-${getCurrentInstance()?.uid ?? 'fallback'}`
const scopedThemeTargetElement = `#${themeScopeId}`

const scopedColorMode = computed(() => {
  const mode = props.appearance?.mode

  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (mode === 'system') {
    return 'auto'
  }

  return undefined
})

const useScopedThemeProvider = computed(() => Boolean(scopedColorMode.value))
const leftRegion = computed(() => props.leftRegion)
const rightRegion = computed(() => props.rightRegion)

const left = useWorkspaceRegion({
  side: 'left',
  region: leftRegion,
  controlledCollapsed: computed(() => props.leftCollapsed),
  onUpdateCollapsed: (value) => emit('update:leftCollapsed', value),
})

const right = useWorkspaceRegion({
  side: 'right',
  region: rightRegion,
  controlledCollapsed: computed(() => props.rightCollapsed),
  onUpdateCollapsed: (value) => emit('update:rightCollapsed', value),
})

const showLeftRegion = computed(() => !props.mobile && props.leftRegion?.enabled !== false && Boolean(slots.left))
const showRightRegion = computed(() => !props.mobile && props.rightRegion?.enabled !== false && Boolean(slots.right))
const showLeftRail = computed(
  () =>
    showLeftRegion.value && left.isCollapsible.value && left.collapsedState.value && left.collapseMode.value === 'rail',
)
const showRightRail = computed(
  () =>
    showRightRegion.value &&
    right.isCollapsible.value &&
    right.collapsedState.value &&
    right.collapseMode.value === 'rail',
)
const hideLeftRegion = computed(() => left.collapsedState.value && left.collapseMode.value === 'hidden')
const hideRightRegion = computed(() => right.collapsedState.value && right.collapseMode.value === 'hidden')
</script>

<template>
  <ThemeProvider v-if="useScopedThemeProvider" :target-element="scopedThemeTargetElement" :color-mode="scopedColorMode">
    <div
      :id="themeScopeId"
      class="tr-workspace-shell"
      :data-tr-appearance-mode="props.appearance?.mode"
      :data-tr-color-mode="scopedColorMode"
    >
      <aside
        v-if="showLeftRegion"
        class="tr-workspace-shell__region tr-workspace-shell__region--left"
        :class="{
          'is-collapsed': left.collapsedState.value,
          'is-hidden': hideLeftRegion,
        }"
        :style="{ '--workspace-region-width': left.regionWidth.value }"
      >
        <button
          v-if="showLeftRail"
          type="button"
          class="tr-workspace-shell__rail"
          :aria-label="props.leftRailLabel || props.leftRegion?.railLabel || 'Expand left sidebar'"
          @click="left.updateCollapsed(false)"
        >
          <slot name="left-rail" :expand="() => left.updateCollapsed(false)" />
        </button>

        <div
          class="tr-workspace-shell__region-content"
          :class="{ 'is-hidden': left.collapsedState.value && showLeftRail }"
        >
          <slot
            name="left"
            :collapsed="left.collapsedState.value"
            :toggle="left.toggleRegion"
            :collapse="() => left.updateCollapsed(true)"
            :expand="() => left.updateCollapsed(false)"
          />
        </div>
      </aside>

      <section class="tr-workspace-shell__center">
        <div class="tr-workspace-shell__center-content">
          <slot />
        </div>
      </section>

      <aside
        v-if="showRightRegion"
        class="tr-workspace-shell__region tr-workspace-shell__region--right"
        :class="{
          'is-collapsed': right.collapsedState.value,
          'is-hidden': hideRightRegion,
        }"
        :style="{ '--workspace-region-width': right.regionWidth.value }"
      >
        <button
          v-if="showRightRail"
          type="button"
          class="tr-workspace-shell__rail"
          :aria-label="props.rightRailLabel || props.rightRegion?.railLabel || 'Expand right sidebar'"
          @click="right.updateCollapsed(false)"
        >
          <slot name="right-rail" :expand="() => right.updateCollapsed(false)" />
        </button>

        <div
          class="tr-workspace-shell__region-content"
          :class="{ 'is-hidden': right.collapsedState.value && showRightRail }"
        >
          <slot
            name="right"
            :collapsed="right.collapsedState.value"
            :toggle="right.toggleRegion"
            :collapse="() => right.updateCollapsed(true)"
            :expand="() => right.updateCollapsed(false)"
          />
        </div>
      </aside>
    </div>
  </ThemeProvider>

  <div v-else :id="themeScopeId" class="tr-workspace-shell" :data-tr-appearance-mode="props.appearance?.mode">
    <aside
      v-if="showLeftRegion"
      class="tr-workspace-shell__region tr-workspace-shell__region--left"
      :class="{
        'is-collapsed': left.collapsedState.value,
        'is-hidden': hideLeftRegion,
      }"
      :style="{ '--workspace-region-width': left.regionWidth.value }"
    >
      <button
        v-if="showLeftRail"
        type="button"
        class="tr-workspace-shell__rail"
        :aria-label="props.leftRailLabel || props.leftRegion?.railLabel || 'Expand left sidebar'"
        @click="left.updateCollapsed(false)"
      >
        <slot name="left-rail" :expand="() => left.updateCollapsed(false)" />
      </button>

      <div
        class="tr-workspace-shell__region-content"
        :class="{ 'is-hidden': left.collapsedState.value && showLeftRail }"
      >
        <slot
          name="left"
          :collapsed="left.collapsedState.value"
          :toggle="left.toggleRegion"
          :collapse="() => left.updateCollapsed(true)"
          :expand="() => left.updateCollapsed(false)"
        />
      </div>
    </aside>

    <section class="tr-workspace-shell__center">
      <div class="tr-workspace-shell__center-content">
        <slot />
      </div>
    </section>

    <aside
      v-if="showRightRegion"
      class="tr-workspace-shell__region tr-workspace-shell__region--right"
      :class="{
        'is-collapsed': right.collapsedState.value,
        'is-hidden': hideRightRegion,
      }"
      :style="{ '--workspace-region-width': right.regionWidth.value }"
    >
      <button
        v-if="showRightRail"
        type="button"
        class="tr-workspace-shell__rail"
        :aria-label="props.rightRailLabel || props.rightRegion?.railLabel || 'Expand right sidebar'"
        @click="right.updateCollapsed(false)"
      >
        <slot name="right-rail" :expand="() => right.updateCollapsed(false)" />
      </button>

      <div
        class="tr-workspace-shell__region-content"
        :class="{ 'is-hidden': right.collapsedState.value && showRightRail }"
      >
        <slot
          name="right"
          :collapsed="right.collapsedState.value"
          :toggle="right.toggleRegion"
          :collapse="() => right.updateCollapsed(true)"
          :expand="() => right.updateCollapsed(false)"
        />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.tr-workspace-shell {
  --workspace-shell-bg: var(--chat-surface-bg, var(--tr-page-bg-default, #fff));
  --workspace-shell-region-bg: var(--chat-panel-bg, var(--tr-container-bg-default, #fff));
  --workspace-shell-region-bg-muted: var(--chat-panel-bg-muted, var(--tr-container-bg-default-2, #f7f7f7));
  --workspace-shell-border-color: var(--chat-panel-border, var(--tr-border-color-disabled, rgba(15, 23, 42, 0.08)));
  --workspace-shell-text-primary: var(--chat-text-primary, var(--tr-text-primary, #111827));
  --workspace-shell-text-secondary: var(--chat-text-secondary, var(--tr-text-secondary, #6b7280));
  --workspace-shell-accent: var(--chat-accent-color, var(--tr-color-primary, #2f6bff));
  --workspace-shell-accent-soft: var(--chat-accent-bg, var(--tr-color-primary-light, rgba(47, 107, 255, 0.12)));
  --workspace-shell-hover-bg: var(--chat-surface-bg-hover, var(--tr-container-bg-hover, rgba(15, 23, 42, 0.06)));
  --workspace-shell-shadow: var(--chat-shadow-sm, var(--tr-shadow-sm, 0 10px 24px rgba(15, 23, 42, 0.08)));
  --workspace-shell-rail-width: 72px;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--workspace-shell-bg);
  color: var(--workspace-shell-text-primary);
}

.tr-workspace-shell__region {
  position: relative;
  flex-shrink: 0;
  width: var(--workspace-region-width);
  min-height: 0;
  overflow: hidden;
  border-right: 0;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--workspace-shell-region-bg) 92%, white 8%) 0%,
    var(--workspace-shell-region-bg-muted) 100%
  );
  transition:
    width 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.2s ease,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.2s ease;
}

.tr-workspace-shell__region--right {
  border-right: 0;
  border-left: 0;
  background: var(--workspace-shell-region-bg);
}

.tr-workspace-shell__region.is-collapsed {
  width: var(--workspace-shell-rail-width);
}

.tr-workspace-shell__region.is-hidden {
  width: 0;
  border-width: 0;
}

.tr-workspace-shell__rail {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  padding: 0;
}

.tr-workspace-shell__region-content {
  height: 100%;
  transition:
    opacity 0.18s ease,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.tr-workspace-shell__region--left > .tr-workspace-shell__region-content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--workspace-region-width);
  min-width: var(--workspace-region-width);
  transform-origin: left center;
}

.tr-workspace-shell__region--right > .tr-workspace-shell__region-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--workspace-region-width);
  min-width: var(--workspace-region-width);
  transform-origin: right center;
}

.tr-workspace-shell__region-content.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.tr-workspace-shell__region--left.is-hidden > .tr-workspace-shell__region-content,
.tr-workspace-shell__region--left > .tr-workspace-shell__region-content.is-hidden {
  opacity: 0;
  transform: translateX(-18px);
  pointer-events: none;
}

.tr-workspace-shell__region--right.is-hidden > .tr-workspace-shell__region-content,
.tr-workspace-shell__region--right > .tr-workspace-shell__region-content.is-hidden {
  opacity: 0;
  transform: translateX(18px);
  pointer-events: none;
}

.tr-workspace-shell__center {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  background: var(--workspace-shell-bg);
}

.tr-workspace-shell__center-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
}
</style>
