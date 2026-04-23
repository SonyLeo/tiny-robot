<template>
  <div class="content-nav-demo">
    <h2 data-testid="content-nav-page-title">ContentNav component test</h2>
    <p class="availability">
      Component export status:
      <strong data-testid="content-nav-availability">{{ hasContentNav ? 'ready' : 'missing' }}</strong>
    </p>

    <div class="controls">
      <label class="control-item">
        <input data-testid="toggle-bubble-mode" type="checkbox" v-model="bubbleMode" />
        Use Bubble scene
      </label>

      <label class="control-item">
        <input data-testid="toggle-single-turn-mode" type="checkbox" v-model="singleTurnMode" />
        Use single turn
      </label>

      <label class="control-item">
        <input data-testid="toggle-document-scroll-mode" type="checkbox" v-model="documentScrollMode" />
        Use document scroll
      </label>

      <label class="control-item">
        <input data-testid="toggle-special-id-mode" type="checkbox" v-model="specialIdMode" />
        Use special IDs
      </label>

      <label class="control-item">
        <input data-testid="toggle-empty-array-matcher" type="checkbox" v-model="emptyArrayMatcherMode" />
        Use empty-array matcher
      </label>

      <fieldset class="placement-switch">
        <legend>Expand Trigger</legend>
        <label class="control-item">
          <input data-testid="expand-trigger-hover" type="radio" value="hover" v-model="expandTrigger" />
          Hover
        </label>
        <label class="control-item">
          <input data-testid="expand-trigger-manual" type="radio" value="manual" v-model="expandTrigger" />
          Manual
        </label>
      </fieldset>

      <fieldset class="placement-switch">
        <legend>Placement</legend>
        <label class="control-item">
          <input data-testid="placement-left" type="radio" value="left" v-model="placement" />
          Left
        </label>
        <label class="control-item">
          <input data-testid="placement-right" type="radio" value="right" v-model="placement" />
          Right
        </label>
      </fieldset>

      <label class="control-item">
        External search query:
        <input
          data-testid="external-query-input"
          type="search"
          placeholder="Type to sync search query model"
          v-model="searchQuery"
        />
      </label>

      <button data-testid="reset-content-nav-state" class="reset-btn" @click="resetState">Reset state</button>
    </div>

    <div class="state-board">
      <div>
        Item count: <code data-testid="item-count-display">{{ items.length }}</code>
      </div>
      <div>
        Active ID: <code data-testid="active-id-display">{{ activeId }}</code>
      </div>
      <div>
        Expanded: <code data-testid="expanded-display">{{ String(expanded) }}</code>
      </div>
      <div>
        Search Query: <code data-testid="query-display">{{ searchQuery }}</code>
      </div>
      <div>
        Placement: <code data-testid="placement-display">{{ placement }}</code>
      </div>
      <div>
        Last event: <code data-testid="last-event-display">{{ lastEvent }}</code>
      </div>
    </div>

    <div class="workspace" :class="{ 'is-document-scroll': documentScrollMode }">
      <div class="content-nav-host" data-testid="content-nav-host">
        <component
          :is="resolvedContentNav"
          data-testid="content-nav-root"
          :items="items"
          :scroll-container="resolvedScrollContainer"
          :active-id="activeId"
          :active-offset="24"
          v-model:expanded="expanded"
          v-model:search-query="searchQuery"
          :expand-trigger="expandTrigger"
          :placement="placement"
          :search-options="searchOptions"
          :tooltip-delay="260"
          target-feedback-class="tr-content-nav-target--flash"
          :target-feedback-duration="700"
          @update:active-id="handleActiveIdUpdate"
          @select="handleSelect"
        />
      </div>

      <div
        class="content-scroll-container"
        :class="{ 'is-document-scroll': documentScrollMode }"
        :data-scroll-mode="documentScrollMode ? 'document' : 'container'"
        data-testid="content-scroll-container"
        ref="scrollContainerRef"
      >
        <template v-if="bubbleMode && hasBubbleSupport">
          <component :is="resolvedBubbleProvider" :box-renderer-matches="bubbleBoxRendererMatches">
            <component
              :is="resolvedBubbleList"
              class="bubble-content-list"
              :messages="bubbleMessages"
              :role-configs="bubbleRoleConfigs"
            />
          </component>
        </template>

        <template v-else>
          <article
            v-for="(turn, index) in renderedTurns"
            :key="turn.id"
            class="content-section"
            :data-content-nav-id="turn.id"
          >
            <p class="section-kicker">Section {{ index + 1 }}</p>
            <h3 class="section-title">{{ turn.label }}</h3>
            <p class="section-question">{{ turn.user }}</p>
            <p class="section-answer">{{ turn.assistant }}</p>
            <p class="section-body">{{ fillerText }}</p>
            <p class="section-body">{{ fillerText }}</p>
            <p class="section-body">{{ fillerText }}</p>
          </article>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, nextTick, ref, watch, type Component } from 'vue'
import type { BubbleBoxRendererMatch, BubbleMessage, BubbleRoleConfig, ContentNavItem } from '@opentiny/tiny-robot'
import * as TinyRobot from '@opentiny/tiny-robot'

