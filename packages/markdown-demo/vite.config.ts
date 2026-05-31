import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@opentiny/tiny-robot',
        replacement: resolve(__dirname, '../components/src/index.ts'),
      },
      {
        find: '@opentiny/tiny-robot-svgs',
        replacement: resolve(__dirname, '../svgs/src/index.ts'),
      },
    ],
  },
  optimizeDeps: {
    exclude: ['@opentiny/tiny-robot', '@opentiny/tiny-robot-svgs'],
  },
  server: {
    port: 3399,
    host: true,
  },
})
