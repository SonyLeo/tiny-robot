<script setup lang="ts">
import { computed } from 'vue'
import type { MarkdownStreamingTelemetry } from '../types/markdownDemo'

const props = withDefaults(
  defineProps<{
    telemetry: MarkdownStreamingTelemetry
    variant?: 'preview' | 'controls'
  }>(),
  {
    variant: 'controls',
  },
)

const metrics = computed(() => [
  {
    label: 'state',
    value: props.telemetry.state,
    accent: true,
  },
  {
    label: 'scheduler',
    value: props.telemetry.schedulerPhase,
  },
  {
    label: 'update',
    value: props.telemetry.updateKind,
  },
  {
    label: 'hard reset',
    value: props.telemetry.hardReset ? 'yes' : 'no',
  },
  {
    label: 'skip chars',
    value: props.telemetry.skippedCharCount,
  },
  {
    label: 'skip nodes',
    value: props.telemetry.skippedNodeCount,
  },
  {
    label: 'queue',
    value: props.telemetry.queueLength,
  },
  {
    label: 'blocks',
    value: props.telemetry.blockCount,
  },
  {
    label: 'active idx',
    value: props.telemetry.activeIndex,
  },
  {
    label: 'animating idx',
    value: props.telemetry.animatingIndex,
  },
  {
    label: 'streaming idx',
    value: props.telemetry.streamingIndex,
  },
  {
    label: 'char delay',
    value: props.telemetry.charDelay.toFixed(2),
  },
  {
    label: 'fade',
    value: props.telemetry.fadeDuration,
  },
  {
    label: 'settle hold',
    value: props.telemetry.settleHoldMs,
  },
  {
    label: 'active blocks',
    value: props.telemetry.activeBlockCount,
  },
  {
    label: 'revealed',
    value: props.telemetry.revealedCount,
  },
  {
    label: 'pending',
    value: props.telemetry.pendingCount,
  },
  {
    label: 'live chars',
    value: props.telemetry.liveCharCount,
  },
  {
    label: 'rewrite',
    value: props.telemetry.rewriteCount,
  },
  {
    label: 'reset',
    value: props.telemetry.resetCount,
  },
  {
    label: 'parse',
    value: props.telemetry.parseCount,
  },
])

const profilerMetrics = computed(() => [
  {
    label: 'events',
    value: props.telemetry.profilerEventCount,
    accent: true,
  },
  {
    label: 'last event',
    value: props.telemetry.profilerLastEvent,
  },
  {
    label: 'root commits',
    value: props.telemetry.profilerRootCommitCount,
  },
  {
    label: 'root avg',
    value: props.telemetry.profilerRootCommitAvgMs.toFixed(2),
  },
  {
    label: 'root last',
    value: props.telemetry.profilerRootCommitLastMs.toFixed(2),
  },
  {
    label: 'block commits',
    value: props.telemetry.profilerBlockCommitCount,
  },
  {
    label: 'block avg',
    value: props.telemetry.profilerBlockCommitAvgMs.toFixed(2),
  },
  {
    label: 'block last',
    value: props.telemetry.profilerBlockCommitLastMs.toFixed(2),
  },
  {
    label: 'input',
    value: props.telemetry.profilerInputCount,
  },
  {
    label: 'append chars',
    value: props.telemetry.profilerInputAppendChars,
  },
  {
    label: 'rewrite input',
    value: props.telemetry.profilerInputRewriteCount,
  },
  {
    label: 'parse avg',
    value: props.telemetry.profilerParseAvgMs.toFixed(2),
  },
  {
    label: 'block diff avg',
    value: props.telemetry.profilerBlockDiffAvgMs.toFixed(2),
  },
  {
    label: 'queue events',
    value: props.telemetry.profilerQueueTransitionCount,
  },
  {
    label: 'settle',
    value: props.telemetry.profilerSettleCount,
  },
  {
    label: 'finalize',
    value: props.telemetry.profilerFinalizeCount,
  },
  {
    label: 'frames',
    value: props.telemetry.profilerAnimationFrameCount,
  },
  {
    label: 'reveal frames',
    value: props.telemetry.profilerRevealFrameCount,
  },
  {
    label: 'max backlog',
    value: props.telemetry.profilerMaxBacklog,
  },
  {
    label: 'fps avg',
    value: props.telemetry.profilerFpsAvg.toFixed(2),
  },
  {
    label: 'fps current',
    value: props.telemetry.profilerFpsCurrent.toFixed(2),
  },
  {
    label: 'fps index',
    value: props.telemetry.profilerFpsIndex,
  },
  {
    label: 'frame avg',
    value: props.telemetry.profilerFrameAvgMs.toFixed(2),
  },
  {
    label: 'frame last',
    value: props.telemetry.profilerFrameLastMs.toFixed(2),
  },
  {
    label: 'token events',
    value: props.telemetry.profilerTokenScheduleCount,
  },
  {
    label: 'token patch',
    value: `+${props.telemetry.profilerTokenInsertedCount} / =${props.telemetry.profilerTokenPreservedCount}`,
  },
  {
    label: 'tracked blocks',
    value: props.telemetry.profilerTrackedBlockCount,
  },
])

