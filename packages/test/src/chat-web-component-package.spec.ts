import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    // The standalone HTML host injects this browser-only test fixture.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consumer: any
    Vue?: unknown
  }
}

test('installed tarball works in a native host with two isolated chats', async ({ page }) => {
  const responses: { path: string; status: number }[] = []
  const errors: string[] = []
  await page.addInitScript(() => {
    ;(window as Window & { readyEvents: unknown[] }).readyEvents = []
    document.addEventListener('ready', (event) => {
      ;(window as Window & { readyEvents: unknown[] }).readyEvents.push({
        bubbles: event.bubbles,
        composed: event.composed,
        instance: (event as CustomEvent).detail.instance.id,
      })
    })
  })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.url().includes('/tiny-robot-chat-web-component/dist/')) {
      responses.push({ path: new URL(response.url()).pathname, status: response.status() })
    }
  })
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => window.consumer?.ready.length)).toBe(2)
  expect(await page.evaluate(() => (window as Window & { readyEvents: unknown[] }).readyEvents)).toEqual([
    { bubbles: true, composed: true, instance: 'a' },
    { bubbles: true, composed: true, instance: 'b' },
  ])
  const registration = await page.evaluate(async () => {
    const { registerTinyRobotChat } =
      await import('/node_modules/@opentiny/tiny-robot-chat-web-component/dist/index.js')
    return registerTinyRobotChat() === customElements.get('tiny-robot-chat')
  })
  expect(registration).toBe(true)
  expect(errors).toEqual([])
  expect(await page.evaluate(() => !!window.Vue)).toBe(false)
  await expect(page.locator('#a .tr-chat-ui')).toBeVisible()
  await expect(page.locator('#b .tr-chat-ui')).toBeVisible()
  await expect(page.locator('#a slot[name="header-notice"]')).toHaveCount(1)
  await page.evaluate(() => {
    void window.consumer.a.send('from A')
    void window.consumer.b.send('from B')
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a.length)).toBe(1)
  await expect.poll(() => page.evaluate(() => window.consumer.calls.b.length)).toBe(1)
  await page.evaluate(() => {
    window.consumer.calls.a[0].release('A answer')
    window.consumer.calls.b[0].release('B answer')
  })
  await expect(page.locator('#a').getByText('A answer')).toBeVisible()
  await expect(page.locator('#b').getByText('B answer')).toBeVisible()
  await expect(page.locator('#a').getByText('B answer')).toHaveCount(0)
  await page.locator('#outside input').fill('outside works')
  await expect(page.locator('#outside input')).toHaveValue('outside works')
  expect(responses.find((response) => response.path.endsWith('/index.js'))?.status).toBe(200)
  const styles = await page
    .locator('#a')
    .evaluate((element) => element.shadowRoot?.querySelector('style[data-tiny-robot-chat]')?.textContent?.length ?? 0)
  expect(styles).toBeGreaterThan(100_000)
  expect(responses.every((response) => response.status === 200)).toBe(true)
})

test('installed element cancels, reports failure once, and uses a replaced provider', async ({ page }) => {
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => window.consumer?.ready.length)).toBe(2)
  await page.evaluate(() => {
    void window.consumer.a.send('cancel me')
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a.length)).toBe(1)
  await page.evaluate(async () => {
    await window.consumer.a.cancel()
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a[0].signal.aborted)).toBe(true)
  await page.evaluate(() => window.consumer.calls.a[0].release('late response'))
  await expect(page.locator('#a').getByText('late response')).toHaveCount(0)

  await page.evaluate(() => {
    void window.consumer.a.send('fail me').catch(() => {})
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a.length)).toBe(2)
  await page.evaluate(() => window.consumer.calls.a[1].fail(new Error('host failure')))
  await expect.poll(() => page.evaluate(() => window.consumer.errors.length)).toBe(1)
  expect(await page.evaluate(() => window.consumer.errors)).toMatchObject([
    { name: 'a', detail: { action: 'send', message: 'Error: host failure' } },
  ])

  await page.evaluate(() => {
    window.consumer.a.responseProvider = async function* () {
      yield {
        id: 'replacement',
        object: 'chat.completion.chunk',
        created: 0,
        model: 'mock',
        system_fingerprint: null,
        choices: [{ index: 0, delta: { role: 'assistant', content: 'new provider answer' }, finish_reason: null }],
      }
    }
    void window.consumer.a.send('retry')
  })
  await expect(page.locator('#a').getByText('new provider answer')).toBeVisible()
  expect(await page.evaluate(() => window.consumer.calls.a.length)).toBe(2)
})

