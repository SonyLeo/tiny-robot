<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { trMarkdownStreamingFixtures } from '../../../components/src/markdown/fixtures/streaming'
import MarkdownStreamingTelemetryPanel from './MarkdownStreamingTelemetryPanel.vue'
import type { MarkdownDemoControlPanelProps } from '../types/markdownDemo'

const props = defineProps<MarkdownDemoControlPanelProps>()

const documentVariants = computed(() => props.demoCase.streamingDocumentVariants || [])
const hasDocumentVariants = computed(() => documentVariants.value.length > 0)
const documentVariantId = ref(documentVariants.value[0]?.id || '')
const activeDocumentVariant = computed(
  () => documentVariants.value.find((variant) => variant.id === documentVariantId.value) || documentVariants.value[0],
)

const availableScenarios = computed(() => {
  if (activeDocumentVariant.value?.streamingScenarios?.length) {
    return activeDocumentVariant.value.streamingScenarios
  }

  if (props.demoCase.streamingScenarios?.length) {
    return props.demoCase.streamingScenarios
  }

  const targetIds = props.demoCase.streamingScenarioIds
  if (!targetIds?.length) {
    return trMarkdownStreamingFixtures
  }

  return trMarkdownStreamingFixtures.filter((scenario) => targetIds.includes(scenario.id))
})

const speedOptions = [
  { label: 'Slow', value: 'slow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Fast', value: 'fast' },
] as const

const speedMultiplierMap = {
  slow: 1.35,
  normal: 1,
  fast: 0.72,
} as const

type PlaybackSpeed = (typeof speedOptions)[number]['value']

const scenarioId = ref(availableScenarios.value[0]?.id || '')
const stepIndex = ref(0)
const isPlaying = ref(true)
const loopPlayback = ref(true)
const speed = ref<PlaybackSpeed>('normal')
let playbackTimer: ReturnType<typeof setTimeout> | null = null

const activeScenario = computed(
  () => availableScenarios.value.find((scenario) => scenario.id === scenarioId.value) || availableScenarios.value[0],
)
const activeSteps = computed(() => activeScenario.value?.steps || [])
const stepCount = computed(() => activeSteps.value.length)
const maxStepIndex = computed(() => Math.max(0, stepCount.value - 1))
const activeStep = computed(() => activeSteps.value[stepIndex.value])
const isLastStep = computed(() => stepIndex.value >= maxStepIndex.value)
const progressPercent = computed(() => {
  if (stepCount.value <= 1) {
    return 100
  }

  return (stepIndex.value / maxStepIndex.value) * 100
})
const groupLabelMap = {
  basic: 'Basic',
  code: 'Code',
  stress: 'Stress',
} as const

const clearPlaybackTimer = () => {
  if (playbackTimer) {
    clearTimeout(playbackTimer)
    playbackTimer = null
  }
}

const getStepDuration = () => {
  if (!activeScenario.value || !activeStep.value) {
    return 1600
  }

  const previousContent = stepIndex.value > 0 ? activeSteps.value[stepIndex.value - 1]?.content || '' : ''
  const currentContent = activeStep.value.content || ''
  const deltaChars = Math.max(1, currentContent.length - previousContent.length)
  const baseDelayMap = {
    basic: 1480,
    code: 1660,
    stress: 1920,
  } as const
  const perCharFactorMap = {
    basic: 4.5,
    code: 3.8,
    stress: 2.4,
  } as const

  const baseDelay = baseDelayMap[activeScenario.value.group]
  const perCharFactor = perCharFactorMap[activeScenario.value.group]
  const holdDelay = isLastStep.value ? 520 : 0
  const rawDuration = Math.min(4200, baseDelay + deltaChars * perCharFactor + holdDelay)

  return Math.round(rawDuration * speedMultiplierMap[speed.value])
}

const playbackDelay = computed(() => getStepDuration())
const playbackDelayLabel = computed(() => `${(playbackDelay.value / 1000).toFixed(1)}s / chunk`)
const finalizeDelay = computed(() => Math.max(760, Math.round(playbackDelay.value * 0.55)))
const replayHoldDelay = computed(() => Math.max(680, Math.round(playbackDelay.value * 0.42)))
const isPreviewFinalized = computed(() => props.streamingTelemetry?.state === 'finalized')
const showProfilerPanel = computed(() => Boolean(props.streamingTelemetry?.profilerEnabled))

