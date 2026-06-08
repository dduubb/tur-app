import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Start each test with cleared localStorage
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('pre-session screen shows today plan with 4 exercises', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('TUR')).toBeVisible()
  await expect(page.getByText("Today's plan")).toBeVisible()
  await expect(page.getByText('Start Workout')).toBeVisible()

  // Should list 4 upcoming exercises
  const items = page.locator('.upcoming-item')
  await expect(items).toHaveCount(4)
})

test('start workout and complete first set', async ({ page }) => {
  await page.goto('/')

  // Start workout
  await page.getByRole('button', { name: 'Start Workout' }).click()

  // Should show exercise intro (1 of 4)
  await expect(page.getByText('1 of 4')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start Timer' })).toBeVisible()

  // Start timer
  await page.getByRole('button', { name: 'Start Timer' }).click()

  // Timer is running — stop button visible
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible()

  // Wait a couple seconds then stop
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: 'Stop' }).click()

  // Result screen — shows seconds
  await expect(page.locator('.result-seconds')).toBeVisible()
  await expect(page.getByRole('button', { name: /Next Exercise|Finish/ })).toBeVisible()
})

test('state persists after page reload', async ({ page }) => {
  await page.goto('/')

  // Start workout, do one set
  await page.getByRole('button', { name: 'Start Workout' }).click()
  await page.getByRole('button', { name: 'Start Timer' }).click()
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: 'Stop' }).click()
  await page.getByRole('button', { name: /Next Exercise|Finish/ }).click()

  // We are now at exercise 2
  await expect(page.getByText('2 of 4')).toBeVisible()

  // Reload
  await page.reload()

  // Session should be restored at exercise 2
  await expect(page.getByText('2 of 4')).toBeVisible()
})

test('can skip an exercise', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start Workout' }).click()
  await expect(page.getByText('1 of 4')).toBeVisible()

  await page.getByRole('button', { name: 'Skip this exercise' }).click()

  await expect(page.getByText('2 of 4')).toBeVisible()
})

test('navigate to library and edit an exercise', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Library' }).click()

  await expect(page.getByText('Library')).toBeVisible()

  // Open edit sheet for first exercise
  const firstCard = page.locator('.ex-card').first()
  await firstCard.getByRole('button', { name: 'Edit' }).click()

  // Sheet should open
  await expect(page.locator('.sheet')).toBeVisible()

  // Change weight
  const weightInput = page.locator('input[name="weight"]')
  await weightInput.clear()
  await weightInput.fill('100')

  await page.getByRole('button', { name: 'Save Changes' }).click()

  // Sheet closes and weight is updated
  await expect(page.locator('.sheet')).not.toBeVisible()
  await expect(page.getByText('100 lbs').first()).toBeVisible()
})

test('settings export creates download', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()

  // Set up download listener
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export backup (JSON)' }).click(),
  ])

  expect(download.suggestedFilename()).toMatch(/tur-backup.*\.json/)
})