test('installed element keeps instance themes inside their own ShadowRoots', async ({ page }) => {
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => window.consumer?.ready.length)).toBe(2)
  const themes = await page.evaluate(() => {
    return [window.consumer.a, window.consumer.b].map((element) => {
      const root = element.shadowRoot!.querySelector('.chat-web-component-root')!
      return getComputedStyle(root).getPropertyValue('--tr-color-primary').trim()
    })
  })
  expect(themes[0]).not.toBe('')
  expect(themes[0]).not.toBe(themes[1])
  await expect(page.locator('body > .tr-chat-ui')).toHaveCount(0)
})

test('installed element preserves a synchronous move and resets on remount', async ({ page }) => {
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => window.consumer?.ready.length)).toBe(2)
  await page.evaluate(() => {
    void window.consumer.a.send('before move')
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a.length)).toBe(1)
  await page.evaluate(() => document.querySelector('.chats')!.append(window.consumer.a))
  await expect(page.locator('#a .tr-bubble').getByText('before move')).toBeVisible()
  await page.evaluate(() => window.consumer.a.remove())
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a[0].signal.aborted)).toBe(true)
  await page.evaluate(() => document.querySelector('.chats')!.append(window.consumer.a))
  await expect
    .poll(() => page.evaluate(() => window.consumer.ready.filter((name: string) => name === 'a').length))
    .toBe(2)
  await expect(page.locator('#a').getByText('before move')).toHaveCount(0)
})

test('installed element keeps a late stream in its original conversation', async ({ page }) => {
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => window.consumer?.ready.length)).toBe(2)
  const chat = page.locator('#a')
  await page.evaluate(() => {
    void window.consumer.a.send('first conversation')
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a.length)).toBe(1)
  await chat.getByRole('button', { name: '新建会话' }).click()
  await page.evaluate(() => {
    void window.consumer.a.send('second conversation')
  })
  await expect.poll(() => page.evaluate(() => window.consumer.calls.a.length)).toBe(2)
  await page.evaluate(() => window.consumer.calls.a[0].release('first response'))
  await expect(chat.getByText('first response')).toHaveCount(0)
  await page.evaluate(() => window.consumer.calls.a[1].release('second response'))
  await expect(chat.getByText('second response')).toBeVisible()
  await chat.getByRole('button', { name: '展开会话列表' }).click()
  await chat.getByText('first conversation').click()
  await expect(chat.getByText('first response')).toBeVisible()
  await expect(chat.getByText('second response')).toHaveCount(0)
})

test('installed element upgrades early properties and waits for a provider before ready', async ({ page }) => {
  await page.route('http://localhost:4179/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body></body></html>',
    }),
  )
  await page.goto('/')
  const result = await page.evaluate(async () => {
    type ChatElement = HTMLElement & {
      responseProvider: unknown
      colorMode: string
      send(text: string): Promise<boolean>
    }
    const provider = async function* () {}
    const early = document.createElement('tiny-robot-chat') as ChatElement
    early.style.height = '650px'
    early.title = 'Before upgrade'
    early.colorMode = 'dark'
    early.responseProvider = provider
    const waiting = document.createElement('tiny-robot-chat') as ChatElement
    waiting.style.height = '650px'
    const readyNames: string[] = []
    document.addEventListener('ready', (event) => readyNames.push((event.target as Element).id))
    early.id = 'early'
    waiting.id = 'waiting'
    const earlyReady = new Promise<void>((resolve) => early.addEventListener('ready', () => resolve(), { once: true }))
    const waitingReady = new Promise<void>((resolve) =>
      waiting.addEventListener('ready', () => resolve(), { once: true }),
    )
    document.body.append(early, waiting)
    // @ts-expect-error The test imports the installed browser artifact by URL.
    const { registerTinyRobotChat } =
      await import('/node_modules/@opentiny/tiny-robot-chat-web-component/dist/index.js')
    const registered = registerTinyRobotChat()
    await customElements.whenDefined('tiny-robot-chat')
    const upgraded = !!waiting.shadowRoot && typeof waiting.send === 'function'
    const beforeProvider = await waiting.send('too early').then(
      () => 'resolved',
      (error) => String(error),
    )
    await earlyReady
    const waitingBeforeProvider = readyNames.includes('waiting')
    waiting.responseProvider = provider
    await waitingReady
    const outcome = {
      upgraded,
      repeatedRegistration: registerTinyRobotChat() === registered,
      beforeProvider,
      waitingBeforeProvider,
      title: early.getAttribute('title'),
      colorMode: early.getAttribute('color-mode'),
      readyNames,
      styled: !!early.shadowRoot?.querySelector('style[data-tiny-robot-chat]'),
      rendered: !!early.shadowRoot?.querySelector('.tr-chat-ui'),
    }
    early.remove()
    waiting.remove()
    return outcome
  })
  expect(result).toEqual({
    upgraded: true,
    repeatedRegistration: true,
    beforeProvider: 'Error: Chat is not ready',
    waitingBeforeProvider: false,
    title: 'Before upgrade',
    colorMode: 'dark',
    readyNames: ['early', 'waiting'],
    styled: true,
    rendered: true,
  })
})
