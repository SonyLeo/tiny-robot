import { test, type Page } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'
import { openChatSmokeScene } from './openChatSmokeScene'

test.describe('Chat Attachments Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    helper = await openChatSmokeScene(page, 'trchat', { entry: 'component-test' })
  })

  test('should expose the default upload action in TrChat mode', async () => {
    const root = helper.selectors.trChatChat
    await helper.expectUploadActionVisible(true, root)
  })

  test('should render the default attachments area after selecting a file', async () => {
    const root = helper.selectors.trChatChat

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
    const root = helper.selectors.trChatChat

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
    const root = helper.selectors.trChatChat

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

test.describe('Chat Attachments Feature (granular)', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    helper = await openChatSmokeScene(page, 'granular', { entry: 'component-test' })
  })

  test('should expose the default upload action on the official Root + primitives path', async () => {
    const root = helper.selectors.granularChat
    await helper.expectUploadActionVisible(true, root)
  })

  test('should render pending attachments and clear them after a granular send', async () => {
    const root = helper.selectors.granularChat

    await helper.expectAttachmentsAreaVisible(false, root)
    await helper.uploadAttachment(
      {
        name: 'granular-notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello granular attachment'),
      },
      root,
    )

    await helper.expectAttachmentsAreaVisible(true, root)
    await helper.expectAttachmentCount(1, root)

    await helper.sendMessage('granular attachment send', root)
    await helper.expectAttachmentsAreaVisible(false, root)
  })

  test('should clear pending granular attachments when starting a new conversation', async () => {
    const root = helper.selectors.granularChat

    await helper.uploadAttachment(
      {
        name: 'granular-notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello granular attachment'),
      },
      root,
    )
    await helper.expectAttachmentsAreaVisible(true, root)

    await helper.clickNewChat(root)
    await helper.expectAttachmentsAreaVisible(false, root)
  })
})
