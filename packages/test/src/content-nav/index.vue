<template>
  <div class="content-nav-demo">
    <h2 data-testid="content-nav-page-title">ContentNav component test</h2>
    <p class="availability">
      Component export status:
      <strong data-testid="content-nav-availability">{{ hasContentNav ? 'ready' : 'missing' }}</strong>
    </p>

    <div class="controls">
      <label class="control-item">
        <input data-testid="toggle-single-turn-mode" type="checkbox" v-model="singleTurnMode" />
        Use single turn
      </label>

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
        External query:
        <input
          data-testid="external-query-input"
          type="search"
          placeholder="Type to sync query model"
          v-model="query"
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
        Query: <code data-testid="query-display">{{ query }}</code>
      </div>
      <div>
        Placement: <code data-testid="placement-display">{{ placement }}</code>
      </div>
      <div>
        Last event: <code data-testid="last-event-display">{{ lastEvent }}</code>
      </div>
    </div>

    <div class="workspace">
      <div class="content-nav-host" data-testid="content-nav-host">
        <component
          :is="resolvedContentNav"
          data-testid="content-nav-root"
          :items="items"
          :registry="registry"
          :active-id="activeId"
          v-model:expanded="expanded"
          v-model:query="query"
          :placement="placement"
          :search="searchConfig"
          aria-label="Conversation turns navigation"
          @update:active-id="handleActiveIdUpdate"
          @select="handleSelect"
          @activate="handleActivate"
        />
      </div>

      <div class="bubble-scroll-container" data-testid="bubble-scroll-container" ref="scrollContainerRef">
        <section
          v-for="turn in turns"
          :key="turn.id"
          :ref="(el) => setTurnAnchor(turn.id, el as HTMLElement | null)"
          :data-anchor-id="turn.id"
          :data-testid="`turn-anchor-${turn.id}`"
          class="turn-section"
        >
          <h3>{{ turn.label }}</h3>
          <TrBubble role="user" :content="turn.user" />
          <TrBubble role="assistant" :content="turn.assistant" />
          <p>{{ fillerText }}</p>
          <p>{{ fillerText }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, nextTick, ref, watch, type Component } from 'vue'
import { TrBubble, provideContentNavScrollContainer, useContentNavRegistry } from '@opentiny/tiny-robot'
import * as TinyRobot from '@opentiny/tiny-robot'

type ContentNavItem = {
  id: string
  label: string
  searchText: string
}

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
    assistant: 'The kickoff summary includes milestones, owner mapping, and release constraints.',
  },
  {
    id: 'turn-2',
    label: 'Incident timeline planning',
    user: 'Build an incident timeline from the logs and mark all critical transitions.',
    assistant: 'The timeline highlights ingestion delay, retry storms, and final mitigation windows.',
  },
  {
    id: 'turn-3',
    label: 'Data export checklist',
    user: 'Prepare a data export checklist for legal review and governance sign-off.',
    assistant: 'The checklist covers retention windows, privacy fields, and export audit metadata.',
  },
  {
    id: 'turn-4',
    label: 'Security review items',
    user: 'List every security review action we must close before internal launch.',
    assistant: 'The list includes permission boundaries, signing policy, and threat model gaps.',
  },
  {
    id: 'turn-5',
    label: 'Release train dependencies',
    user: 'Show release train dependencies across frontend, platform, and integration teams.',
    assistant: 'Dependencies include SDK freeze, deployment slots, and feature-flag readiness.',
  },
  {
    id: 'turn-6',
    label: 'Postmortem draft notes',
    user: 'Draft postmortem notes with timeline, root cause, impact, and follow-up actions.',
    assistant: 'The draft captures incident scope, root cause, remediation, and owner assignments.',
  },
]

const fillerText =
  'This section intentionally contains additional long text so the scroll area stays realistic for content-nav interactions and active-item updates.'

const singleTurnMode = ref(false)
const activeId = ref('')
const expanded = ref(false)
const query = ref('')
const placement = ref<'left' | 'right'>('right')
const lastEvent = ref('none')
const searchConfig = {
  clearOnCollapse: false,
  placeholder: 'Search',
} as const
const scrollContainerRef = ref<HTMLElement | null>(null)
const registry = useContentNavRegistry()

provideContentNavScrollContainer(scrollContainerRef)

const turns = computed(() => (singleTurnMode.value ? allTurns.slice(0, 1) : allTurns))
const items = computed<ContentNavItem[]>(() =>
  turns.value.map((turn) => ({
    id: turn.id,
    label: turn.label,
    searchText: `${turn.label} ${turn.user} ${turn.assistant}`,
  })),
)

const hasContentNav = computed(() => Boolean((TinyRobot as Record<string, unknown>).TrContentNav))
const resolvedContentNav = computed<Component>(() => {
  const maybeComponent = (TinyRobot as Record<string, unknown>).TrContentNav as Component | undefined
  return maybeComponent ?? FallbackContentNav
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

function setTurnAnchor(turnId: string, el: HTMLElement | null) {
  registry.register(turnId, el)
}

function handleSelect(payload: unknown) {
  const turnId = resolvePayloadId(payload)
  if (!turnId) {
    lastEvent.value = 'select:unknown'
    return
  }

  lastEvent.value = `select:${turnId}`
}

function handleActiveIdUpdate(value: string | undefined) {
  activeId.value = value ?? ''
}

function handleActivate(payload: unknown) {
  const turnId = resolvePayloadId(payload)
  if (!turnId) {
    lastEvent.value = 'activate:unknown'
    return
  }

  lastEvent.value = `activate:${turnId}`
}

function resetState() {
  singleTurnMode.value = false
  query.value = ''
  expanded.value = false
  placement.value = 'right'
  lastEvent.value = 'none'
  nextTick(() => {
    activeId.value = items.value[0]?.id ?? ''
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
  min-height: 560px;
}

.content-nav-host {
  position: relative;
  border: 1px dashed #ccd6e0;
  border-radius: 8px;
  padding: 8px;
  min-height: 560px;
}

.content-nav-fallback {
  border: 1px solid #ffd7d7;
  background: #fff5f5;
  color: #a54a4a;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
}

.bubble-scroll-container {
  height: 560px;
  overflow: auto;
  border: 1px solid #dce3ea;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fafcff;
}

.turn-section {
  display: grid;
  gap: 10px;
  padding: 16px 0;
  border-bottom: 1px solid #e9eef4;
  scroll-margin-top: 20px;
}

.turn-section:last-child {
  border-bottom: 0;
}

.turn-section h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #26303d;
}

.turn-section p {
  margin: 0;
  color: #516074;
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 1000px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