type DemoTurn = {
  id: string
  label: string
  user: string
  assistant: string
}

const FallbackContentNav = defineComponent({
  name: 'TrContentNavFallback',
  template:
    '<div class="content-nav-fallback" data-testid="content-nav-fallback">TrContentNav is not exported yet.</div>',
})

const allTurns: DemoTurn[] = [
  {
    id: 'turn-1',
    label: 'Project kickoff summary',
    user: 'Give me a short summary of the project kickoff decisions from this week.',
    assistant:
      'The kickoff summary includes milestones, owner mapping, release constraints, and the first cross-team dependency review.',
  },
  {
    id: 'turn-2',
    label: 'Incident timeline planning',
    user: 'Build an incident timeline from the logs and mark all critical transitions.',
    assistant:
      'The timeline highlights ingestion delay, retry storms, alert escalation, and the final mitigation window for the incident.',
  },
  {
    id: 'turn-3',
    label: 'Checklist',
    user: 'Prepare a data export checklist for legal review and governance sign-off.',
    assistant:
      'The checklist covers retention windows, privacy fields, export audit metadata, and the legal handoff package.',
  },
  {
    id: 'turn-4',
    label: 'Security review items',
    user: 'List every security review action we must close before internal launch.',
    assistant:
      'The list includes permission boundaries, signing policy gaps, dependency verification, and threat model follow-up items.',
  },
  {
    id: 'turn-5',
    label: 'Release train dependencies',
    user: 'Show release train dependencies across frontend, platform, and integration teams.',
    assistant:
      'Dependencies include SDK freeze, deployment slots, feature-flag readiness, release approvals, and downstream integration checks.',
  },
  {
    id: 'turn-6',
    label: 'Postmortem draft notes with extended follow-up context',
    user: 'Draft postmortem notes with timeline, root cause, impact, and follow-up actions.',
    assistant:
      'The draft captures incident scope, root cause, remediation status, open risks, and owner assignments for every follow-up.',
  },
]

const fillerText =
  'This supporting paragraph keeps each section tall enough for realistic scroll spy behavior and makes the demo closer to a long-form reading surface.'

const bubbleMode = ref(false)
const singleTurnMode = ref(false)
const documentScrollMode = ref(false)
const specialIdMode = ref(false)
const emptyArrayMatcherMode = ref(false)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const activeId = ref('')
const expanded = ref(false)
const searchQuery = ref('')
const placement = ref<'left' | 'right'>('right')
const lastEvent = ref('none')
const scrollContainerRef = ref<HTMLElement | null>(null)

const bubbleRoleConfigs = {
  assistant: { placement: 'start' },
  user: { placement: 'end' },
} satisfies Record<string, BubbleRoleConfig>

const turns = computed(() => (singleTurnMode.value ? allTurns.slice(0, 1) : allTurns))
const renderedTurns = computed(() =>
  turns.value.map((turn, index) => ({
    ...turn,
    id: specialIdMode.value ? `${turn.id}["${index + 1}"]` : turn.id,
  })),
)
const resolvedScrollContainer = computed(() => (documentScrollMode.value ? null : scrollContainerRef.value))

function emptyArrayMatcher(item: ContentNavItem, rawQuery: string) {
  const keyword = rawQuery.trim().toLowerCase()
  if (!keyword) {
    return [{ text: item.label, highlighted: false }]
  }

  const source = `${item.label} ${item.searchText ?? ''}`.toLowerCase()
  if (source.includes(keyword)) {
    return [{ text: item.label, highlighted: false }]
  }

  return []
}

const searchOptions = computed(() => ({
  clearOnCollapse: false,
  placeholder: 'Search',
  ...(emptyArrayMatcherMode.value ? { matcher: emptyArrayMatcher } : {}),
}))

const items = computed<ContentNavItem[]>(() =>
  renderedTurns.value.map((turn) => ({
    id: turn.id,
    label: turn.label,
    searchText: `${turn.label} ${turn.user} ${turn.assistant}`,
    tooltipText: turn.label,
  })),
)
const bubbleMessages = computed<BubbleMessage[]>(() =>
  renderedTurns.value.flatMap((turn) => [
    {
      id: turn.id,
      role: 'user',
      content: turn.user,
    },
    {
      id: `${turn.id}-assistant`,
      role: 'assistant',
      content: turn.assistant,
    },
  ]),
)

