<script setup lang="ts">
import {
  IconErrorFilled,
  IconInfoFilled,
  IconSparkles,
  IconSuccessFilled,
  IconWarning,
} from '@opentiny/tiny-robot-svgs'
import { computed, type Component } from 'vue'
import type { TrMarkdownAlertKind } from '../../index.type'
import { getAlertTitle } from '../../utils/alerts'

const props = defineProps<{
  kind: TrMarkdownAlertKind
  title?: string
}>()

const alertIconMap: Record<TrMarkdownAlertKind, Component> = {
  note: IconInfoFilled,
  tip: IconSuccessFilled,
  important: IconSparkles,
  warning: IconWarning,
  caution: IconErrorFilled,
}

const icon = computed(() => alertIconMap[props.kind])
const resolvedTitle = computed(() => props.title || getAlertTitle(props.kind))
const role = computed(() => (props.kind === 'warning' || props.kind === 'caution' ? 'alert' : 'note'))
</script>

<template>
  <section class="tr-markdown__alert" :data-alert-kind="kind" :role="role">
    <header class="tr-markdown__alert-header">
      <component :is="icon" class="tr-markdown__alert-icon" aria-hidden="true" />
      <strong class="tr-markdown__alert-title">{{ resolvedTitle }}</strong>
    </header>
    <div class="tr-markdown__alert-body">
      <slot />
    </div>
  </section>
</template>
