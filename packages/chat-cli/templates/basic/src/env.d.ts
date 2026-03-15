/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 前端请求的聊天代理地址 */
  readonly VITE_CHAT_API_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
