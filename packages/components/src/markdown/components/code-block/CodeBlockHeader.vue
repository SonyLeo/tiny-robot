<script setup lang="ts">
import type { TrMarkdownCodeActionsRender, TrMarkdownCodeBlockMode } from '../../index.type'
import CodeBlockToolbar from './CodeBlockToolbar'
import CodeLanguageTag from './CodeLanguageTag.vue'

withDefaults(
  defineProps<{
    actionsRender?: TrMarkdownCodeActionsRender
    code?: string
    copyable?: boolean
    language?: string
    mode?: TrMarkdownCodeBlockMode
    showLanguage?: boolean
    toolbarAlwaysVisible?: boolean
    toolbarSize?: 'small' | 'medium'
  }>(),
  {
    mode: 'overlay',
    showLanguage: true,
    toolbarAlwaysVisible: false,
    toolbarSize: 'medium',
  },
)
</script>

<template>
  <div class="tr-markdown__code-header" :class="`tr-markdown__code-header--${mode}`">
    <CodeLanguageTag v-if="showLanguage" :language="language" :mode="mode" />
    <div class="tr-markdown__code-header-actions" @click.stop>
      <CodeBlockToolbar
        :actions-render="actionsRender"
        :always-visible="toolbarAlwaysVisible"
        :code="code"
        :copyable="copyable"
        :language="language"
        :size="toolbarSize"
      />
      <slot name="actions-after" />
    </div>
  </div>
</template>
