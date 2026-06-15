import type { LayoutAsideResizeEventDetail, LayoutEmits } from '../index.type'

type EmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

export function emitAsideResizeEvent(
  emit: EmitFn,
  phase: 'start' | 'progress' | 'end',
  detail: LayoutAsideResizeEventDetail,
): void {
  if (phase === 'start') {
    emit('aside-resize-start', detail)

    if (detail.placement === 'left') {
      emit('left-aside-resize-start', { expandedWidth: detail.expandedWidth })
      return
    }

    emit('right-aside-resize-start', { expandedWidth: detail.expandedWidth })
    return
  }

  if (phase === 'end') {
    emit('aside-resize-end', detail)

    if (detail.placement === 'left') {
      emit('left-aside-resize-end', { expandedWidth: detail.expandedWidth })
      return
    }

    emit('right-aside-resize-end', { expandedWidth: detail.expandedWidth })
    return
  }

  emit('aside-resize', detail)

  if (detail.placement === 'left') {
    emit('left-aside-resize', { expandedWidth: detail.expandedWidth })
    return
  }

  emit('right-aside-resize', { expandedWidth: detail.expandedWidth })
}