const syncContent = () => {
  if (!activeStep.value) {
    props.setContent('')
    props.setStreamingActive(false)
    return
  }

  props.setStreamingActive(true)
  props.setContent(activeStep.value.content)
}

const schedulePlayback = () => {
  clearPlaybackTimer()

  if (!isPlaying.value || stepCount.value <= 1) {
    return
  }

  const nextDelay = isLastStep.value
    ? props.controls.streamingActive
      ? finalizeDelay.value
      : isPreviewFinalized.value
        ? replayHoldDelay.value
        : 180
    : playbackDelay.value

  playbackTimer = setTimeout(() => {
    if (isLastStep.value) {
      if (props.controls.streamingActive) {
        props.setStreamingActive(false)
        return
      }

      if (!isPreviewFinalized.value) {
        return
      }

      if (!loopPlayback.value) {
        isPlaying.value = false
        return
      }

      stepIndex.value = 0
      return
    }

    stepIndex.value += 1
  }, nextDelay)
}

watch([scenarioId, stepIndex], syncContent, {
  immediate: true,
})

watch(
  activeScenario,
  (scenario) => {
    if (!scenario) {
      return
    }

    if (stepIndex.value > scenario.steps.length - 1) {
      stepIndex.value = scenario.steps.length - 1
    }
  },
  {
    immediate: true,
  },
)

watch(
  documentVariants,
  (variants) => {
    if (!variants.length) {
      documentVariantId.value = ''
      return
    }

    if (!variants.some((variant) => variant.id === documentVariantId.value)) {
      documentVariantId.value = variants[0].id
    }
  },
  {
    immediate: true,
  },
)

watch(
  documentVariantId,
  () => {
    stepIndex.value = 0
    isPlaying.value = true
    props.setStreamingActive(true)
  },
  {
    immediate: true,
  },
)

watch(
  availableScenarios,
  (scenarios) => {
    if (!scenarios.length) {
      scenarioId.value = ''
      stepIndex.value = 0
      clearPlaybackTimer()
      return
    }

    if (!scenarios.some((scenario) => scenario.id === scenarioId.value)) {
      scenarioId.value = scenarios[0].id
    }

    stepIndex.value = 0
    isPlaying.value = true
  },
  {
    immediate: true,
  },
)

watch(
  [scenarioId, stepIndex, isPlaying, loopPlayback, speed, () => props.controls.streamingActive, isPreviewFinalized],
  schedulePlayback,
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  clearPlaybackTimer()
})

const updateScenario = (nextScenarioId: string) => {
  scenarioId.value = nextScenarioId
  stepIndex.value = 0
  isPlaying.value = true
  props.setStreamingActive(true)
}

const updateDocumentVariant = (nextVariantId: string) => {
  documentVariantId.value = nextVariantId
}

const restartPlayback = () => {
  stepIndex.value = 0
  isPlaying.value = true
  props.setStreamingActive(true)
}

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
}

const seekStep = (nextIndex: string | number) => {
  stepIndex.value = Math.min(Math.max(Number(nextIndex), 0), maxStepIndex.value)
  props.setStreamingActive(true)
}
</script>

