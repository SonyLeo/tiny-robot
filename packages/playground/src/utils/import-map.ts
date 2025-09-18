interface ImportMapOptions {
  tinyRobotVersion: string
  vueVersion: string
  typescriptVersion: string
}

export async function generateImportMap(options: ImportMapOptions) {
  const { tinyRobotVersion, vueVersion } = options

  const vueVersionToUse = vueVersion === 'latest' ? '3.3.11' : vueVersion
  const tinyRobotVersionToUse = tinyRobotVersion === 'latest' ? '0.3.0-rc.4' : tinyRobotVersion

  return {
    imports: {
      vue: `https://unpkg.com/vue@${vueVersionToUse}/dist/vue.esm-browser.js`,
      'vue/server-renderer': `https://unpkg.com/vue@${vueVersionToUse}/server-renderer/index.mjs`,
      '@vue/shared': `https://unpkg.com/@vue/shared@${vueVersionToUse}/index.js`,
      '@opentiny/tiny-robot': `https://unpkg.com/@opentiny/tiny-robot@${tinyRobotVersionToUse}/dist/index.js`,
      '@opentiny/tiny-robot-svgs': `https://unpkg.com/@opentiny/tiny-robot-svgs@${tinyRobotVersionToUse}/dist/tiny-robot-svgs.js`,
      '@opentiny/vue': `https://registry.npmmirror.com/@opentiny/vue-runtime/3.22/files/dist3/tiny-vue-pc.mjs`,
      '@opentiny/vue-icon': `https://registry.npmmirror.com/@opentiny/vue-runtime/3.22/files/dist3/tiny-vue-icon.mjs`,
      '@opentiny/vue-locale': `https://registry.npmmirror.com/@opentiny/vue-runtime/3.22/files/dist3/tiny-vue-locale.mjs`,
      '@opentiny/vue-common': `https://registry.npmmirror.com/@opentiny/vue-runtime/3.22/files/dist3/tiny-vue-common.mjs`,
      '@vueuse/core': `https://unpkg.com/@vueuse/core@13.1.0/index.mjs`,
      dompurify: `https://unpkg.com/dompurify@3.2.6/dist/purify.es.js`,
      'markdown-it': `https://unpkg.com/markdown-it@14.1.0/dist/markdown-it.min.js`,
      echarts: `https://registry.npmmirror.com/echarts/5.4.1/files/dist/echarts.esm.js`,
    },
  }
}
