import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const demoPort = Number(process.env.TINY_ROBOT_MARKDOWN_DEMO_PORT || 3399)

const manualChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/')

  if (normalizedId.includes('/node_modules/mermaid/')) {
    return 'vendor-mermaid'
  }

  if (normalizedId.includes('/node_modules/katex/')) {
    return 'vendor-katex'
  }

  if (normalizedId.includes('/node_modules/shiki/') || normalizedId.includes('/node_modules/@shikijs/')) {
    return 'vendor-shiki'
  }

  if (normalizedId.includes('/node_modules/markdown-it')) {
    return 'vendor-markdown-it'
  }

  if (normalizedId.includes('/node_modules/dompurify/')) {
    return 'vendor-dompurify'
  }

  return undefined
}

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
    port: demoPort,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
