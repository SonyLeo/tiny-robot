import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件：CLI 主入口 + 可能被外部引用的模块
  entry: {
    index: 'src/index.ts',
    banner: 'src/banner.ts',
    packageManager: 'src/packageManager.ts',
    templateRegistry: 'src/templateRegistry.ts',
  },

  // 构建产物格式：仅 ESM（package.json 已声明 "type": "module"）
  format: ['esm'],

  // 构建目标：Node.js 18+
  target: 'node18',

  // 输出目录
  outDir: 'dist',

  // 清理旧产物
  clean: true,

  // 不打包 node_modules 中的运行时依赖（@clack/prompts、picocolors 保持外部引用）
  external: ['@clack/prompts', 'picocolors'],

  // 不生成 .d.ts（CLI 工具无需类型声明文件对外暴露）
  dts: false,
})
