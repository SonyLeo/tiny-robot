/**
 * 键盘导航 Composable
 * 用于处理列表/下拉框的键盘导航逻辑
 * 支持：上下箭头导航、Enter 选择、Escape 关闭
 *
 * 业界最佳实践参考：
 * - WAI-ARIA Combobox Pattern
 * - Keyboard Navigation Patterns for Complex Widgets
 * - VueUse 的 useMagicKeys、onKeyStroke 和 whenever
 */

import { ref, type Ref } from 'vue'
import { useMagicKeys, onKeyStroke, whenever } from '@vueuse/core'

export interface UseKeyboardNavigationOptions {
  /**
   * 是否启用导航
   */
  enabled?: Ref<boolean> | boolean
  /**
   * 列表项数量
   */
  itemCount: Ref<number> | number
  /**
   * 当前是否禁用
   * @param index 索引
   * @returns 是否禁用
   */
  isItemDisabled?: (index: number) => boolean
  /**
   * 当选择项时的回调
   */
  onSelect?: (index: number) => void
  /**
   * 当关闭时的回调
   */
  onClose?: () => void
  /**
   * 是否循环导航（到底部时回到顶部）
   */
  loop?: boolean
}

export interface UseKeyboardNavigationReturn {
  /**
   * 当前高亮的索引
   */
  highlightedIndex: Ref<number>
  /**
   * 重置高亮索引
   */
  reset: () => void
  /**
   * 设置高亮索引
   */
  setHighlightedIndex: (index: number) => void
}

/**
 * 键盘导航 Composable
 * @param options - 配置选项
 * @returns 导航状态和方法
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const { enabled = true, itemCount, isItemDisabled, onSelect, onClose, loop = false } = options

  const highlightedIndex = ref(0)
  const { ArrowUp, ArrowDown } = useMagicKeys()

  // 获取实际的启用状态
  const isEnabled = () => {
    if (typeof enabled === 'boolean') return enabled
    return enabled.value
  }

  // 获取实际的项数
  const getItemCount = () => {
    if (typeof itemCount === 'number') return itemCount
    return itemCount.value
  }

  // 重置高亮
  const reset = () => {
    highlightedIndex.value = 0
  }

  // 设置高亮索引
  const setHighlightedIndex = (index: number) => {
    const count = getItemCount()
    if (count <= 0) {
      highlightedIndex.value = 0
      return
    }
    highlightedIndex.value = Math.max(0, Math.min(index, count - 1))
  }

  /**
   * 切换高亮索引（支持正向/反向）
   * @param {boolean} isNext - true=下一项，false=上一项
   */
  const switchHighlightedIndex = (isNext: boolean) => {
    const count = getItemCount()
    if (count <= 0) return

    let target = highlightedIndex.value
    do {
      if (isNext) {
        // 正向（原逻辑）
        target = loop ? (target + 1) % count : Math.min(target + 1, count - 1)
      } else {
        // 反向（新逻辑）
        target = loop ? (target - 1 + count) % count : Math.max(target - 1, 0)
      }
    } while (isItemDisabled?.(target) && target !== highlightedIndex.value)
    highlightedIndex.value = target
  }

  // 上箭头导航
  whenever(
    () => ArrowUp.value && isEnabled(),
    () => {
      switchHighlightedIndex(false)
    },
  )

  // 下箭头导航
  whenever(
    () => ArrowDown.value && isEnabled(),
    () => {
      switchHighlightedIndex(true)
    },
  )

  // Enter 选择
  onKeyStroke('Enter', (event) => {
    if (!isEnabled()) return

    const count = getItemCount()
    if (count > 0 && highlightedIndex.value < count) {
      event.preventDefault()
      onSelect?.(highlightedIndex.value)
    }
  })

  // Escape 关闭
  onKeyStroke('Escape', (event) => {
    if (!isEnabled()) return

    event.preventDefault()
    onClose?.()
  })

  return {
    highlightedIndex,
    reset,
    setHighlightedIndex,
  }
}
