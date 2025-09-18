import type { DemoCategory } from '../types/demo'
import { fetchDemoCategories } from './demo-api'

// 加载所有 demo 分类
export async function loadDemoCategories(): Promise<DemoCategory[]> {
  return await fetchDemoCategories()
}

export function getDemoTitle(demoName: string): string {
  return demoName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
