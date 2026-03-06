import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), dts({ include: ['src'], insertTypesEntry: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@opentiny/tiny-robot', '@opentiny/tiny-robot-kit'],
      output: { preserveModules: false },
    },
    cssCodeSplit: false, // 所有 CSS 合并到 dist/style.css
  },
})
