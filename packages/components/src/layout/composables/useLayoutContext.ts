import { computed, inject, provide, shallowRef, type InjectionKey } from 'vue'
import type { LayoutContext, LayoutFloatingContext, LayoutPanelActions, LayoutPanelContext } from '../internal.type'
import type { LayoutPlacement } from '../index.type'
import { getDefaultAsideMaxWidth, getDefaultAsideMinWidth } from '../utils/asideDefaults'
import { DEFAULT_FLOATING_HEIGHT, DEFAULT_FLOATING_OFFSET, DEFAULT_FLOATING_WIDTH } from '../utils/surfaceGeometry'

const layoutContextKey: InjectionKey<LayoutContext> = Symbol('LayoutContext')

const noop = (): void => {}

function createDefaultPanelContext(placement: LayoutPlacement): LayoutPanelContext {
  const minWidth = getDefaultAsideMinWidth(placement)

  return {
    el: shallowRef<HTMLElement | null>(null),
    state: {
      placement,
      layoutMode: computed(() => 'dock'),
      isOpen: computed(() => false),
      width: computed(() => minWidth),
      collapsedWidth: computed(() => 0),
      collapseEffect: computed(() => 'overlay'),
      minWidth: computed(() => minWidth),
      maxWidth: computed(() => getDefaultAsideMaxWidth(placement)),
      resizable: computed(() => false),
      isDock: computed(() => true),
      isDrawer: computed(() => false),
      isRail: computed(() => false),
      isHidden: computed(() => true),
      canResize: computed(() => false),
    },
    actions: {
      open: noop,
      close: noop,
      toggle: noop,
      setOpen: noop,
      setWidth: noop,
    },
  }
}

function createDefaultFloatingContext(): LayoutFloatingContext {
  const defaultFloating = {
    placement: 'center',
    offsetX: DEFAULT_FLOATING_OFFSET,
    offsetY: DEFAULT_FLOATING_OFFSET,
    width: DEFAULT_FLOATING_WIDTH,
    height: DEFAULT_FLOATING_HEIGHT,
    draggable: true,
    resizable: false,
  } as const

  return {
    state: {
      mode: computed(() => 'normal'),
      value: computed(() => defaultFloating),
      resolved: computed(() => defaultFloating),
    },
    actions: {
      initialize: noop,
      commit: noop,
    },
  }
}

interface CreateLayoutContextOptions {
  rootEl: LayoutContext['rootEl']
  dragHandleEl: LayoutContext['dragHandleEl']
  left: LayoutPanelContext
  right: LayoutPanelContext
  floating: LayoutFloatingContext
}

function createPanelActions(panel: LayoutPanelContext, getSibling: () => LayoutPanelContext): LayoutPanelActions {
  function open(): void {
    if (panel.state.isDrawer.value) {
      const sibling = getSibling()
      if (sibling.state.isDrawer.value && sibling.state.isOpen.value) {
        sibling.actions.close()
      }
    }

    panel.actions.setOpen(true)
  }

  function close(): void {
    panel.actions.setOpen(false)
  }

  function toggle(): void {
    if (panel.state.isOpen.value) {
      close()
      return
    }

    open()
  }

  return {
    open,
    close,
    toggle,
    setOpen: (nextOpen) => {
      if (nextOpen) {
        open()
        return
      }

      close()
    },
    setWidth: panel.actions.setWidth,
  }
}

export function createLayoutContext(options: CreateLayoutContextOptions): LayoutContext {
  const left: LayoutPanelContext = {
    ...options.left,
    actions: createPanelActions(options.left, () => right),
  }

  const right: LayoutPanelContext = {
    ...options.right,
    actions: createPanelActions(options.right, () => left),
  }

  const isDrawerVisible = computed(
    () =>
      (left.state.isDrawer.value && left.state.isOpen.value) ||
      (right.state.isDrawer.value && right.state.isOpen.value),
  )

  function closeDrawers(): void {
    if (left.state.isDrawer.value && left.state.isOpen.value) {
      left.actions.close()
    }

    if (right.state.isDrawer.value && right.state.isOpen.value) {
      right.actions.close()
    }
  }

  return {
    rootEl: options.rootEl,
    dragHandleEl: options.dragHandleEl,
    left,
    right,
    floating: options.floating,
    ui: {
      isDrawerVisible,
    },
    actions: {
      closeDrawers,
    },
  }
}

function createFallbackLayoutContext(): LayoutContext {
  return createLayoutContext({
    rootEl: shallowRef<HTMLElement | null>(null),
    dragHandleEl: shallowRef<HTMLElement | null>(null),
    left: createDefaultPanelContext('left'),
    right: createDefaultPanelContext('right'),
    floating: createDefaultFloatingContext(),
  })
}

const fallbackLayoutContext = createFallbackLayoutContext()

export function provideLayoutContext(context: LayoutContext): void {
  provide(layoutContextKey, context)
}

export function useLayoutContext(): LayoutContext {
  return inject(layoutContextKey, fallbackLayoutContext)
}
