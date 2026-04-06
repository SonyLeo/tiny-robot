import type {
  ContentNavActiveResolver,
  ContentNavHighlightSegment,
  ContentNavItem,
  ContentNavJumpFeedbackController,
  ContentNavSearchMatcher,
} from './index.type'

const FLASH_CLASS = 'tr-content-nav-target--flash'
const OUTLINE_CLASS = 'tr-content-nav-target--outline'

export const defaultContentNavSearchMatcher: ContentNavSearchMatcher = (item, rawQuery) => {
  const query = rawQuery.trim().toLowerCase()
  const source = (item.searchText || item.label).trim()

  if (!query) {
    return [{ text: item.label, highlighted: false }]
  }

  const normalizedLabel = item.label.toLowerCase()
  const labelIndex = normalizedLabel.indexOf(query)

  if (labelIndex !== -1) {
    return [
      { text: item.label.slice(0, labelIndex), highlighted: false },
      { text: item.label.slice(labelIndex, labelIndex + query.length), highlighted: true },
      { text: item.label.slice(labelIndex + query.length), highlighted: false },
    ].filter((segment) => segment.text.length > 0)
  }

  if (source.toLowerCase().includes(query)) {
    return [{ text: item.label, highlighted: false }]
  }

  return false
}

export const createTopThresholdActiveResolver = (offset = 120): ContentNavActiveResolver => {
  return ({ container, anchors, items }) => {
    if (!anchors.length || !items.length) {
      return items[0]?.id
    }

    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 2
    if (isAtBottom) {
      return items[items.length - 1]?.id
    }

    const containerRect = container.getBoundingClientRect()
    const threshold = containerRect.top + offset
    let activeId = items[0]?.id

    for (const anchor of anchors) {
      const rect = anchor.el.getBoundingClientRect()
      if (rect.top <= threshold) {
        activeId = anchor.id
      } else {
        break
      }
    }

    return activeId
  }
}

export const createNearestCenterResolver = (): ContentNavActiveResolver => {
  return ({ container, anchors, items }) => {
    if (!anchors.length || !items.length) {
      return items[0]?.id
    }

    const containerRect = container.getBoundingClientRect()
    const center = containerRect.top + containerRect.height / 2
    let nearestId = items[0]?.id
    let minDistance = Number.POSITIVE_INFINITY

    for (const anchor of anchors) {
      const rect = anchor.el.getBoundingClientRect()
      const distance = Math.abs(rect.top - center)
      if (distance < minDistance) {
        minDistance = distance
        nearestId = anchor.id
      }
    }

    return nearestId
  }
}

export const defaultContentNavActiveResolver = createTopThresholdActiveResolver()

function createClassFeedbackController(className: string, duration = 700): ContentNavJumpFeedbackController {
  return {
    duration,
    apply(el) {
      el.classList.remove(className)
      void el.offsetWidth
      el.classList.add(className)
    },
    clear(el) {
      el.classList.remove(className)
    },
  }
}

export function createContentNavFlashFeedback(duration = 700) {
  return createClassFeedbackController(FLASH_CLASS, duration)
}

export function createContentNavOutlinePulseFeedback(duration = 900) {
  return createClassFeedbackController(OUTLINE_CLASS, duration)
}

export function ensureContentNavSegments(item: ContentNavItem, segments: false | ContentNavHighlightSegment[]) {
  if (!segments) {
    return [{ text: item.label, highlighted: false }]
  }

  return segments
}
