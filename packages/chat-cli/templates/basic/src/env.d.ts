/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_API_PROVIDER: 'openai' | 'deepseek' | 'custom'
  /** 自定义模型名称（可选）。OpenAI 默认 gpt-4o-mini；DeepSeek 默认 deepseek-chat */
  readonly VITE_MODEL?: string
  /** 自定义 API 端点（可选）。用于 OpenAI 兼容 API 或代理服务 */
  readonly VITE_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
