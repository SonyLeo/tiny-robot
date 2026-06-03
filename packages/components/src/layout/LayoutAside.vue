<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  useAttrs,
  type StyleValue,
} from 'vue'
import { useControllableState } from './composables/useControllableState'
import { useLayoutAside } from './composables/useLayoutAside'
import { useLayout } from './composables/useLayout'
import type { LayoutAsideEmits, LayoutAsideProps } from './index.type'

defineOptions({
  name: 'LayoutAside',
  inheritAttrs: false,
})

const props = defineProps<LayoutAsideProps>()
const emit = defineEmits<LayoutAsideEmits>()
const attrs = useAttrs()
const layoutStore = useLayout()
const instance = getCurrentInstance()
const contentRef = ref<HTMLElement | null>(null)
const resolvedDrawerWidth = shallowRef<string | undefined>(undefined)

const defaultOpenByPlacement = {
  left: true,
  right: false,
} as const

function hasVNodeProp(name: string): boolean {
  const rawProps = instance?.vnode.props

  if (!rawProps) {
    return false
  }

  const kebabName = name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)

  return (
    Object.prototype.hasOwnProperty.call(rawProps, name) || Object.prototype.hasOwnProperty.call(rawProps, kebabName)
  )
}

const openProvided = hasVNodeProp('open')
const defaultOpenProvided = hasVNodeProp('defaultOpen')

const openState = useControllableState<boolean>({
  value: () => (openProvided ? props.open : undefined),
  defaultValue: () => (defaultOpenProvided ? props.defaultOpen : defaultOpenByPlacement[props.placement]),
  isControlled: openProvided,
  onChange: (nextOpen) => emit('update:open', nextOpen),
})

const widthState = useControllableState<number>({
  value: () => props.width,
  defaultValue: () => props.defaultWidth,
  onChange: (nextWidth) => emit('update:width', nextWidth),
})

function syncDrawerWidthVar(): void {
  if (typeof window === 'undefined' || !contentRef.value) {
    return
  }

  const nextValue = getComputedStyle(contentRef.value).getPropertyValue('--tr-layout-drawer-width').trim()
  resolvedDrawerWidth.value = nextValue || undefined
}

const layoutMode = computed(() => props.mode ?? 'dock')
const railWidth = computed(() => props.railWidth)
const minWidth = computed(() => props.minWidth ?? (props.placement === 'left' ? 200 : 240))
const maxWidth = computed(() => props.maxWidth ?? (props.placement === 'left' ? 560 : 640))
const resizable = computed(() => props.resizable ?? false)
const containerStyle = computed<StyleValue | undefined>(() => {
  if (!resolvedDrawerWidth.value) {
    return attrs.style as StyleValue | undefined
  }

  return [attrs.style as StyleValue | undefined, { '--tr-layout-drawer-width': resolvedDrawerWidth.value }]
})

layoutStore.registerPanel({
  placement: props.placement,
  layoutMode,
  isOpen: computed(() => openState.resolvedState.value ?? defaultOpenByPlacement[props.placement]),
  width: computed(() => widthState.resolvedState.value),
  containerClass: computed(() => attrs.class),
  containerStyle,
  railWidth,
  minWidth,
  maxWidth,
  resizable,
  commitOpen: openState.commit,
  commitWidth: widthState.commit,
})

onBeforeUnmount(() => {
  layoutStore.unregisterPanel(props.placement)
})

onMounted(() => {
  syncDrawerWidthVar()
})

onUpdated(() => {
  syncDrawerWidthVar()
})

const { isOpen, isExpanded, isDock, isDrawer, isRail, isHidden } = useLayoutAside(() => props.placement)

const slotProps = computed(() => ({
  isOpen: isOpen.value,
  isExpanded: isExpanded.value,
}))

const collapseEffect = computed(() => props.collapseEffect ?? 'overlay')
</script>

<template>
  <aside
    v-bind="attrs"
    ref="contentRef"
    class="tr-layout-aside"
    data-part="aside-content"
    :data-placement="props.placement"
    :class="{
      'tr-layout-aside--left': props.placement === 'left',
      'tr-layout-aside--right': props.placement === 'right',
      'tr-layout-aside--dock': isDock,
      'tr-layout-aside--drawer': isDrawer,
      'tr-layout-aside--expanded': isExpanded,
      'tr-layout-aside--rail': isRail,
      'tr-layout-aside--hidden': isHidden,
      'tr-layout-aside--effect-overlay': collapseEffect === 'overlay',
      'tr-layout-aside--effect-slide': collapseEffect === 'slide',
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>

<style lang="less" scoped>
.tr-layout-aside {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;

  &--dock {
    width: 100%;
    transition:
      transform var(--transition-duration) var(--transition-easing),
      opacity var(--transition-duration) var(--transition-easing);
    will-change: transform, opacity;

    &.tr-layout-aside--hidden {
      opacity: 0;
      pointer-events: none;
    }

    &.tr-layout-aside--left {
      width: var(--left-dock-width);

      &.tr-layout-aside--rail {
        width: var(--left-rail-width);

        &.tr-layout-aside--effect-overlay {
          width: var(--left-dock-width);
        }

        &.tr-layout-aside--effect-slide {
          width: var(--left-dock-width);
          transform: translateX(calc(var(--left-rail-width) - var(--left-dock-width)));
        }
      }

      &.tr-layout-aside--hidden {
        transform: translateX(calc(-100% - var(--hidden-offset)));
      }
    }

    &.tr-layout-aside--right {
      width: var(--right-dock-width);
      margin-inline-start: auto;

      &.tr-layout-aside--rail {
        width: var(--right-rail-width);

        &.tr-layout-aside--effect-overlay {
          width: var(--right-dock-width);
        }

        &.tr-layout-aside--effect-slide {
          width: var(--right-dock-width);
          transform: translateX(calc(var(--right-dock-width) - var(--right-rail-width)));
        }
      }

      &.tr-layout-aside--hidden {
        transform: translateX(calc(100% + var(--hidden-offset)));
      }
    }
  }
}
</style>
