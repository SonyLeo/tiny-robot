import { computed, ref, watch, type ComputedRef } from 'vue'
import type { ChatWorkspacePanelDefinition, ChatWorkspaceRegionConfig } from '@/types'
import {
  coerceWorkspacePanelId,
  findWorkspacePanelById,
  resolveWorkspaceCollapsedState,
  resolveWorkspaceRegionWidth,
  toWorkspacePanelHostItems,
} from './runtime'

interface UseWorkspaceRegionOptions {
  side: 'left' | 'right'
  region: ComputedRef<ChatWorkspaceRegionConfig | undefined>
  controlledCollapsed: ComputedRef<boolean | undefined>
  onUpdateCollapsed: (value: boolean) => void
  onToggle: (value: boolean) => void
  onUpdateActivePanelId: (value: string) => void
  onPanelChange: (panel: ChatWorkspacePanelDefinition | undefined) => void
}

export function useWorkspaceRegion(options: UseWorkspaceRegionOptions) {
  const uncontrolledCollapsed = ref(options.region.value?.defaultOpen === false)
  const uncontrolledActivePanelId = ref(options.region.value?.activePanelId ?? options.region.value?.panels?.[0]?.id)

  const regionStyle = computed(() => ({
    '--workspace-region-width': resolveWorkspaceRegionWidth(options.region.value?.width, options.side),
  }))
  const isCollapsible = computed(() => options.region.value?.collapsible !== false)
  const isHiddenMode = computed(() => (options.region.value?.collapseMode ?? 'hidden') === 'hidden')
  const panels = computed(() => options.region.value?.panels ?? [])
  const panelItems = computed(() => toWorkspacePanelHostItems(panels.value))

  watch(options.controlledCollapsed, (nextValue) => {
    if (nextValue !== undefined) {
      uncontrolledCollapsed.value = nextValue
    }
  })

  watch(
    () => options.region.value?.defaultOpen,
    (defaultOpen) => {
      if (options.controlledCollapsed.value === undefined && isCollapsible.value) {
        uncontrolledCollapsed.value = defaultOpen === false
      }
    },
  )

  watch(
    () => options.region.value?.activePanelId,
    (activePanelId) => {
      if (activePanelId !== undefined) {
        uncontrolledActivePanelId.value = activePanelId
      }
    },
  )

  watch(isCollapsible, (collapsible) => {
    if (!collapsible) {
      uncontrolledCollapsed.value = false
    }
  })

  watch(
    () => options.region.value?.panels,
    (nextPanels) => {
      const currentId = options.region.value?.activePanelId ?? uncontrolledActivePanelId.value
      uncontrolledActivePanelId.value = coerceWorkspacePanelId({
        items: nextPanels,
        requestedId: currentId,
      })
    },
    { deep: true },
  )

  const collapsedState = computed(() =>
    resolveWorkspaceCollapsedState({
      collapsible: isCollapsible.value,
      controlledCollapsed: options.controlledCollapsed.value,
      uncontrolledCollapsed: uncontrolledCollapsed.value,
    }),
  )

  const activePanelIdState = computed(() =>
    coerceWorkspacePanelId({
      items: panels.value,
      requestedId: options.region.value?.activePanelId ?? uncontrolledActivePanelId.value,
    }),
  )

  function updateCollapsed(nextValue: boolean) {
    const resolvedValue = isCollapsible.value ? nextValue : false

    if (options.controlledCollapsed.value === undefined) {
      uncontrolledCollapsed.value = resolvedValue
    }

    options.onUpdateCollapsed(resolvedValue)
    options.onToggle(resolvedValue)
  }

  function toggleRegion() {
    updateCollapsed(!collapsedState.value)
  }

  function updateActivePanelId(nextValue: string) {
    if (options.region.value?.activePanelId === undefined) {
      uncontrolledActivePanelId.value = nextValue
    }

    options.onUpdateActivePanelId(nextValue)
    options.onPanelChange(findWorkspacePanelById(panels.value, nextValue))
  }

  return {
    regionStyle,
    isCollapsible,
    isHiddenMode,
    panels,
    panelItems,
    collapsedState,
    activePanelIdState,
    updateCollapsed,
    updateActivePanelId,
    toggleRegion,
  }
}
