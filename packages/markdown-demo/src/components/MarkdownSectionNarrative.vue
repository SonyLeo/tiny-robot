<script setup lang="ts">
import { computed } from 'vue'
import type { MarkdownDemoCase, MarkdownDemoSectionPublicNarrative } from '../types/markdownDemo'

const props = defineProps<{
  story: MarkdownDemoSectionPublicNarrative
  displayedCases: MarkdownDemoCase[]
  hiddenCases: MarkdownDemoCase[]
}>()

const emit = defineEmits<{
  focusCase: [caseId: string]
}>()

const displayedCaseIds = computed(() => new Set(props.displayedCases.map((demoCase) => demoCase.id)))

const orderedCases = computed(() => {
  const caseMap = new Map([...props.displayedCases, ...props.hiddenCases].map((demoCase) => [demoCase.id, demoCase]))
  const orderedIds = props.story.stepCaseIds?.length
    ? props.story.stepCaseIds
    : [...props.displayedCases, ...props.hiddenCases].map((demoCase) => demoCase.id)

  return orderedIds.flatMap((caseId) => {
    const demoCase = caseMap.get(caseId)
    return demoCase ? [demoCase] : []
  })
})

const getCaseLabel = (demoCase: MarkdownDemoCase) => {
  return props.story.stepLabels?.[demoCase.id] || demoCase.title
}

const isDisplayedCase = (caseId: string) => {
  return displayedCaseIds.value.has(caseId)
}
</script>

<template>
  <section class="section-narrative">
    <div class="section-narrative__copy">
      <p>{{ story.title }}</p>
      <strong>{{ story.description }}</strong>
      <span v-if="hiddenCases.length">
        默认只展示主路径案例，进阶 case 通过下方 chips 进入，先保证公开阅读路径清晰。
      </span>
    </div>

    <div v-if="orderedCases.length" class="section-narrative__steps">
      <button
        v-for="demoCase in orderedCases"
        :key="demoCase.id"
        type="button"
        class="section-narrative__step"
        :class="{
          'section-narrative__step--featured': isDisplayedCase(demoCase.id),
          'section-narrative__step--advanced': !isDisplayedCase(demoCase.id),
        }"
        @click="emit('focusCase', demoCase.id)"
      >
        <span>{{ getCaseLabel(demoCase) }}</span>
        <strong>{{ isDisplayedCase(demoCase.id) ? 'Shown' : 'Advanced' }}</strong>
      </button>
    </div>
  </section>
</template>

<style scoped>
.section-narrative {
  display: grid;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 16%, transparent);
  border-radius: 20px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent), transparent),
    color-mix(in srgb, var(--tr-container-bg-default) 90%, transparent);
}

.section-narrative__copy {
  display: grid;
  gap: 6px;
}

.section-narrative__copy p,
.section-narrative__copy strong,
.section-narrative__copy span {
  margin: 0;
}

.section-narrative__copy p {
  color: var(--tr-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-narrative__copy strong {
  color: var(--tr-text-primary);
  font-size: 15px;
  line-height: 1.6;
}

.section-narrative__copy span {
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.section-narrative__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.section-narrative__step {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 82%, transparent);
  color: var(--tr-text-primary);
  font: inherit;
  cursor: pointer;
}

.section-narrative__step span,
.section-narrative__step strong {
  font-size: 12px;
}

.section-narrative__step span {
  font-weight: 600;
}

.section-narrative__step strong {
  color: var(--tr-text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-narrative__step--featured {
  border-color: color-mix(in srgb, var(--tr-color-primary) 28%, transparent);
  background: color-mix(in srgb, var(--tr-container-bg-default) 74%, var(--tr-color-primary) 26%);
}

.section-narrative__step--advanced {
  background: color-mix(in srgb, var(--tr-container-bg-default) 88%, transparent);
}
</style>
