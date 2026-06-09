import { toValue } from 'vue'
import type { LayoutPlacement } from '../index.type'
import type { LayoutContext, LayoutPanelApi, LayoutPanelState } from '../internal.type'
import { getDefaultAsideMaxWidth, getDefaultAsideMinWidth } from '../utils/layoutAsideDefaults'

function createDefaultPanelState(placement: LayoutPlacement): LayoutPanelState {
  const minWidth = getDefaultAsideMinWidth(placement)
  const maxWidth = getDefaultAsideMaxWidth(placement)

  return {
    placement,
    layoutMode: 'dock',
    isOpen: false,
    isDock: true,
    isDrawer: false,
    isRail: false,
    isHidden: true,
    canResize: false,
    width: undefined,
    collapsedWidth: undefined,
    minWidth,
    maxWidth,
    resizable: false,
    setOpen: () => {},
    setWidth: () => {},
  }
}

const DEFAULT_PANEL_STATE = {
  left: createDefaultPanelState('left'),
  right: createDefaultPanelState('right'),
} as const

export function createLayoutContext(leftState?: LayoutPanelState, rightState?: LayoutPanelState): LayoutContext {
  const panels = {} as Record<LayoutPlacement, LayoutPanelApi>

  function getSiblingPanel(placement: LayoutPlacement): LayoutPanelApi {
    return panels[placement === 'left' ? 'right' : 'left']
  }

  function isVisibleDrawer(panel: LayoutPanelApi): boolean {
    return panel.isDrawer && panel.isOpen
  }

  function createPanelApi(placement: LayoutPlacement, panelState: LayoutPanelState | undefined): LayoutPanelApi {
    const source = panelState ?? DEFAULT_PANEL_STATE[placement]
    const isRegistered = panelState !== undefined
    const defaultMinWidth = getDefaultAsideMinWidth(placement)
    const defaultMaxWidth = getDefaultAsideMaxWidth(placement)

    function open(): void {
      if (!isRegistered) {
        return
      }

      if (toValue(source.isDrawer)) {
        const sibling = getSiblingPanel(placement)
        if (sibling.isDrawer && sibling.isOpen) {
          sibling.close()
        }
      }

      source.setOpen(true)
    }

    function close(): void {
      if (!isRegistered) {
        return
      }

      source.setOpen(false)
    }

    function setOpen(nextOpen: boolean): void {
      if (nextOpen) {
        open()
        return
      }

      close()
    }

    function toggle(): void {
      if (toValue(source.isOpen)) {
        close()
        return
      }

      open()
    }

    function setWidth(nextWidth: number): void {
      if (!isRegistered) {
        return
      }

      source.setWidth(nextWidth)
    }

    return {
      get placement() {
        return placement
      },
      get isRegistered() {
        return isRegistered
      },
      get layoutMode() {
        return toValue(source.layoutMode)
      },
      get isOpen() {
        return toValue(source.isOpen)
      },
      get isDock() {
        return toValue(source.isDock)
      },
      get isDrawer() {
        return toValue(source.isDrawer)
      },
      get isRail() {
        return toValue(source.isRail)
      },
      get isHidden() {
        return toValue(source.isHidden)
      },
      get canResize() {
        return toValue(source.canResize)
      },
      get width() {
        return toValue(source.width)
      },
      get collapsedWidth() {
        return toValue(source.collapsedWidth)
      },
      get minWidth() {
        return toValue(source.minWidth) ?? defaultMinWidth
      },
      get maxWidth() {
        return toValue(source.maxWidth) ?? defaultMaxWidth
      },
      get resizable() {
        return toValue(source.resizable)
      },
      open,
      close,
      toggle,
      setOpen,
      setWidth,
    }
  }

  panels.left = createPanelApi('left', leftState)
  panels.right = createPanelApi('right', rightState)

  function closeDrawers(): void {
    if (isVisibleDrawer(panels.left)) {
      panels.left.close()
    }

    if (isVisibleDrawer(panels.right)) {
      panels.right.close()
    }
  }

  return {
    left: panels.left,
    right: panels.right,
    get isDrawerVisible() {
      return isVisibleDrawer(panels.left) || isVisibleDrawer(panels.right)
    },
    closeDrawers,
  }
}
