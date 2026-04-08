import type { ObjectDirective } from 'vue'

export interface ContentNavAnchorOptions {
  id?: string | null
  closest?: string | false
}

export type ContentNavAnchorValue = string | ContentNavAnchorOptions

type ContentNavAnchorState = {
  target: HTMLElement
  hadAttribute: boolean
  previousValue: string | null
}

const CONTENT_NAV_ID_ATTR = 'data-content-nav-id'
const CONTENT_NAV_ANCHOR_STATE = Symbol('content-nav-anchor-state')

function normalizeBinding(value: ContentNavAnchorValue | undefined) {
  if (typeof value === 'string') {
    return {
      id: value,
      closest: '.tr-bubble' as string | false,
    }
  }

  return {
    id: value?.id ?? '',
    closest: value?.closest ?? '.tr-bubble',
  }
}

function resolveTarget(el: HTMLElement, closest: string | false) {
  if (closest === false) {
    return el
  }

  return el.closest<HTMLElement>(closest) ?? el
}

function cleanup(el: HTMLElement) {
  const state = (el as HTMLElement & { [CONTENT_NAV_ANCHOR_STATE]?: ContentNavAnchorState })[CONTENT_NAV_ANCHOR_STATE]
  if (!state) {
    return
  }

  if (state.hadAttribute) {
    state.target.setAttribute(CONTENT_NAV_ID_ATTR, state.previousValue ?? '')
  } else {
    state.target.removeAttribute(CONTENT_NAV_ID_ATTR)
  }

  delete (el as HTMLElement & { [CONTENT_NAV_ANCHOR_STATE]?: ContentNavAnchorState })[CONTENT_NAV_ANCHOR_STATE]
}

function apply(el: HTMLElement, value: ContentNavAnchorValue | undefined) {
  cleanup(el)

  const binding = normalizeBinding(value)
  if (!binding.id) {
    return
  }

  const target = resolveTarget(el, binding.closest)
  const hadAttribute = target.hasAttribute(CONTENT_NAV_ID_ATTR)
  const previousValue = target.getAttribute(CONTENT_NAV_ID_ATTR)

  target.setAttribute(CONTENT_NAV_ID_ATTR, binding.id)
  ;(el as HTMLElement & { [CONTENT_NAV_ANCHOR_STATE]?: ContentNavAnchorState })[CONTENT_NAV_ANCHOR_STATE] = {
    target,
    hadAttribute,
    previousValue,
  }
}

export const vContentNavAnchor: ObjectDirective<HTMLElement, ContentNavAnchorValue> = {
  mounted(el, binding) {
    apply(el, binding.value)
  },
  updated(el, binding) {
    apply(el, binding.value)
  },
  beforeUnmount(el) {
    cleanup(el)
  },
}
