export const handleCodeBlockKeydown = (event: KeyboardEvent) => {
  if (
    event.defaultPrevented ||
    event.currentTarget !== event.target ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
  ) {
    return
  }

  const element = event.currentTarget
  if (!(element instanceof HTMLElement) || element.scrollWidth <= element.clientWidth) {
    return
  }

  const distance = Math.max(40, Math.round(element.clientWidth * 0.1))
  const direction = event.key === 'ArrowRight' ? 1 : -1
  const previousScrollLeft = element.scrollLeft
  element.scrollLeft += direction * distance

  if (element.scrollLeft === previousScrollLeft) {
    return
  }

  event.preventDefault()
}
