import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件：CLI 主入口 + 可能被外部引用的模块
  entry: {
    index: 'src/index.ts',
    banner: 'src/banner.ts',
    packageManager: 'src/packageManager.ts',
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
  // tsup 默认已将 dependencies 中的包标记为 external，此处明确声明以提高可读性
  external: ['@clack/prompts', 'picocolors'],

  // CLI 入口自动添加 shebang（#!/usr/bin/env node）并设置可执行位
  // tsup 会检测源文件首行的 shebang 并传递到产物
  banner: {
    js: '#!/usr/bin/env node',
  },

  // 不生成 .d.ts（CLI 工具无需类型声明文件对外暴露）
  dts: false,

  // 生产构建时压缩（减小包体积）
  // minify: true,  // 取消注释以开启压缩（会牺牲可读性）
})
