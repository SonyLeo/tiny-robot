/**
 * packageManager.ts — 包管理器检测与命令生成
 *
 * 参考 create-vue 的 utils/packageManager.ts 实现。
 * 通过 npm_config_user_agent 环境变量自动识别用户当前使用的包管理器。
 */

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

export type PackageManagerCommand = 'install' | 'dev' | 'build' | 'preview'

/**
 * 从 npm_config_user_agent 推断用户当前使用的包管理器。
 *
 * 当用户通过 `npm create tiny-robot`、`pnpm create tiny-robot` 等命令运行时，
 * Node.js 会自动设置该环境变量，值类似 `pnpm/9.0.0 npm/? node/v20.11.0`。
 *
 * @returns 检测到的包管理器，未知时回退到 'npm'
 */
export function inferPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? ''
  if (/pnpm/.test(userAgent)) return 'pnpm'
  if (/yarn/.test(userAgent)) return 'yarn'
  if (/bun/.test(userAgent)) return 'bun'
  return 'npm'
}

/**
 * 生成对应包管理器的命令字符串。
 *
 * @param pm - 包管理器
 * @param command - 要执行的命令
 * @returns 完整命令字符串
 */
export function getCommand(pm: PackageManager, command: PackageManagerCommand | string): string {
  switch (command) {
    case 'install':
      return pm === 'yarn' ? 'yarn' : `${pm} install`
    case 'dev':
      return pm === 'yarn' ? 'yarn dev' : `${pm} run dev`
    case 'build':
      return pm === 'yarn' ? 'yarn build' : `${pm} run build`
    case 'preview':
      return pm === 'yarn' ? 'yarn preview' : `${pm} run preview`
    default:
      return `${pm} ${command}`
  }
}
