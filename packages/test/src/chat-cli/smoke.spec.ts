import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cliEntry = fileURLToPath(new URL('../../../chat-cli/dist/index.js', import.meta.url))
const repoNodeModules = fileURLToPath(new URL('../../node_modules', import.meta.url))
const toolRoot = fileURLToPath(new URL('../../node_modules/.bin', import.meta.url))
const windowsShell = process.env.ComSpec || 'cmd.exe'

function createTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

test.describe('chat-cli smoke build', () => {
  test('generated basic template should build with the local workspace toolchain', async () => {
    const root = createTempDir('tiny-robot-chat-cli-smoke-')
    const projectDir = join(root, 'smoke-app')

    try {
      execFileSync(
        process.execPath,
        [cliEntry, 'smoke-app', '--template', 'basic', '--provider', 'openai', '--yes', '--no-install', '--cwd', root],
        {
          env: {
            ...process.env,
            npm_config_user_agent: 'pnpm/9.0.0 npm/? node/v20.11.0',
          },
          stdio: 'pipe',
        },
      )

      symlinkSync(repoNodeModules, join(projectDir, 'node_modules'), 'junction')

      execFileSync(windowsShell, ['/c', join(toolRoot, 'vue-tsc.CMD'), '--noEmit'], {
        cwd: projectDir,
        stdio: 'pipe',
      })

      execFileSync(windowsShell, ['/c', join(toolRoot, 'vite.CMD'), 'build'], {
        cwd: projectDir,
        stdio: 'pipe',
      })

      expect(existsSync(join(projectDir, 'dist', 'index.html'))).toBeTruthy()

      const packageContent = readFileSync(join(projectDir, 'package.json'), 'utf-8')
      expect(packageContent).not.toContain('workspace:*')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
