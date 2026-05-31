import type { TrMarkdownStreamingPreset } from '../index.type'

export interface TrMarkdownStreamAnimationPresetConfig {
  baseDelay: number
  accelerationFactor: number
  fadeDuration: number
  maxBlockDuration: number
}

export const trMarkdownStreamAnimationPresetMap: Record<
  TrMarkdownStreamingPreset,
  TrMarkdownStreamAnimationPresetConfig
> = {
  balanced: {
    baseDelay: 18,
    accelerationFactor: 0.3,
    fadeDuration: 280,
    maxBlockDuration: 3000,
  },
  realtime: {
    baseDelay: 14,
    accelerationFactor: 0.38,
    fadeDuration: 240,
    maxBlockDuration: 2200,
  },
  silky: {
    baseDelay: 24,
    accelerationFactor: 0.2,
    fadeDuration: 320,
    maxBlockDuration: 3600,
  },
}

export const getStreamAnimationPresetConfig = (preset: TrMarkdownStreamingPreset) => {
  return trMarkdownStreamAnimationPresetMap[preset]
}

export const computeStreamCharDelay = (
  queueLength: number,
  charCount: number,
  preset: TrMarkdownStreamAnimationPresetConfig,
) => {
  const acceleration = 1 + queueLength * preset.accelerationFactor
  const acceleratedDelay = preset.baseDelay / acceleration
  const boundedDelay = Math.min(acceleratedDelay, preset.maxBlockDuration / Math.max(charCount, 1))

  return Math.max(8, boundedDelay)
}

export const resolveStreamSettleHoldMs = (charDelay: number, fadeDuration: number) => {
  return Math.max(120, Math.min(fadeDuration, Math.round(charDelay * 8)))
}
