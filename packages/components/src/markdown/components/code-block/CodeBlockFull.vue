<script setup lang="ts">
import { IconArrowDown, IconArrowRight } from '@opentiny/tiny-robot-svgs'
import { computed, ref, watch } from 'vue'
import TrIconButton from '../../../icon-button'
import type { TrMarkdownCodeActionsRender, TrMarkdownCodeHighlightEngine } from '../../index.type'
import CodeBlockHeader from './CodeBlockHeader.vue'
import { useCodeHighlight } from './useCodeHighlight'

const props = withDefaults(
  defineProps<{
    actionsRender?: TrMarkdownCodeActionsRender
    code?: string
    copyable?: boolean
    defaultExpand?: boolean
    enableTransformer?: boolean
    highlight?: boolean
    highlightEngine?: TrMarkdownCodeHighlightEngine
    language?: string
    showLanguage?: boolean
  }>(),
  {
    copyable: true,
    defaultExpand: true,
    enableTransformer: false,
    highlight: true,
    highlightEngine: 'highlightjs',
    showLanguage: true,
  },
)

const expanded = ref(Boolean(props.defaultExpand))
const codeText = computed(() => props.code || '')
const expandIcon = computed(() => (expanded.value ? IconArrowDown : IconArrowRight))

const { highlightedHtml } = useCodeHighlight({
  getCode: () => codeText.value,
  getDisplay: () => 'block',
  getEnableTransformer: () => Boolean(props.enableTransformer),
  getEngine: () => props.highlightEngine,
  getHighlight: () => Boolean(props.highlight),
  getLanguage: () => props.language,
})

const toggleExpand = () => {
  expanded.value = !expanded.value
}

watch(
  () => props.defaultExpand,
  (value) => {
    expanded.value = Boolean(value)
  },
)
</script>

<template>
  <div class="tr-markdown__code-block-wrap tr-markdown__code-block-wrap--full" :data-language="language || undefined">
    <div class="tr-markdown__code-full-header-shell" @click="toggleExpand">
      <CodeBlockHeader
        :actions-render="actionsRender"
        :code="codeText"
        :copyable="copyable"
        :language="language"
        mode="full"
        :show-language="showLanguage"
        toolbar-size="small"
      >
        <template #actions-after>
          <TrIconButton
            class="tr-markdown__code-expand"
            :icon="expandIcon"
            size="24px"
            svg-size="14px"
            :aria-expanded="expanded"
            :aria-label="expanded ? 'Collapse code block' : 'Expand code block'"
            :title="expanded ? 'Collapse code block' : 'Expand code block'"
            @click.stop="toggleExpand"
          />
        </template>
      </CodeBlockHeader>
    </div>

    <div class="tr-markdown__code-full-body" :class="{ 'tr-markdown__code-full-body--collapsed': !expanded }">
      <div class="tr-markdown__code-full-body-inner">
        <div class="tr-markdown__code-block tr-markdown__code-block--full">
          <pre v-if="!highlightedHtml" class="tr-markdown__code-plain"><code>{{ codeText }}</code></pre>
          <div
            v-else
            class="tr-markdown__code-highlight tr-markdown__code-highlight--block"
            v-html="highlightedHtml"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
