// 响应式断点工具

export interface BreakpointState {
  current: BreakpointName
  isSmAndUp: boolean
  isMdAndUp: boolean
  isLgAndUp: boolean
  isXlAndUp: boolean
  is2xlAndUp: boolean
}

export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export const DEFAULT_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export const createBreakpointState = (width: number, breakpoints: typeof DEFAULT_BREAKPOINTS): BreakpointState => {
  const current: BreakpointName =
    width >= breakpoints['2xl']
      ? '2xl'
      : width >= breakpoints.xl
        ? 'xl'
        : width >= breakpoints.lg
          ? 'lg'
          : width >= breakpoints.md
            ? 'md'
            : 'sm'

  return {
    current,
    isSmAndUp: width >= breakpoints.sm,
    isMdAndUp: width >= breakpoints.md,
    isLgAndUp: width >= breakpoints.lg,
    isXlAndUp: width >= breakpoints.xl,
    is2xlAndUp: width >= breakpoints['2xl'],
  }
}

export const generateResponsiveClasses = (baseClass: string, state: BreakpointState): string[] => {
  const classes = [baseClass]

  if (state.isSmAndUp) classes.push(`${baseClass}--sm`)
  if (state.isMdAndUp) classes.push(`${baseClass}--md`)
  if (state.isLgAndUp) classes.push(`${baseClass}--lg`)
  if (state.isXlAndUp) classes.push(`${baseClass}--xl`)
  if (state.is2xlAndUp) classes.push(`${baseClass}--2xl`)

  return classes
}
