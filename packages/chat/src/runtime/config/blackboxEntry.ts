import type { ChatScaffoldCallbacks, TrChatConfig, TrChatProps } from '@/types'

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

export function hasUnsupportedBlackboxCallbacks(callbacks?: ChatScaffoldCallbacks): boolean {
  return Boolean(callbacks?.onBeforeSend || callbacks?.onMessageAction || callbacks?.onModelChange)
}

function chainHandlers<T>(primary?: ((payload: T) => void) | null, compatibility?: ((payload: T) => void) | null) {
  if (!primary) {
    return compatibility ?? undefined
  }

  if (!compatibility) {
    return primary
  }

  return (payload: T) => {
    primary(payload)
    compatibility(payload)
  }
}

function normalizeCompatibilityError(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String((error as { message?: unknown }).message ?? 'Unknown chat error'))
  }

  return new Error(String(error))
}

export function mergeLifecycleCompatibleCallbacks(
  config: TrChatConfig,
  callbacks?: Pick<ChatScaffoldCallbacks, 'onFinish' | 'onError'>,
): TrChatConfig {
  if (!callbacks?.onFinish && !callbacks?.onError) {
    return config
  }

  return {
    ...config,
    lifecycle: {
      ...config.lifecycle,
      afterReceive: chainHandlers(config.lifecycle?.afterReceive, callbacks.onFinish),
      error: chainHandlers(
        config.lifecycle?.error,
        callbacks.onError ? (error) => callbacks.onError?.(normalizeCompatibilityError(error)) : undefined,
      ),
    },
  }
}

export function resolveRootPageBlackboxConfig(
  props: Pick<TrChatProps, 'config' | 'runtime' | 'callbacks' | 'presetOverrides'>,
): TrChatConfig | null {
  const resolvedConfig = parseSerializedConfig(props.config)

  if (
    !isTargetTrChatConfig(resolvedConfig) ||
    props.runtime ||
    props.presetOverrides ||
    hasUnsupportedBlackboxCallbacks(props.callbacks)
  ) {
    return null
  }

  return mergeLifecycleCompatibleCallbacks(resolvedConfig, props.callbacks)
}
