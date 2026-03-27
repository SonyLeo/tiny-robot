import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '@demo': fileURLToPath(new URL('./src', import.meta.url)),
      // 直接指向 chat 源码，跳过 dist，改动即时生效
      '@opentiny/tiny-robot-chat': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5185,
    open: true,
    proxy: {
      '/api/mcp/learn': {
        target: 'https://learn.microsoft.com',
        changeOrigin: true,
        rewrite: () => '/api/mcp',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
