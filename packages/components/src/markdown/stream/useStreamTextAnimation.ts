import { computed, readonly, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { useRafFn } from '@vueuse/core'
import type { TrMarkdownStreamingPreset } from '../index.type'
import { splitTextGraphemes } from './grapheme'
import { computeStreamCharDelay, getStreamAnimationPresetConfig } from './streamAnimationPreset'
import { useStreamTokenScheduler } from './useStreamTokenScheduler'
import type { TrMarkdownStreamProfiler } from './streamProfiler'
import type { TrMarkdownStreamTextAnimationController } from './streamingAnimation.type'

export interface TrMarkdownStreamTextAnimationOptions {
  active: boolean
  queueLength?: number
  preset?: TrMarkdownStreamingPreset
  revision?: number
  profiler?: TrMarkdownStreamProfiler
  blockKey?: string
  onSettled?: () => void
}

const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export const useStreamTextAnimation = (
  text: MaybeRefOrGetter<string>,
  options: MaybeRefOrGetter<TrMarkdownStreamTextAnimationOptions>,
): TrMarkdownStreamTextAnimationController & {
  charDelay: Readonly<Ref<number>>
  status: Readonly<Ref<'idle' | 'animating' | 'settled'>>
} => {
  const births = shallowRef<number[]>([])
  const nowMs = shallowRef(getNow())
  const revision = shallowRef(0)
  const charDelay = shallowRef(getStreamAnimationPresetConfig('balanced').baseDelay)
  const frozenCharDelay = shallowRef(getStreamAnimationPresetConfig('balanced').baseDelay)
  const status = shallowRef<'idle' | 'animating' | 'settled'>('idle')
  const settledToken = shallowRef(0)
  const activeToken = shallowRef(0)
  let previousText = ''
  let previousRevision = 0
  let previousActive = false
  let previousScheduleSignature = ''
  const tokenScheduler = useStreamTokenScheduler()

  const currentOptions = computed(() => toValue(options))
  const currentPreset = computed(() => getStreamAnimationPresetConfig(currentOptions.value.preset || 'balanced'))
  const fadeDuration = computed(() => currentPreset.value.fadeDuration)
  const isTimelineExhausted = computed(() => {
    const lastBirth = births.value.at(-1)

    if (typeof lastBirth !== 'number') {
      return true
    }

    return nowMs.value >= lastBirth + fadeDuration.value
  })

  const finishAnimation = () => {
    if (status.value !== 'animating') {
      return
    }

    status.value = 'settled'
    pause()

    if (settledToken.value === activeToken.value) {
      return
    }

    settledToken.value = activeToken.value
    currentOptions.value.onSettled?.()
  }

  const { pause, resume } = useRafFn(
    ({ timestamp }) => {
      nowMs.value = timestamp

      const lastBirth = births.value.at(-1)
      if (typeof lastBirth !== 'number') {
        finishAnimation()
        return
      }

      if (timestamp >= lastBirth + fadeDuration.value) {
        finishAnimation()
      }
    },
    {
      immediate: false,
    },
  )

  watch(
    [() => toValue(text), currentOptions],
    ([nextText, nextOptions]) => {
      const scheduleStart = getNow()
      const now = getNow()
      nowMs.value = now

      const graphemes = splitTextGraphemes(nextText)
      const nextCount = graphemes.length
      const nextPreset = getStreamAnimationPresetConfig(nextOptions.preset || 'balanced')
      const nextCharDelay = computeStreamCharDelay(nextOptions.queueLength || 0, nextCount, nextPreset)
      const nextRevision = nextOptions.revision || 0

      if (!nextOptions.active) {
        births.value = []
        status.value = nextCount > 0 ? 'settled' : 'idle'
        charDelay.value = nextCharDelay
        frozenCharDelay.value = nextCharDelay
        previousText = nextText
        previousRevision = nextRevision
        previousActive = false
        pause()
        return
      }

      const shouldRefreshCharDelay = !previousActive || nextRevision !== previousRevision

      if (shouldRefreshCharDelay) {
        frozenCharDelay.value = nextCharDelay
      }

      charDelay.value = frozenCharDelay.value
      const schedule = tokenScheduler.schedule({
        charDelay: charDelay.value,
        currentBirths: births.value,
        maxLeadMs: nextPreset.fadeDuration,
        nextRevision,
        nextText,
        nowMs: now,
        previousActive,
        previousRevision,
        previousText,
      })
      births.value = schedule.births
      if (schedule.revisionChanged) {
        revision.value += 1
      }

      const scheduleSignature = [
        schedule.action,
        schedule.births.length,
        schedule.insertedCount,
        schedule.deletedCount,
        schedule.preservedCount,
        schedule.replacedCount,
        nextOptions.blockKey || '',
      ].join(':')

      if (scheduleSignature !== previousScheduleSignature) {
        nextOptions.profiler?.recordTokenSchedule({
          action: schedule.action,
          blockKey: nextOptions.blockKey,
          deletedCount: schedule.deletedCount,
          durationMs: getNow() - scheduleStart,
          insertedCount: schedule.insertedCount,
          preservedCount: schedule.preservedCount,
          replacedCount: schedule.replacedCount,
          segmentCount: schedule.segments.length,
        })
        previousScheduleSignature = scheduleSignature
      }

      if (nextCount === 0) {
        status.value = 'idle'
        pause()
      } else {
        const lastBirth = births.value.at(-1)

        if (typeof lastBirth === 'number' && now < lastBirth + nextPreset.fadeDuration) {
          activeToken.value += 1
          status.value = 'animating'
          resume()
        } else {
          status.value = 'settled'
          pause()
        }
      }

      previousText = nextText
      previousRevision = nextRevision
      previousActive = true
    },
    {
      immediate: true,
    },
  )

  watch(
    [isTimelineExhausted, status],
    ([exhausted, nextStatus]) => {
      if (exhausted && nextStatus === 'animating') {
        finishAnimation()
      }
    },
    {
      immediate: true,
    },
  )

  return {
    blockKey: currentOptions.value.blockKey,
    nowMs: readonly(nowMs),
    fadeDuration: readonly(fadeDuration),
    profiler: currentOptions.value.profiler,
    revision: readonly(revision),
    charDelay: readonly(charDelay),
    exhausted: readonly(isTimelineExhausted),
    status: readonly(status),
    getBirthAt(index: number) {
      return births.value[index]
    },
  }
}
