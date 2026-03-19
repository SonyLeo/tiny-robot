import { expect, test } from '@playwright/test'
import { execFileSync, spawn } from 'node:child_process'
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

async function waitForServer(url: string, { timeout = 15000, interval = 250 } = {}): Promise<void> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Ignore connection errors until the timeout expires.
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  throw new Error(`Timed out waiting for preview server at ${url}`)
}

test.describe('chat-cli smoke build', () => {
  for (const templateId of ['basic', 'agent-mcp'] as const) {
    test(`generated ${templateId} template should build with the local workspace toolchain`, async ({
      page,
    }, testInfo) => {
      const root = createTempDir('tiny-robot-chat-cli-smoke-')
      const projectDir = join(root, 'smoke-app')
      const port = 4173 + testInfo.workerIndex
      const previewUrl = `http://127.0.0.1:${port}/`
      let previewProcess: ReturnType<typeof spawn> | null = null

      try {
        execFileSync(
          process.execPath,
          [
            cliEntry,
            'smoke-app',
            '--template',
            templateId,
            '--provider',
            'openai',
            '--yes',
            '--no-install',
            '--cwd',
            root,
          ],
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

        previewProcess = spawn(
          windowsShell,
          ['/c', join(toolRoot, 'vite.CMD'), 'preview', '--host', '127.0.0.1', '--port', String(port)],
          {
            cwd: projectDir,
            stdio: 'ignore',
          },
        )

        await waitForServer(previewUrl)
        await page.goto(previewUrl)

        await expect(page.getByRole('heading', { name: /AI Assistant|Agent MCP Workspace/i })).toBeVisible()
        await expect(page.locator('button[aria-label="选择模型"]')).toBeVisible()
        await expect(page.locator('button[title="打开历史"]')).toBeVisible()

        if (templateId === 'agent-mcp') {
          await expect(page.getByRole('button', { name: 'MCP' })).toBeVisible()
          await page.getByRole('button', { name: 'MCP' }).click()
          await expect(page.getByText('Weather Service')).toBeVisible()
        }
      } finally {
        if (previewProcess && !previewProcess.killed) {
          previewProcess.kill()
        }
        rmSync(root, { recursive: true, force: true })
      }
    })
  }
})