const hasContentNav = computed(() => Boolean((TinyRobot as Record<string, unknown>).TrContentNav))
const hasBubbleSupport = computed(() => {
  const runtime = TinyRobot as Record<string, unknown>
  const bubbleRenderers = runtime.BubbleRenderers as { Box?: Component } | undefined

  return Boolean(runtime.TrBubbleList && runtime.TrBubbleProvider && bubbleRenderers?.Box)
})
const resolvedContentNav = computed<Component>(() => {
  const maybeComponent = (TinyRobot as Record<string, unknown>).TrContentNav as Component | undefined
  return maybeComponent ?? FallbackContentNav
})
const resolvedBubbleList = computed<Component | string>(() => {
  const maybeComponent = (TinyRobot as Record<string, unknown>).TrBubbleList as Component | undefined
  return maybeComponent ?? 'div'
})
const resolvedBubbleProvider = computed<Component | string>(() => {
  const maybeComponent = (TinyRobot as Record<string, unknown>).TrBubbleProvider as Component | undefined
  return maybeComponent ?? 'div'
})
const bubbleBoxRendererMatches = computed<BubbleBoxRendererMatch[]>(() => {
  const bubbleRenderers = (TinyRobot as Record<string, unknown>).BubbleRenderers as { Box?: Component } | undefined
  const BoxRenderer = bubbleRenderers?.Box
  if (!BoxRenderer) {
    return []
  }

  return [
    {
      find: (messages) => messages[0]?.role === 'user',
      renderer: BoxRenderer,
      priority: 999,
      attributes: (messages, _content, contentIndex) => {
        if (contentIndex !== undefined && contentIndex > 0) {
          return undefined
        }

        const firstMessage = messages[0]
        if (!firstMessage?.id) {
          return undefined
        }

        return {
          'data-content-nav-id': firstMessage.id,
        }
      },
    },
  ]
})

function resolvePayloadId(payload: unknown) {
  if (typeof payload === 'string') {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const id = (payload as { id?: unknown }).id
    if (typeof id === 'string') {
      return id
    }
  }

  return undefined
}

function handleSelect(payload: unknown) {
  const turnId = resolvePayloadId(payload)
  lastEvent.value = turnId ? `select:${turnId}` : 'select:unknown'
}

function handleActiveIdUpdate(value: string | undefined) {
  activeId.value = value ?? ''
}

function resetState() {
  bubbleMode.value = false
  singleTurnMode.value = false
  documentScrollMode.value = false
  specialIdMode.value = false
  emptyArrayMatcherMode.value = false
  searchQuery.value = ''
  expanded.value = false
  expandTrigger.value = 'hover'
  placement.value = 'right'
  lastEvent.value = 'none'

  nextTick(() => {
    activeId.value = items.value[0]?.id ?? ''
    window.scrollTo({ top: 0, behavior: 'auto' })
    const container = scrollContainerRef.value
    if (container) {
      container.scrollTop = 0
    }
  })
}

watch(
  items,
  (nextItems) => {
    if (!nextItems.length) {
      activeId.value = ''
      return
    }

    if (!nextItems.some((item) => item.id === activeId.value)) {
      activeId.value = nextItems[0].id
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.content-nav-demo {
  display: grid;
  gap: 14px;
}

.availability {
  margin: 0;
}

.controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.control-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.placement-switch {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin: 0;
  padding: 0;
  border: 0;
}

.placement-switch legend {
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: #445164;
}

.reset-btn {
  padding: 6px 10px;
}

.state-board {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: 8px 12px;
  font-size: 12px;
}

.state-board code {
  font-family: Consolas, 'Courier New', monospace;
}

.workspace {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  align-items: start;
  min-height: 560px;
}

.workspace.is-document-scroll {
  min-height: unset;
}

.content-nav-host {
  box-sizing: border-box;
  position: relative;
  height: 560px;
  border: 1px dashed #ccd6e0;
  border-radius: 8px;
  padding: 8px;
}

.workspace.is-document-scroll .content-nav-host {
  position: sticky;
  top: 16px;
  height: calc(100vh - 32px);
}

.content-nav-fallback {
  border: 1px solid #ffd7d7;
  background: #fff5f5;
  color: #a54a4a;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
}

.content-scroll-container {
  box-sizing: border-box;
  height: 560px;
  overflow: auto;
  border: 1px solid #dce3ea;
  border-radius: 10px;
  background: linear-gradient(180deg, #fafcff 0%, #f4f8fc 100%);
  padding: 20px 22px 28px;
}

.content-scroll-container.is-document-scroll {
  height: auto;
  min-height: calc(100vh + 360px);
  overflow: visible;
}

.content-section {
  scroll-margin-top: 20px;
  padding: 22px 22px 24px;
  border: 1px solid #dfe7f2;
  border-radius: 14px;
  background: #fff;
}

.content-section + .content-section {
  margin-top: 18px;
}

.bubble-content-list {
  --tr-bubble-list-gap: 16px;
  --tr-bubble-list-padding: 20px 24px 28px;
  --tr-bubble-max-width: 420px;
}

:deep(.bubble-content-list .tr-bubble__box[data-role='user']) {
  scroll-margin-top: 20px;
}

.section-kicker {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6a7b90;
}

.section-title {
  margin: 0 0 12px;
  font-size: 20px;
  line-height: 1.3;
  color: #1f2a38;
}

.section-question,
.section-answer,
.section-body {
  margin: 0;
  line-height: 1.65;
  color: #465365;
}

.section-question {
  font-weight: 600;
  color: #263445;
}

.section-answer,
.section-body {
  margin-top: 12px;
}

@media (max-width: 1000px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
