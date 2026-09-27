import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

declare global {
  interface Window {
    // The standalone HTML host injects this browser-only test fixture.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verification: any
    verificationEvents: unknown[]
    Vue?: unknown
  }
}

async function ready(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect
    .poll(() =>
      page.evaluate(() => window.verification?.log.filter((item: { type: string }) => item.type === 'ready').length),
    )
    .toBe(2)
}

test('split renderer assets resolve relative to a relocated module URL', async ({ page }) => {
  const outputDirectory = fileURLToPath(new URL('../../chat/dist-web-component/', import.meta.url))
  const responses: { path: string; status: number }[] = []
  page.on('response', (response) => {
    if (response.url().includes('/relocated/chat/'))
      responses.push({ path: new URL(response.url()).pathname, status: response.status() })
  })
  await page.route('**/relocated/chat/*', async (route) => {
    const filename = new URL(route.request().url()).pathname.split('/').at(-1)!
    await route.fulfill({
      body: await readFile(resolve(outputDirectory, filename)),
      contentType: filename.endsWith('.css') ? 'text/css' : 'text/javascript',
    })
  })
  await ready(page)
  await page.evaluate(async () => {
    // @ts-expect-error The test imports a generated browser artifact by URL.
    const { registerTinyRobotChatVerification } = await import('/relocated/chat/index.js')
    registerTinyRobotChatVerification('relocated-chat')
    const element = document.createElement('relocated-chat') as HTMLElement & {
      responseProvider: unknown
      send: (text: string) => Promise<boolean>
    }
    element.style.height = '650px'
    element.style.display = 'block'
    element.responseProvider = async function* () {}
    const mounted = new Promise<void>((resolve) => element.addEventListener('ready', () => resolve(), { once: true }))
    document.body.append(element)
    await mounted
    await element.send('**relocated-markdown**')
  })
  await expect(page.locator('relocated-chat').locator('strong')).toHaveText('relocated-markdown')
  expect(responses).toContainEqual({ path: '/relocated/chat/index.js', status: 200 })
  expect(responses).toContainEqual({ path: '/relocated/chat/style.css', status: 200 })
  expect(responses.filter((response) => response.path.endsWith('.js')).length).toBeGreaterThanOrEqual(3)
  expect(responses.every((response) => response.status === 200)).toBe(true)
  await page.locator('relocated-chat').evaluate((element) => element.remove())
})

