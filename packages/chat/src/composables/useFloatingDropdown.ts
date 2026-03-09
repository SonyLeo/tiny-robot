import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'

export function useFloatingDropdown(
  referenceEl: ReturnType<typeof ref<HTMLElement | null>>,
  floatingEl: ReturnType<typeof ref<HTMLElement | null>>,
) {
  const isOpen = ref(false)
  let cleanupAutoUpdate: (() => void) | null = null

  const updatePosition = async () => {
    if (!referenceEl.value || !floatingEl.value) return

    const { x, y } = await computePosition(referenceEl.value, floatingEl.value, {
      placement: 'bottom-end',
      strategy: 'absolute',
      middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    })

    // 使用 transform 而非 top/left，性能更好且支持亚像素定位
    const dpr = window.devicePixelRatio || 1
    const roundedX = Math.round(x * dpr) / dpr
    const roundedY = Math.round(y * dpr) / dpr

    Object.assign(floatingEl.value.style, {
      left: '0',
      top: '0',
      transform: `translate(${roundedX}px, ${roundedY}px)`,
    })
  }

  const startAutoUpdate = () => {
    if (!referenceEl.value || !floatingEl.value) return
    cleanupAutoUpdate = autoUpdate(referenceEl.value, floatingEl.value, updatePosition)
  }

  const stopAutoUpdate = () => {
    cleanupAutoUpdate?.()
    cleanupAutoUpdate = null
  }

  // 点击外部关闭：先判断是否在 referenceEl 内，避免与 toggleDropdown 竞争
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node
    if (referenceEl.value?.contains(target)) return
    if (floatingEl.value?.contains(target)) return
    isOpen.value = false
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') isOpen.value = false
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
    stopAutoUpdate()
  })

  watch(isOpen, async (newVal) => {
    if (newVal) {
      await nextTick()
      updatePosition()
      startAutoUpdate()
    } else {
      stopAutoUpdate()
    }
  })

  return { isOpen, updatePosition }
}
