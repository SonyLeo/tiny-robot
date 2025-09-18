import type { DemoCategory } from '../types/demo'

// API 基础路径
const API_BASE = '/api/demos'

// 获取所有 demo 分类
export async function fetchDemoCategories(): Promise<DemoCategory[]> {
  try {
    const response = await fetch(`${API_BASE}/categories`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch demo categories from API, using fallback data:', error)
    return []
  }
}

// 获取特定 demo 文件内容
export async function fetchDemoFile(path: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.text()
  } catch (error) {
    console.error('Failed to fetch demo file:', error)
    throw error
  }
}
