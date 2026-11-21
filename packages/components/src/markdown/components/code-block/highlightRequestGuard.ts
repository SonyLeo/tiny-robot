export const createHighlightRequestGuard = () => {
  let currentRevision = 0

  return {
    begin: () => ++currentRevision,
    invalidate: () => {
      currentRevision += 1
    },
    isCurrent: (revision: number) => revision === currentRevision,
  }
}