const timelineGroups = computed(() => {
  const source =
    props.variant === 'controls'
      ? props.telemetry.profilerTimeline.slice(-18)
      : props.telemetry.profilerTimeline.slice(-48)
  const groups = [
    { id: 'root', label: 'root', items: [] as string[] },
    { id: 'block', label: 'block', items: [] as string[] },
    { id: 'diff', label: 'diff', items: [] as string[] },
    { id: 'queue', label: 'queue', items: [] as string[] },
    { id: 'frame', label: 'frame', items: [] as string[] },
    { id: 'token', label: 'token', items: [] as string[] },
    { id: 'input', label: 'input', items: [] as string[] },
    { id: 'parse', label: 'parse', items: [] as string[] },
    { id: 'other', label: 'other', items: [] as string[] },
  ]

  for (const item of source) {
    const prefix = item.split(':', 1)[0] || 'other'
    const group = groups.find((entry) => entry.id === prefix) || groups.at(-1)
    group?.items.push(item)
  }

  return groups.filter((group) => group.items.length > 0)
})

const hiddenTimelineCount = computed(() =>
  Math.max(0, props.telemetry.profilerTimeline.length - timelineGroups.value.flatMap((group) => group.items).length),
)
</script>

<template>
  <section class="stream-telemetry" :class="`stream-telemetry--${variant}`">
    <div class="stream-telemetry__header">
      <span>stream telemetry</span>
      <p>
        观测 root state、scheduler phase、queue、active block、live char 与 rewrite/reset/parse，确认当前是否真的在排队
        reveal 并最终回落。
      </p>
    </div>

    <div class="stream-telemetry__grid">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="stream-telemetry__item"
        :class="{ 'stream-telemetry__item--accent': metric.accent }"
      >
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </div>
    </div>

    <template v-if="telemetry.profilerEnabled">
      <div class="stream-telemetry__header stream-telemetry__header--compact">
        <span>stream profiler</span>
        <p>
          事件流对齐 LobeUI profiler 心智：input、parse、block diff、queue transition、animation frame 与 token schedule
          都会进入同一条 timeline。
        </p>
      </div>

      <div class="stream-telemetry__grid">
        <div
          v-for="metric in profilerMetrics"
          :key="metric.label"
          class="stream-telemetry__item"
          :class="{ 'stream-telemetry__item--accent': metric.accent }"
        >
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
      </div>

      <div v-if="timelineGroups.length" class="stream-telemetry__timeline">
        <span v-if="hiddenTimelineCount">+{{ hiddenTimelineCount }} earlier</span>
        <div v-for="group in timelineGroups" :key="group.id" class="stream-telemetry__timeline-group">
          <span class="stream-telemetry__timeline-group-label">{{ group.label }}</span>
          <div class="stream-telemetry__timeline-group-items">
            <span v-for="(item, index) in group.items" :key="`${group.id}-${item}-${index}`">{{ item }}</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.stream-telemetry {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 28%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, transparent);
}

.stream-telemetry--controls {
  gap: 12px;
}

.stream-telemetry--preview {
  padding: 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 82%, var(--tr-page-bg-default) 18%);
}

.stream-telemetry__header,
.stream-telemetry__grid {
  display: grid;
  gap: 8px;
}

.stream-telemetry__header span {
  font-size: 12px;
  font-weight: 700;
  color: var(--tr-text-primary);
}

.stream-telemetry__header--compact {
  padding-top: 4px;
}

.stream-telemetry__header p {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.stream-telemetry__grid {
  grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
}

.stream-telemetry--controls .stream-telemetry__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stream-telemetry__item {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 24%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 88%, transparent);
}

.stream-telemetry__item span {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--tr-text-tertiary);
}

.stream-telemetry__item strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--tr-text-primary);
}

.stream-telemetry__item--accent {
  border-color: color-mix(in srgb, var(--tr-color-primary) 24%, var(--tr-border-color-default) 76%);
  background: color-mix(in srgb, var(--tr-container-bg-default) 76%, var(--tr-color-primary) 24%);
}

.stream-telemetry__timeline {
  display: grid;
  gap: 10px;
}

.stream-telemetry__timeline-group {
  display: grid;
  gap: 6px;
}

.stream-telemetry__timeline-group-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--tr-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stream-telemetry__timeline-group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stream-telemetry__timeline-group-items span,
.stream-telemetry__timeline > span {
  max-width: 100%;
  padding: 5px 8px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, var(--tr-color-primary) 12%);
  color: var(--tr-text-secondary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
