import type { UseMessageOptions, UseMessageReturn } from './types'
import { createVueMessageRuntime } from './runtime'

export const useMessage = (options: UseMessageOptions): UseMessageReturn => createVueMessageRuntime(options).api
