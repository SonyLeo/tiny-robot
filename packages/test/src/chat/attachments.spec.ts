import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Attachments Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToBlackbox()
  })

  test('should expose the default upload action in blackbox mode', async () => {
    const root = helper.selectors.blackboxChat
    await helper.expectUploadActionVisible(true, root)
  })

  test('should render the default attachments area after selecting a file', async () => {
    const root = helper.selectors.blackboxChat

    await helper.expectAttachmentsAreaVisible(false, root)
    await helper.uploadAttachment(
      {
        name: 'notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello attachment'),
      },
      root,
    )

    await helper.expectAttachmentsAreaVisible(true, root)
    await helper.expectAttachmentCount(1, root)
  })

  test('should clear pending attachments after sending a message', async () => {
    const root = helper.selectors.blackboxChat

    await helper.uploadAttachment(
      {
        name: 'notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello attachment'),
      },
      root,
    )
    await helper.expectAttachmentsAreaVisible(true, root)

    await helper.sendMessage('send with attachment', root)
    await helper.expectAttachmentsAreaVisible(false, root)
  })

  test('should clear pending attachments when starting a new conversation', async () => {
    const root = helper.selectors.blackboxChat

    await helper.uploadAttachment(
      {
        name: 'notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello attachment'),
      },
      root,
    )
    await helper.expectAttachmentsAreaVisible(true, root)

    await helper.clickNewChat(root)

    await helper.expectAttachmentsAreaVisible(false, root)
  })
})
