/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_API_PROVIDER: 'openai' | 'deepseek'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
