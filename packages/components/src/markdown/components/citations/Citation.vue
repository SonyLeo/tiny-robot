<script setup lang="ts">
import { TinyTooltip } from '@opentiny/vue'
import { computed, h } from 'vue'

const props = defineProps<{
  href?: string
  url?: string
  index?: number
  label?: string
  title?: string
  alt?: string
  summary?: string
}>()

const normalizedLabel = computed(() => {
  if (props.label) {
    return props.label
  }

  if (typeof props.index === 'number' && props.index > 0) {
    return `[${props.index}]`
  }

  return '[?]'
})

const resolvedTitle = computed(() => {
  if (props.title) {
    return props.title
  }

  if (props.alt) {
    return props.alt
  }

  if (props.url) {
    try {
      return new URL(props.url).hostname.replace(/^www\./, '')
    } catch {
      return props.url
    }
  }

  return `Citation ${normalizedLabel.value}`
})

const hasCard = computed(() => Boolean(props.title || props.alt || props.summary || props.url))
const triggerAriaLabel = computed(() => {
  if (props.url) {
    return `Open citation ${normalizedLabel.value}`
  }

  return `Citation ${normalizedLabel.value}`
})
const triggerTag = computed(() => {
  if (props.url) {
    return 'a'
  }

  if (hasCard.value) {
    return 'button'
  }

  return 'span'
})
const triggerProps = computed(() => {
  if (props.url) {
    return {
      href: props.url,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  if (hasCard.value) {
    return {
      type: 'button',
    }
  }

  return {}
})

const tooltipRender = computed(() => {
  if (!hasCard.value) {
    return undefined
  }

  return () =>
    h('div', { class: 'tr-markdown__citation-tooltip' }, [
      h('strong', { class: 'tr-markdown__citation-tooltip-title' }, resolvedTitle.value),
      props.summary ? h('span', { class: 'tr-markdown__citation-tooltip-summary' }, props.summary) : undefined,
      props.url ? h('span', { class: 'tr-markdown__citation-tooltip-url' }, props.url) : undefined,
    ])
})
</script>

<template>
  <sup class="tr-markdown__citation" :data-citation-index="index" :data-citation-source="href || undefined">
    <tiny-tooltip
      v-if="tooltipRender"
      :render-content="tooltipRender"
      placement="top"
      effect="light"
      :visible-arrow="false"
      popper-class="tr-markdown__citation-popper"
    >
      <component
        :is="triggerTag"
        class="tr-markdown__citation-trigger"
        :aria-label="triggerAriaLabel"
        :data-citation-trigger="true"
        :data-citation-url="url || undefined"
        v-bind="triggerProps"
      >
        {{ normalizedLabel }}
      </component>
    </tiny-tooltip>

    <component
      :is="triggerTag"
      v-else
      class="tr-markdown__citation-trigger"
      :aria-label="triggerAriaLabel"
      :data-citation-trigger="true"
      :data-citation-url="url || undefined"
      v-bind="triggerProps"
    >
      {{ normalizedLabel }}
    </component>
  </sup>
</template>
