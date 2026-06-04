import type { LayoutAsideProps, LayoutFloatingConfig, LayoutProps } from '../../src/layout'

function expectLayoutProps(value: LayoutProps): LayoutProps {
  return value
}

function expectLayoutAsideProps(value: LayoutAsideProps): LayoutAsideProps {
  return value
}

const controlledFloating: LayoutFloatingConfig = {
  x: 64,
  y: 80,
  width: 420,
}

const validLayoutControlled = expectLayoutProps({
  mode: 'floating',
  floating: controlledFloating,
})

const validLayoutUncontrolled = expectLayoutProps({
  defaultMode: 'floating',
  defaultFloating: controlledFloating,
})

// @ts-expect-error `mode` and `defaultMode` are mutually exclusive
const invalidLayoutMode = expectLayoutProps({
  mode: 'floating',
  defaultMode: 'normal' as const,
})

// @ts-expect-error `floating` and `defaultFloating` are mutually exclusive
const invalidLayoutFloating = expectLayoutProps({
  floating: controlledFloating,
  defaultFloating: controlledFloating,
})

const validAsideControlled = expectLayoutAsideProps({
  placement: 'left',
  open: true,
  width: 280,
})

const validAsideUncontrolled = expectLayoutAsideProps({
  placement: 'left',
  defaultOpen: true,
  defaultWidth: 280,
})

// @ts-expect-error `open` and `defaultOpen` are mutually exclusive
const invalidAsideOpen = expectLayoutAsideProps({
  placement: 'left',
  open: true,
  defaultOpen: false,
})

// @ts-expect-error `width` and `defaultWidth` are mutually exclusive
const invalidAsideWidth = expectLayoutAsideProps({
  placement: 'left',
  width: 280,
  defaultWidth: 260,
})

void [
  validLayoutControlled,
  validLayoutUncontrolled,
  validAsideControlled,
  validAsideUncontrolled,
  invalidLayoutMode,
  invalidLayoutFloating,
  invalidAsideOpen,
  invalidAsideWidth,
]
