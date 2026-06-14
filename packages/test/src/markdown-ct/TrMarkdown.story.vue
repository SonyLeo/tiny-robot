<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { TrMarkdown, useMarkdownContext } from '../../../components/src/markdown'
import type { TrMarkdownProps } from '../../../components/src/markdown'

type MarkdownStoryFixture = 'default' | 'component-props' | 'custom-semantic' | 'code-actions' | 'custom-alert'

const props = withDefaults(
  defineProps<{
    citations?: TrMarkdownProps['citations']
    code?: TrMarkdownProps['code']
    componentProps?: TrMarkdownProps['componentProps']
    content?: string
    features?: TrMarkdownProps['features']
    fixture?: MarkdownStoryFixture
    link?: TrMarkdownProps['link']
    parserOptions?: TrMarkdownProps['parserOptions']
    probeContext?: boolean
    renderOptions?: TrMarkdownProps['renderOptions']
    streaming?: TrMarkdownProps['streaming']
    variant?: TrMarkdownProps['variant']
  }>(),
  {
    content: '',
    fixture: 'default',
    probeContext: false,
    variant: 'default',
  },
)

const ContextProbeParagraph = defineComponent({
  name: 'MarkdownContextProbeParagraph',
  setup(_, { slots }) {
    const context = useMarkdownContext()

    return () => {
      return h(
        'p',
        {
          class: 'markdown-ct__context-probe',
          'data-context-variant': context?.variant || 'missing',
          'data-context-link-target': context?.link.target || 'missing',
          'data-context-link-rel': context?.link.rel || 'missing',
          'data-context-html-enabled': String(Boolean(context?.features.html)),
          'data-context-copyable': String(Boolean(context?.code.copyable)),
          'data-context-streaming-active': String(Boolean(context?.streaming.active)),
          'data-context-streaming-enabled': String(Boolean(context?.streaming.enabled)),
        },
        slots.default?.(),
      )
    }
  },
})

const StoryHeading = defineComponent({
  name: 'MarkdownCtHeading',
  props: {
    badge: {
      type: String,
      default: '',
    },
    level: {
      type: Number,
      default: 2,
    },
  },
  setup(componentProps, { slots }) {
    return () =>
      h(
        `h${componentProps.level}`,
        {
          class: 'markdown-ct__custom-heading',
          'data-heading-badge': componentProps.badge,
        },
        [
          slots.default?.(),
          componentProps.badge ? h('span', { 'data-custom-heading-badge': 'true' }, componentProps.badge) : null,
        ],
      )
  },
})

const StoryLink = defineComponent({
  name: 'MarkdownCtLink',
  props: {
    href: {
      type: String,
      default: '',
    },
    rel: {
      type: String,
      default: undefined,
    },
    target: {
      type: String,
      default: undefined,
    },
    tone: {
      type: String,
      default: '',
    },
  },
  setup(componentProps, { slots }) {
    return () =>
      h(
        'a',
        {
          class: 'markdown-ct__custom-link tr-markdown__link',
          'data-link-tone': componentProps.tone,
          href: componentProps.href,
          rel: componentProps.rel,
          target: componentProps.target,
        },
        [
          slots.default?.(),
          componentProps.tone
            ? h('span', { 'data-custom-link-icon': 'true' }, componentProps.tone.toUpperCase())
            : null,
        ],
      )
  },
})

const StoryInlineCode = defineComponent({
  name: 'MarkdownCtInlineCode',
  props: {
    code: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    tone: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    return () =>
      h(
        'code',
        {
          class: 'markdown-ct__custom-inline-code tr-markdown__inline-code',
          'data-inline-label': componentProps.label,
          'data-inline-tone': componentProps.tone,
        },
        componentProps.code,
      )
  },
})

const StoryThinkingBlock = defineComponent({
  name: 'MarkdownCtThinkingBlock',
  props: {
    content: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Thinking',
    },
  },
  setup(componentProps) {
    return () =>
      h(
        'details',
        {
          'data-thinking-block': 'true',
        },
        [
          h('summary', { 'data-thinking-trigger': 'true' }, componentProps.title),
          h('div', { 'data-thinking-body': 'true' }, componentProps.content),
        ],
      )
  },
})

const StoryArtifactBlock = defineComponent({
  name: 'MarkdownCtArtifactBlock',
  props: {
    content: {
      type: String,
      default: '',
    },
    identifier: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    return () =>
      h(
        'section',
        {
          'data-artifact-block': 'true',
          'data-artifact-identifier': componentProps.identifier,
          'data-artifact-type': componentProps.type,
        },
        [h('pre', { class: 'tr-markdown__artifact-pre' }, componentProps.content)],
      )
  },
})

const components = computed<TrMarkdownProps['components']>(() => {
  const presetComponents: TrMarkdownProps['components'] = {}

  if (props.fixture === 'component-props') {
    presetComponents.heading = StoryHeading
    presetComponents.link = StoryLink
    presetComponents.inlineCode = StoryInlineCode
  }

  if (props.fixture === 'custom-semantic') {
    presetComponents.thinkingBlock = StoryThinkingBlock
    presetComponents.artifactBlock = StoryArtifactBlock
  }

  if (!props.probeContext) {
    return presetComponents
  }

  return {
    ...presetComponents,
    paragraph: ContextProbeParagraph,
  }
})

const resolvedCode = computed<TrMarkdownProps['code']>(() => {
  if (props.fixture !== 'code-actions') {
    return props.code
  }

  return {
    ...props.code,
    actionsRender: ({ language, renderDefaultActions }) => [
      renderDefaultActions(),
      h(
        'button',
        {
          class: 'markdown-ct__custom-code-action',
          'data-code-action-language': language || '',
          type: 'button',
        },
        'Custom action',
      ),
    ],
  }
})

const resolvedRenderOptions = computed<TrMarkdownProps['renderOptions']>(() => {
  if (props.fixture !== 'custom-alert') {
    return props.renderOptions
  }

  return {
    ...props.renderOptions,
    alerts: {
      ...props.renderOptions?.alerts,
      render: ({ kind, renderChildren, title }) =>
        h(
          'aside',
          {
            class: 'markdown-ct__custom-alert',
            'data-custom-alert-kind': kind,
            role: kind === 'warning' || kind === 'caution' ? 'alert' : 'note',
          },
          [h('strong', { class: 'markdown-ct__custom-alert-title' }, title), ...renderChildren()],
        ),
    },
  }
})
</script>

<template>
  <TrMarkdown
    :citations="citations"
    :code="resolvedCode"
    :component-props="componentProps"
    :components="components"
    :content="content"
    :features="features"
    :link="link"
    :parser-options="parserOptions"
    :render-options="resolvedRenderOptions"
    :streaming="streaming"
    :variant="variant"
  />
</template>
