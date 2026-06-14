import { expect, test } from '@playwright/test'

test.describe('markdown-demo public and internal views', () => {
  test('opens public parity and internal regression views', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Markdown/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { exact: true, name: 'Public parity' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Basic' })).toBeVisible()

    await page
      .getByRole('button', { name: /HTML Preview/ })
      .first()
      .click()
    await expect(page.getByRole('heading', { level: 2, name: 'HTML Preview' })).toBeVisible()

    await page
      .getByRole('button', { name: /Streamdown/ })
      .first()
      .click()
    await expect(page.getByRole('heading', { level: 2, name: 'Streamdown' })).toBeVisible()

    await page.getByRole('button', { exact: true, name: 'Internal regression' }).first().click()

    await expect(page.getByRole('button', { exact: true, name: 'Internal regression' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Internal Regression' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Bubble integration' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Animated streaming variants' })).toBeVisible()
  })
})
