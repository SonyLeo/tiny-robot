import { computed, ref, watch } from 'vue'
import { defaultContentNavSearchMatcher, ensureContentNavSegments } from './defaults'
import type { ContentNavFilteredItem, ContentNavStateOptions } from './index.type'

export function useContentNavState(options: ContentNavStateOptions) {
  const localExpanded = ref(false)
  const localQuery = ref('')
  const highlightedIndex = ref(0)

  const search = computed(() => {
    const value = options.search?.value
    return value || undefined
  })
  const collapsible = computed(() => options.collapsible?.value !== false)
  const keyboardMode = computed(() => options.keyboardMode?.value ?? 'basic')

  const expanded = computed(() => options.expanded?.value ?? (collapsible.value ? localExpanded.value : true))
  const query = computed(() => options.query?.value ?? localQuery.value)
  const matcher = computed(() => search.value?.matcher ?? defaultContentNavSearchMatcher)

  const filteredItems = computed<ContentNavFilteredItem[]>(() => {
    const keyword = query.value.trim()

    return options.items.value
      .map((item) => {
        const segments = matcher.value(item, keyword)
        if (keyword && !segments) {
          return null
        }

        return {
          item,
          segments: ensureContentNavSegments(item, segments),
        }
      })
      .filter((entry): entry is ContentNavFilteredItem => entry !== null)
  })

  const highlightedId = computed(() => filteredItems.value[highlightedIndex.value]?.item.id)

  function setExpanded(value: boolean) {
    if (!collapsible.value && !value) {
      return
    }

    if (options.expanded?.value === undefined) {
      localExpanded.value = value
    }

    options.onUpdateExpanded?.(value)

    if (!value && search.value?.clearOnCollapse && query.value) {
      setQuery('')
    }
  }

  function setQuery(value: string) {
    if (options.query?.value === undefined) {
      localQuery.value = value
    }

    options.onUpdateQuery?.(value)
  }

  function clampHighlightedIndex(nextIndex: number) {
    if (!filteredItems.value.length) {
      highlightedIndex.value = 0
      return
    }

    highlightedIndex.value = Math.max(0, Math.min(nextIndex, filteredItems.value.length - 1))
  }

  function moveNext() {
    clampHighlightedIndex(highlightedIndex.value + 1)
  }

  function movePrev() {
    clampHighlightedIndex(highlightedIndex.value - 1)
  }

  function moveFirst() {
    clampHighlightedIndex(0)
  }

  function moveLast() {
    clampHighlightedIndex(filteredItems.value.length - 1)
  }

  function syncHighlightedToActive() {
    const targetId = options.activeId.value
    const index = filteredItems.value.findIndex((entry) => entry.item.id === targetId)
    highlightedIndex.value = index === -1 ? 0 : index
  }

  function activateHighlighted() {
    return filteredItems.value[highlightedIndex.value]?.item
  }

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardMode.value === 'none') {
      return false
    }

    if (keyboardMode.value === 'basic') {
      if (event.key === 'Escape') {
        setExpanded(false)
        return true
      }
      return false
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveNext()
      return true
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      movePrev()
      return true
    }

    if (event.key === 'Home') {
      event.preventDefault()
      moveFirst()
      return true
    }

    if (event.key === 'End') {
      event.preventDefault()
      moveLast()
      return true
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setExpanded(false)
      return true
    }

    return false
  }

  watch(
    filteredItems,
    (items) => {
      if (!items.length) {
        highlightedIndex.value = 0
        return
      }

      clampHighlightedIndex(highlightedIndex.value)
    },
    { immediate: true },
  )

  watch(
    () => options.activeId.value,
    () => {
      syncHighlightedToActive()
    },
    { immediate: true },
  )

  return {
    search,
    collapsible,
    expanded,
    query,
    filteredItems,
    highlightedIndex,
    highlightedId,
    setExpanded,
    setQuery,
    moveNext,
    movePrev,
    moveFirst,
    moveLast,
    activateHighlighted,
    handleKeydown,
  }
}
