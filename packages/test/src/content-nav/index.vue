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
          :source="resolvedContentNavSource"
          :scroll-container="scrollContainerRef"
          :active-id="activeId"
          v-model:expanded="expanded"
          v-model:query="query"
          :expand-trigger="expandTrigger"
          :placement="placement"
          :search="searchConfig"
          @update:active-id="handleActiveIdUpdate"
          @select="handleSelect"
          @activate="handleActivate"
        />
      </div>

      <div class="bubble-scroll-container" data-testid="bubble-scroll-container" ref="scrollContainerRef">
        <TrBubbleList
          ref="bubbleListRef"
          class="conversation-list"
          :messages="messages"
          :role-configs="roleConfigs"
          :content-nav="contentNavOptions"
        >
          <template #content-footer>
            <p class="turn-filler">{{ fillerText }}</p>
          </template>
        </TrBubbleList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, nextTick, ref, unref, watch, type Component } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'
import type {
  BubbleListContentNavOptions,
  BubbleListProps,
  ContentNavItem,
  ContentNavSource,
} from '@opentiny/tiny-robot'
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
    label: 'Data export checklist',
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
    label: 'Postmortem draft notes',
    user: 'Draft postmortem notes with timeline, root cause, impact, and follow-up actions.',
    assistant:
      'The draft captures incident scope, root cause, remediation status, open risks, and owner assignments for every follow-up.',
  },
]

const fillerText =
  'This extra line keeps each turn tall enough for realistic scroll spy behavior and makes the BubbleList route closer to the real usage pattern.'

const singleTurnMode = ref(false)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const activeId = ref('')
const expanded = ref(false)
const query = ref('')
const placement = ref<'left' | 'right'>('right')
const lastEvent = ref('none')
const scrollContainerRef = ref<HTMLElement | null>(null)
const bubbleListRef = ref<InstanceType<typeof TrBubbleList> | null>(null)
const jumpFlashClassName = 'demo-user-bubble-flash'
const jumpFeedbackDuration = 700
let jumpFeedbackTimer: ReturnType<typeof setTimeout> | null = null

const searchConfig = {
  clearOnCollapse: false,
  placeholder: 'Search',
} as const

const roleConfigs = {
  assistant: {
    placement: 'start',
  },
  user: {
    placement: 'end',
  },
} satisfies NonNullable<BubbleListProps['roleConfigs']>

const turns = computed(() => (singleTurnMode.value ? allTurns.slice(0, 1) : allTurns))
const messages = computed<BubbleListProps['messages']>(() =>
  turns.value.flatMap((turn) => [
    {
      id: turn.id,
      role: 'user',
      content: turn.user,
    },
    {
      id: `assistant-${turn.id}`,
      role: 'assistant',
      content: turn.assistant,
    },
  ]),
)

const emptyContentNavSource: ContentNavSource = {
  items: computed(() => []),
  resolveTarget: () => null,
  revision: computed(() => 0),
}

const contentNavSource = computed(() => bubbleListRef.value?.getContentNavSource())
const resolvedContentNavSource = computed(() => contentNavSource.value ?? emptyContentNavSource)
const items = computed<ContentNavItem[]>(() => unref(resolvedContentNavSource.value.items))

const turnById = new Map(allTurns.map((turn) => [turn.id, turn]))

const contentNavOptions = {
  itemResolver: ({ group }) => {
    const firstMessage = group.messages[0]
    if (firstMessage?.role !== 'user' || !firstMessage.id) {
      return false
    }

    const turn = turnById.get(firstMessage.id)
    if (!turn) {
      return false
    }

    return {
      id: turn.id,
      label: turn.label,
      searchText: `${turn.label} ${turn.user} ${turn.assistant}`,
      tooltipText: turn.label,
    }
  },
} satisfies BubbleListContentNavOptions

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

function findNavTarget(id: string) {
  const container = scrollContainerRef.value
  if (!container) {
    return null
  }

  return (
    container.querySelector<HTMLElement>(`.tr-bubble[data-content-nav-id="${id}"]`) ??
    (typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? container.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
      : Array.from(container.querySelectorAll<HTMLElement>('[id]')).find((entry) => entry.id === id)) ??
    null
  )
}

function clearJumpFeedback() {
  if (jumpFeedbackTimer) {
    clearTimeout(jumpFeedbackTimer)
    jumpFeedbackTimer = null
  }
}

function applyJumpFeedback(id: string) {
  const target = findNavTarget(id)
  if (!target) {
    return
  }

  clearJumpFeedback()
  target.classList.remove(jumpFlashClassName)
  void target.offsetWidth
  target.classList.add(jumpFlashClassName)

  jumpFeedbackTimer = setTimeout(() => {
    target.classList.remove(jumpFlashClassName)
    jumpFeedbackTimer = null
  }, jumpFeedbackDuration)
}

function handleSelect(payload: unknown) {
  const turnId = resolvePayloadId(payload)
  if (!turnId) {
    lastEvent.value = 'select:unknown'
    return
  }

  lastEvent.value = `select:${turnId}`
  applyJumpFeedback(turnId)
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
  expandTrigger.value = 'hover'
  placement.value = 'right'
  lastEvent.value = 'none'
  clearJumpFeedback()

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
  box-sizing: border-box;
  position: relative;
  height: 560px;
  border: 1px dashed #ccd6e0;
  border-radius: 8px;
  padding: 8px;
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
  box-sizing: border-box;
  height: 560px;
  overflow: auto;
  border: 1px solid #dce3ea;
  border-radius: 10px;
  background: #fafcff;
}

.conversation-list {
  --tr-bubble-list-gap: 16px;
  --tr-bubble-list-padding: 18px 18px 28px;
  --tr-bubble-max-width: 560px;
}

.turn-filler {
  margin: 8px 0 0;
  max-width: 48ch;
  font-size: 12px;
  line-height: 1.55;
  color: #5d6b80;
}

:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  scroll-margin-top: 20px;
}

:deep([data-role='user'] .tr-bubble__box) {
  transition:
    background-color 220ms ease,
    box-shadow 220ms ease;
}

:deep([data-role='user'].demo-user-bubble-flash .tr-bubble__box) {
  --tr-bubble-box-bg: #b9d7ff;
  box-shadow:
    0 0 0 1px rgba(55, 132, 255, 0.2),
    0 12px 28px -18px rgba(55, 132, 255, 0.45),
    var(--tr-bubble-box-shadow);
}

@media (max-width: 1000px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
