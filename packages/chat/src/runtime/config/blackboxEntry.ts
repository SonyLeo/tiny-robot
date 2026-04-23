import type { TrChatConfig } from '@/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseSerializedConfig(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function isTargetTrChatConfig(value: unknown): value is TrChatConfig {
  const parsedValue = parseSerializedConfig(value)

  if (!isRecord(parsedValue) || !isRecord(parsedValue.request)) {
    return false
  }

  return Array.isArray(parsedValue.request.models) && isRecord(parsedValue.request.transport)
}

export function resolveRootPageBlackboxConfig(config: unknown): TrChatConfig | null {
  const resolvedConfig = parseSerializedConfig(config)
  if (!isTargetTrChatConfig(resolvedConfig)) {
    return null
  }

  return resolvedConfig
}