<template>
  <section class="stream-controls">
    <div class="stream-controls__toolbar">
      <button type="button" class="stream-controls__pill" @click="togglePlayback">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button type="button" class="stream-controls__pill" @click="restartPlayback">Replay</button>
      <button
        type="button"
        class="stream-controls__pill"
        :class="{ 'stream-controls__pill--active': loopPlayback }"
        @click="loopPlayback = !loopPlayback"
      >
        Loop {{ loopPlayback ? 'On' : 'Off' }}
      </button>
    </div>

    <label v-if="hasDocumentVariants" class="stream-controls__field">
      <span>language</span>
      <select :value="documentVariantId" @change="updateDocumentVariant(($event.target as HTMLSelectElement).value)">
        <option v-for="variant in documentVariants" :key="variant.id" :value="variant.id">
          {{ variant.label }}
        </option>
      </select>
    </label>

    <label class="stream-controls__field">
      <span>{{ hasDocumentVariants ? 'document' : 'scenario' }}</span>
      <select :value="scenarioId" @change="updateScenario(($event.target as HTMLSelectElement).value)">
        <option v-for="scenario in availableScenarios" :key="scenario.id" :value="scenario.id">
          {{ scenario.title }}
        </option>
      </select>
    </label>

    <label class="stream-controls__field">
      <span>playback speed</span>
      <select v-model="speed">
        <option v-for="option in speedOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <div class="stream-controls__summary">
      <span>{{ groupLabelMap[activeScenario.group] }}</span>
      <strong>{{ activeScenario.title }}</strong>
      <p>{{ activeScenario.description }}</p>
    </div>

    <div class="stream-controls__timeline">
      <div class="stream-controls__step-meta">
        <strong>{{ activeStep.label }}</strong>
        <span>{{ stepIndex + 1 }} / {{ stepCount }} · {{ playbackDelayLabel }}</span>
      </div>
      <input
        :value="stepIndex"
        class="stream-controls__range"
        type="range"
        min="0"
        :max="maxStepIndex"
        step="1"
        @input="seekStep(($event.target as HTMLInputElement).value)"
      />
      <div class="stream-controls__progress">
        <div class="stream-controls__progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <details class="stream-controls__drawer">
      <summary>steps</summary>
      <div class="stream-controls__steps">
        <button
          v-for="(step, index) in activeSteps"
          :key="step.id"
          type="button"
          class="stream-controls__step"
          :class="{ 'stream-controls__step--active': index === stepIndex }"
          @click="seekStep(index)"
        >
          {{ step.label }}
        </button>
      </div>
    </details>

    <details v-if="streamingTelemetry" class="stream-controls__drawer" :open="showProfilerPanel">
      <summary>{{ showProfilerPanel ? 'profiler' : 'telemetry' }}</summary>
      <MarkdownStreamingTelemetryPanel :telemetry="streamingTelemetry" />
    </details>
  </section>
</template>

<style scoped>
.stream-controls {
  display: grid;
  gap: 14px;
}

.stream-controls__timeline,
.stream-controls__field,
.stream-controls__summary {
  display: grid;
  gap: 8px;
}

.stream-controls__field > span,
.stream-controls__summary > span,
.stream-controls__drawer > summary {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--tr-text-secondary);
  text-transform: none;
}

.stream-controls__summary strong {
  color: var(--tr-text-primary);
  font-size: 14px;
  line-height: 1.4;
}

.stream-controls__summary p {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.stream-controls__toolbar {
  display: flex;
  gap: 8px;
}

.stream-controls__steps {
  display: grid;
  gap: 8px;
}

.stream-controls__step,
.stream-controls__pill {
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 30%, transparent);
  border-radius: 12px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  font: inherit;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.stream-controls__step:hover,
.stream-controls__pill:hover {
  border-color: color-mix(in srgb, var(--tr-color-primary) 28%, var(--tr-border-color-default) 72%);
  background: color-mix(in srgb, var(--tr-container-bg-default) 84%, var(--tr-color-primary) 16%);
}

.stream-controls__pill {
  flex: 1 1 0;
  min-height: 44px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.stream-controls__pill:first-child {
  background: var(--tr-text-primary);
  color: var(--tr-container-bg-default);
}

.stream-controls__pill--active,
.stream-controls__step--active {
  border-color: color-mix(in srgb, var(--tr-color-primary) 38%, transparent);
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, var(--tr-color-primary) 28%);
}

.stream-controls__field select {
  width: 100%;
  height: 38px;
  border: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--tr-border-color-default) 20%, transparent);
  color: var(--tr-text-primary);
  font: inherit;
  padding: 0 12px;
}

.stream-controls__step-meta {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.stream-controls__step-meta strong,
.stream-controls__step-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stream-controls__step-meta strong {
  font-size: 12px;
  color: var(--tr-text-primary);
}

.stream-controls__step-meta span {
  font-size: 11px;
  color: var(--tr-text-secondary);
}

.stream-controls__range {
  width: 100%;
  margin: 0;
  accent-color: var(--tr-color-primary);
}

.stream-controls__progress {
  position: relative;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-border-color-default) 20%, transparent);
}

.stream-controls__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--tr-color-primary) 78%, white 22%),
    color-mix(in srgb, var(--tr-color-primary) 52%, white 48%)
  );
  transition: width 0.2s ease;
}

.stream-controls__steps {
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
}

.stream-controls__step {
  min-height: 34px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
}

.stream-controls__drawer {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.stream-controls__drawer > summary {
  cursor: pointer;
  list-style: none;
}

.stream-controls__drawer > summary::-webkit-details-marker {
  display: none;
}

.stream-controls__drawer[open] > summary {
  margin-bottom: 10px;
  color: var(--tr-text-primary);
}
</style>
