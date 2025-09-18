import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  define: {
    __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
  },
  optimizeDeps: {
    exclude: ['@vue/repl'],
  },
  worker: {
    format: 'es',
  },
})
