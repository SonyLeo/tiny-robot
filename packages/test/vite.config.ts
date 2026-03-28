import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { createMockChatApiPlugin } from './src/chat/mockChatApiPlugin'

export default defineConfig({
  plugins: [vue(), createMockChatApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../chat/src', import.meta.url)),
    },
  },
  server: {
    port: 3333,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
})
