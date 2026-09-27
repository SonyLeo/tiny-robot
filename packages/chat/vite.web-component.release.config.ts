import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const packageRoot = dirname(fileURLToPath(import.meta.url))
const outputDirectory = resolve(packageRoot, '../chat-web-component/dist')

function inlineShadowStyles(): Plugin {
  return {
    name: 'chat-web-component-inline-shadow-styles',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const stylesheet = Object.values(bundle).find((item) => item.type === 'asset' && item.fileName === 'style.css')
      const entry = Object.values(bundle).find((item) => item.type === 'chunk' && item.isEntry)
      if (!stylesheet || !entry) this.error('Missing Chat stylesheet or entry chunk')
      const marker = JSON.stringify('__TINY_ROBOT_CHAT_COMPILED_STYLES__')
      if (entry.code.split(marker).length !== 2) this.error('Chat stylesheet marker must occur exactly once')
      entry.code = entry.code.replace(marker, JSON.stringify(String(stylesheet.source)))
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    inlineShadowStyles(),
    {
      name: 'chat-web-component-public-types',
      closeBundle() {
        copyFileSync(resolve(packageRoot, 'src/web-component/public.d.ts'), resolve(outputDirectory, 'index.d.ts'))
      },
    },
  ],
  define: { 'process.env': '{}' },
  resolve: {
    alias: [
      { find: /^@opentiny\/tiny-robot-kit$/, replacement: resolve(packageRoot, '../kit/src/index.ts') },
      { find: /^@opentiny\/tiny-robot-svgs$/, replacement: resolve(packageRoot, '../svgs/src/index.ts') },
      { find: /^@opentiny\/tiny-robot$/, replacement: resolve(packageRoot, '../components/src/index.ts') },
    ],
  },
  build: {
    lib: { entry: resolve(packageRoot, 'src/web-component/index.ts'), formats: ['es'], fileName: () => 'index.js' },
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: false } },
    outDir: outputDirectory,
    emptyOutDir: true,
  },
})
