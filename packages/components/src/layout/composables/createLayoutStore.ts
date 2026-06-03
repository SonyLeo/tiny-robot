import { computed, shallowReactive, toValue } from 'vue'
import type { LayoutAsideMode, LayoutPlacement } from '../index.type'
import type { LayoutPanelApi, LayoutPanelRegistration, LayoutStore } from '../internal.type'

const DEFAULT_LEFT_MIN_WIDTH = 200
const DEFAULT_RIGHT_MIN_WIDTH = 240
const DEFAULT_LEFT_MAX_WIDTH = 560
const DEFAULT_RIGHT_MAX_WIDTH = 640

type RegistrationMap = Record<LayoutPlacement, LayoutPanelRegistration | undefined>

function toPx(value: number | undefined): string | undefined {
  return value === undefined ? undefined : `${value}px`
}

export function createLayoutStore(): LayoutStore {
  const registrations = shallowReactive<RegistrationMap>({
    left: undefined,
    right: undefined,
  })

  function createPanelApi(placement: LayoutPlacement): LayoutPanelApi {
    const registration = computed(() => registrations[placement])
    const otherPlacement = placement === 'left' ? 'right' : 'left'
    const otherRegistration = computed(() => registrations[otherPlacement])
    const defaultMinWidth = placement === 'left' ? DEFAULT_LEFT_MIN_WIDTH : DEFAULT_RIGHT_MIN_WIDTH
    const defaultMaxWidth = placement === 'left' ? DEFAULT_LEFT_MAX_WIDTH : DEFAULT_RIGHT_MAX_WIDTH

    const isRegistered = computed(() => registration.value !== undefined)
    const layoutMode = computed<LayoutAsideMode>(() => {
      return registration.value ? toValue(registration.value.layoutMode) : 'dock'
    })
    const isOpen = computed(() => (registration.value ? toValue(registration.value.isOpen) : false))
    const width = computed(() => (registration.value ? toValue(registration.value.width) : undefined))
    const containerClass = computed(() => (registration.value ? toValue(registration.value.containerClass) : undefined))
    const containerStyle = computed(() => (registration.value ? toValue(registration.value.containerStyle) : undefined))
    const railWidthValue = computed(() => (registration.value ? toValue(registration.value.railWidth) : undefined))
    const railWidth = computed(() => railWidthValue.value ?? 0)
    const minWidth = computed(() => (registration.value ? toValue(registration.value.minWidth) : defaultMinWidth))
    const maxWidth = computed(() => (registration.value ? toValue(registration.value.maxWidth) : defaultMaxWidth))
    const resizable = computed(() => (registration.value ? toValue(registration.value.resizable) : false))
    const isDock = computed(() => layoutMode.value === 'dock')
    const isDrawer = computed(() => layoutMode.value === 'drawer')
    const isRail = computed(() => isRegistered.value && isDock.value && !isOpen.value && railWidth.value > 0)
    const isHidden = computed(() => !isRegistered.value || (!isOpen.value && (isDrawer.value || !isRail.value)))
    const canResize = computed(() => isRegistered.value && isDock.value && isOpen.value && resizable.value)

    function open(): void {
      if (!registration.value) {
        return
      }

      if (isDrawer.value) {
        const sibling = otherRegistration.value
        if (sibling && toValue(sibling.layoutMode) === 'drawer' && toValue(sibling.isOpen)) {
          sibling.commitOpen(false)
        }
      }

      registration.value.commitOpen(true)
    }

    function close(): void {
      registration.value?.commitOpen(false)
    }

    function toggle(): void {
      if (isOpen.value) {
        close()
        return
      }

      open()
    }

    function setWidth(nextWidth: number): void {
      registration.value?.commitWidth(nextWidth)
    }

    return {
      get placement() {
        return placement
      },
      get isRegistered() {
        return isRegistered.value
      },
      get layoutMode() {
        return layoutMode.value
      },
      get isOpen() {
        return isOpen.value
      },
      get isExpanded() {
        return isOpen.value
      },
      get isDock() {
        return isDock.value
      },
      get isDrawer() {
        return isDrawer.value
      },
      get isRail() {
        return isRail.value
      },
      get isHidden() {
        return isHidden.value
      },
      get canResize() {
        return canResize.value
      },
      get width() {
        return width.value
      },
      get widthStyle() {
        return toPx(width.value)
      },
      get containerClass() {
        return containerClass.value
      },
      get containerStyle() {
        return containerStyle.value
      },
      get railWidth() {
        return railWidth.value
      },
      get railWidthStyle() {
        return toPx(railWidthValue.value)
      },
      get minWidth() {
        return minWidth.value
      },
      get maxWidth() {
        return maxWidth.value
      },
      get resizable() {
        return resizable.value
      },
      open,
      close,
      toggle,
      setWidth,
    }
  }

  const left = createPanelApi('left')
  const right = createPanelApi('right')

  function closeDrawers(): void {
    if (left.isDrawer && left.isOpen) {
      left.close()
    }

    if (right.isDrawer && right.isOpen) {
      right.close()
    }
  }

  return {
    left,
    right,
    get isDrawerVisible() {
      return (left.isDrawer && left.isOpen) || (right.isDrawer && right.isOpen)
    },
    closeDrawers,
    registerPanel(panel: LayoutPanelRegistration) {
      registrations[panel.placement] = panel
    },
    unregisterPanel(placement: LayoutPlacement) {
      registrations[placement] = undefined
    },
  }
}
