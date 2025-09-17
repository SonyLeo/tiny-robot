export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.esm.js',
    }
  },
}
