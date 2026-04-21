import type { UseChatAttachmentsReturn } from '@/components/attachments/useChatAttachments'
import type { UseChatKitReturn } from '@/types'

export interface LegacyPhase1ABridgeHints {
  chatKit?: UseChatKitReturn
  attachmentsManager?: UseChatAttachmentsReturn
}

interface RuntimeWithLegacyHints {
  __legacyPhase1ABridge?: LegacyPhase1ABridgeHints
}

export function getLegacyPhase1ABridgeHints(runtime: unknown): LegacyPhase1ABridgeHints | undefined {
  return (runtime as RuntimeWithLegacyHints | null | undefined)?.__legacyPhase1ABridge
}

export function attachLegacyPhase1ABridgeHints<T extends object>(runtime: T, hints: LegacyPhase1ABridgeHints): T {
  Object.defineProperty(runtime, '__legacyPhase1ABridge', {
    value: hints,
    writable: true,
    configurable: true,
    enumerable: false,
  })

  return runtime
}
