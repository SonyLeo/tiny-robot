import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    minify: true,
    rollupOptions: {
      external: ['vue', '@opentiny/tiny-robot', '@opentiny/tiny-robot-kit'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => (assetInfo.name === 'style.css' ? 'style.css' : '[name][extname]'),
        preserveModules: false,
        exports: 'named',
        dir: 'dist',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
})