test('production bundle mounts two real chats without host Vue or global CSS', async ({ page }) => {
  const errors: string[] = []
  const assets: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`))
  page.on('response', (response) => {
    if (response.url().includes('dist-web-component'))
      assets.push(`${response.status()} ${new URL(response.url()).pathname}`)
  })
  await page.goto('/')
  await expect
    .poll(
      () =>
        page.evaluate(() => window.verification?.log.filter((item: { type: string }) => item.type === 'ready').length),
      { timeout: 15000 },
    )
    .toBe(2)
    .catch((error) => {
      throw new Error(`${errors.join('\n')}\n${error.message}`)
    })
  expect(errors).toEqual([])
  const a = page.locator('#chat-a')
  const b = page.locator('#chat-b')
  await expect(a.locator('.tr-chat-ui')).toBeVisible()
  await expect(b.locator('.tr-chat-ui')).toBeVisible()
  await expect(a.locator('slot[name="header-notice"]')).toHaveCount(1)
  await expect(page.locator('#outside-input')).toHaveValue('outside')
  expect(
    await page.evaluate(() => ({ vue: !!window.Vue, globalChat: !!document.querySelector('.tr-chat-ui') })),
  ).toEqual({ vue: false, globalChat: false })
  expect(await page.evaluate(() => window.verification.preUpgrade)).toBe(true)
  expect(assets).toContain('200 /dist-web-component/index.js')
  expect(assets).toContain('200 /dist-web-component/style.css')
  const readyTimes = await page.evaluate(() =>
    window.verification.log
      .filter((item: { type: string }) => item.type === 'ready')
      .map((item: { at: number }) => Math.round(item.at)),
  )
  console.log(`WC first ready timings (ms from navigation start): ${readyTimes.join(', ')}`)
})

test('direct OpenTiny Vue imports preserve the real host behavior', async ({ page }) => {
  const errors: string[] = []
  const assets: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.url().includes('/dist-direct/'))
      assets.push(`${response.status()} ${new URL(response.url()).pathname}`)
  })
  await page.goto('/?bundle=direct')
  await expect
    .poll(
      () =>
        page.evaluate(() => window.verification?.log.filter((item: { type: string }) => item.type === 'ready').length),
      { timeout: 15000 },
    )
    .toBe(2)
  expect(errors).toEqual([])
  expect(assets).toContain('200 /verification/web-component/dist-direct/index.js')
  expect(assets).toContain('200 /verification/web-component/dist-direct/style.css')
  const a = page.locator('#chat-a')
  const b = page.locator('#chat-b')
  await expect(a.locator('.tr-chat-ui')).toBeVisible()
  await expect(b.locator('.tr-chat-ui')).toBeVisible()
  const modes = await page.evaluate(() =>
    [window.verification.a, window.verification.b].map((element: HTMLElement) =>
      getComputedStyle(element.shadowRoot!.querySelector('.chat-verification-root')!)
        .getPropertyValue('--tr-color-primary')
        .trim(),
    ),
  )
  expect(modes[0]).not.toBe('')
  expect(modes[0]).not.toBe(modes[1])
  expect(await page.evaluate(() => !!window.Vue)).toBe(false)
  const readyTimes = await page.evaluate(() =>
    window.verification.log
      .filter((item: { type: string }) => item.type === 'ready')
      .map((item: { at: number }) => Math.round(item.at)),
  )
  console.log(`Direct-import WC ready timings (ms from navigation start): ${readyTimes.join(', ')}`)
  await page.evaluate(() => {
    void window.verification.a.send('direct A')
    void window.verification.b.send('direct B')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(1)
  await expect.poll(() => page.evaluate(() => window.verification.requests.b.length)).toBe(1)
  await page.evaluate(() => {
    window.verification.release('a', 'direct-answer-A')
    window.verification.release('b', 'direct-answer-B')
  })
  await expect(a.getByText('direct-answer-A')).toBeVisible()
  await expect(b.getByText('direct-answer-B')).toBeVisible()
  await expect(a.getByText('direct-answer-B')).toHaveCount(0)
  await page.evaluate(() => {
    window.verification.finish('a')
    window.verification.finish('b')
  })
  const editor = a.locator('.ProseMirror')
  await editor.fill('Ja')
  await expect(a.locator('.suggestion-list')).toBeVisible()
})

test('registration, upgrade and ready have distinct timing', async ({ page }) => {
  await ready(page)
  const result = await page.evaluate(async () => {
    // @ts-expect-error The test imports a generated browser artifact by URL.
    const { registerTinyRobotChatVerification } = await import('/dist-web-component/index.js')
    const first = customElements.get('tiny-robot-chat-verification')
    const repeated = registerTinyRobotChatVerification()
    const third = document.createElement('tiny-robot-chat-verification') as HTMLElement & {
      responseProvider: unknown
      send: (text: string) => Promise<boolean>
    }
    document.body.append(third)
    let readyCount = 0
    const ready = new Promise<void>((resolve) =>
      third.addEventListener(
        'ready',
        () => {
          readyCount++
          resolve()
        },
        { once: true },
      ),
    )
    await customElements.whenDefined('tiny-robot-chat-verification')
    const before = { upgraded: !!third.shadowRoot, readyCount, method: typeof third.send }
    third.responseProvider = window.verification.a.responseProvider
    await ready
    const after = { readyCount, rendered: !!third.shadowRoot?.querySelector('.tr-chat-ui') }
    third.remove()
    return { sameConstructor: first === repeated, before, after }
  })
  expect(result).toEqual({
    sameConstructor: true,
    before: { upgraded: true, readyCount: 0, method: 'function' },
    after: { readyCount: 1, rendered: true },
  })
})

test('controlled chunks remain in their own instance', async ({ page }) => {
  await ready(page)
  await page.evaluate(() => {
    void window.verification.a.send('alpha')
    void window.verification.b.send('beta')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(1)
  await expect.poll(() => page.evaluate(() => window.verification.requests.b.length)).toBe(1)
  await page.evaluate(() => {
    window.verification.release('a', 'A-only')
    window.verification.release('b', 'B-only')
  })
  await expect(page.locator('#chat-a').getByText('A-only')).toBeVisible()
  await expect(page.locator('#chat-b').getByText('B-only')).toBeVisible()
  await expect(page.locator('#chat-a').getByText('B-only')).toHaveCount(0)
  await expect(page.locator('#chat-b').getByText('A-only')).toHaveCount(0)
  await page.evaluate(() => {
    window.verification.finish('a')
    window.verification.finish('b')
  })
})

test('late chunks stay with their original conversation after navigation', async ({ page }) => {
  await ready(page)
  const a = page.locator('#chat-a')
  await page.evaluate(() => {
    void window.verification.a.send('first session')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(1)
  await a.getByRole('button', { name: '新建会话' }).click()
  await page.evaluate(() => {
    void window.verification.a.send('second session')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(2)
  await page.evaluate(() => window.verification.releaseAt('a', 0, 'first-answer'))
  await expect(a.getByText('first-answer')).toHaveCount(0)
  await page.evaluate(() => {
    window.verification.releaseAt('a', 1, 'second-answer')
    window.verification.finishAt('a', 1)
  })
  await expect(a.getByText('second-answer')).toBeVisible()
  await page.evaluate(() => window.verification.finishAt('a', 0))
  await a.getByRole('button', { name: '展开会话列表' }).click()
  await a.getByText('first session').click()
  await expect(a.getByText('first-answer')).toBeVisible()
  await expect(a.getByText('second-answer')).toHaveCount(0)
})

test('history menu and sender suggestion stay usable in Shadow DOM', async ({ page }) => {
  await ready(page)
  const a = page.locator('#chat-a')
  await page.evaluate(() => {
    void window.verification.a.send('menu conversation')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(1)
  await page.evaluate(() => window.verification.finish('a'))
  await a.getByRole('button', { name: '展开会话列表' }).click()
  await a.getByRole('button', { name: 'menu conversation 更多操作' }).click()
  await expect(a.getByRole('menuitem', { name: '重命名' })).toBeVisible()
  await expect(page.locator('body > .tr-history__menu-list')).toHaveCount(0)
  await a.getByRole('menuitem', { name: '重命名' }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(a.getByRole('menuitem', { name: '删除' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(a.getByRole('menuitem', { name: '重命名' })).toBeHidden()

  const editor = a.locator('.ProseMirror')
  await editor.fill('Ja')
  await expect(page.locator('.suggestion-list')).toBeVisible()
  const placement = await page.evaluate(() => {
    const popup =
      document.querySelector('.suggestion-list') ??
      document.querySelector('#chat-a')!.shadowRoot!.querySelector('.suggestion-list')
    return popup?.getRootNode() instanceof ShadowRoot ? 'shadow' : 'document'
  })
  expect(placement).toBe('shadow')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(editor).toContainText('TypeScript')
  await page.locator('#outside-input').focus()
  await expect(page.locator('#outside-input')).toBeFocused()
})

test('theme, host isolation, attributes and composed events', async ({ page }) => {
  await page.addInitScript(() => {
    window.verificationEvents = []
    document.addEventListener('ready', (event) =>
      window.verificationEvents.push({
        bubbles: event.bubbles,
        composed: event.composed,
        detailInstance: (event as CustomEvent).detail.instance.id,
      }),
    )
  })
  await ready(page)
  const result = await page.evaluate(() => {
    const { a, b } = window.verification
    const get = (el: HTMLElement) => {
      const inner = el.shadowRoot!.querySelector('.chat-verification-root')!
      return {
        mode: inner.getAttribute('data-tr-color-mode'),
        primary: getComputedStyle(inner).getPropertyValue('--tr-color-primary').trim(),
        senderFont: getComputedStyle(el.shadowRoot!.querySelector('.tr-sender')!).fontSize,
      }
    }
    return { a: get(a), b: get(b), events: window.verificationEvents }
  })
  expect(result.a.mode).toBe('light')
  expect(result.b.mode).toBe('dark')
  expect(result.a.primary).not.toBe('')
  expect(result.a.primary).not.toBe(result.b.primary)
  expect(
    result.events.sort((left: { detailInstance: string }, right: { detailInstance: string }) =>
      left.detailInstance.localeCompare(right.detailInstance),
    ),
  ).toEqual([
    { bubbles: true, composed: true, detailInstance: 'chat-a' },
    { bubbles: true, composed: true, detailInstance: 'chat-b' },
  ])
  await page.screenshot({ path: '../chat/verification/web-component/chromium-two-instances.png', fullPage: true })
  await page.locator('#chat-a').evaluate((element) => element.setAttribute('title', 'Changed A'))
  await expect(page.locator('#chat-a').getByText('Changed A')).toBeVisible()
  await page.locator('#chat-b').evaluate((element) => {
    ;(element as HTMLElement & { colorMode: string }).colorMode = 'light'
  })
  await expect
    .poll(() =>
      page
        .locator('#chat-b')
        .evaluate((element) =>
          element.shadowRoot!.querySelector('.chat-verification-root')?.getAttribute('data-tr-color-mode'),
        ),
    )
    .toBe('light')
  await page.locator('#outside-input').fill('host input still works')
  await expect(page.locator('#outside-input')).toHaveValue('host input still works')
})

test('cancel, late chunk, failure and retry stay with the owning conversation', async ({ page }) => {
  await ready(page)
  await page.evaluate(() => {
    window.verification.errorPropagation = []
    document.addEventListener('chat-error', (event) =>
      window.verification.errorPropagation.push({
        bubbles: event.bubbles,
        composed: event.composed,
        detail: (event as CustomEvent).detail,
      }),
    )
  })
  await page.evaluate(() => {
    void window.verification.a.send('cancel me')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(1)
  await page.evaluate(() => window.verification.a.cancel())
  await expect.poll(() => page.evaluate(() => window.verification.requests.a[0].signal.aborted)).toBe(true)
  await page.evaluate(() => window.verification.release('a', 'late-secret'))
  await expect(page.locator('#chat-a').getByText('late-secret')).toHaveCount(0)
  await page.evaluate(() => {
    void window.verification.a.send('fail me').catch(() => {})
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(2)
  await page.evaluate(() => window.verification.fail('a'))
  await expect(page.locator('#chat-a').getByText('controlled failure')).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.verification.errorPropagation.length)).toBe(1)
  expect(await page.evaluate(() => window.verification.errorPropagation[0])).toMatchObject({
    bubbles: true,
    composed: true,
    detail: { action: 'send', message: 'Error: controlled failure' },
  })
  await page.evaluate(() => {
    void window.verification.a.send('retry')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(3)
  await page.evaluate(() => {
    window.verification.release('a', 'retry-success')
    window.verification.finish('a')
  })
  await expect(page.locator('#chat-a').getByText('retry-success')).toBeVisible()
  await expect(page.locator('#chat-b').getByText('retry-success')).toHaveCount(0)
})

test('moving preserves state and removal aborts requests before remount', async ({ page }) => {
  await ready(page)
  await page.evaluate(() => {
    void window.verification.a.send('before move')
  })
  await expect.poll(() => page.evaluate(() => window.verification.requests.a.length)).toBe(1)
  await page.evaluate(() => {
    const { a } = window.verification
    a.parentElement.append(a)
  })
  await expect(page.locator('#chat-a .tr-bubble').getByText('before move')).toBeVisible()
  await page.evaluate(() => window.verification.a.remove())
  await expect.poll(() => page.evaluate(() => window.verification.requests.a[0].signal.aborted)).toBe(true)
  await page.evaluate(() => document.querySelector('.workspace > section')!.append(window.verification.a))
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.verification.log.filter(
            (item: { type: string; id: string }) => item.type === 'ready' && item.id === 'chat-a',
          ).length,
      ),
    )
    .toBe(2)
  await expect(page.locator('#chat-a').getByText('before move')).toHaveCount(0)
  await page.locator('#chat-a .ProseMirror').fill('Ja')
  await expect(page.locator('#chat-a .suggestion-list')).toBeVisible()
  await page.evaluate(() => window.verification.a.remove())
  await expect
    .poll(() => page.evaluate(() => window.verification.a.shadowRoot.querySelector('.suggestion-list')))
    .toBeNull()
  await expect(page.locator('body > .suggestion-list')).toHaveCount(0)
})

test('a move while the stylesheet loads still reaches ready', async ({ page }) => {
  await page.route('**/dist-web-component/style.css', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250))
    await route.continue()
  })
  await page.goto('/')
  await page.evaluate(() => {
    const a = window.verification.a
    a.parentElement.append(a)
  })
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.verification.log.filter(
            (item: { type: string; id: string }) => item.type === 'ready' && item.id === 'chat-a',
          ).length,
      ),
    )
    .toBe(1)
  await expect(page.locator('#chat-a .tr-chat-ui')).toBeVisible()
})
