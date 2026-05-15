import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'

const demoDir = resolve(__dirname, 'demo')
const srcDir = resolve(__dirname, 'src')
const plugins = [vue()]
const resolveConfig = {
  alias: {
    '@': srcDir,
  },
}

export default defineConfig(({ mode }) => {
  if (mode !== 'lib') {
    return {
      root: demoDir,
      plugins,
      resolve: resolveConfig,
    }
  }

  return {
    plugins,
    resolve: resolveConfig,
    build: {
      lib: {
        entry: resolve(srcDir, 'index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
        cssFileName: 'style',
      },
      rollupOptions: {
        external: ['vue', '@vueuse/core'],
        output: {
          globals: {
            vue: 'Vue',
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return 'style.css'
            }

            return '[name][extname]'
          },
        },
      },
      emptyOutDir: true,
    },
  }
})
