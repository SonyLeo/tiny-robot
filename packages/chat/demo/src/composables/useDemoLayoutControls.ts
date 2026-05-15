import { computed, shallowRef } from 'vue'

function createRangeModel(initialValue: number, min: number, max: number) {
  const source = shallowRef(initialValue)

  return computed({
    get: () => source.value,
    set: (nextValue: number | string) => {
      const normalized = typeof nextValue === 'number' ? nextValue : Number(nextValue)
      const safeValue = Number.isFinite(normalized) ? normalized : initialValue
      source.value = Math.min(max, Math.max(min, safeValue))
    },
  })
}

export function useDemoLayoutControls() {
  const leftSidebarWidth = createRangeModel(300, 220, 420)
  const leftRailWidth = createRangeModel(48, 0, 96)
  const rightPanelWidth = createRangeModel(320, 260, 420)

  return {
    leftSidebarWidth,
    leftRailWidth,
    rightPanelWidth,
  }
}
