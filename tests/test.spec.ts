import { test, expect, chromium } from '@playwright/test';


test('Project Operations', async ({ page }) => {
  await page.goto('http://localhost:31000/api/login?key=foo-bar-baz&user=zz330&role=advanced&sub=6722&email=123@example.com');
  await page.locator('#addPrivateProjectButton').click();
  await page.locator('#newPrivProjectTitle').click();
  await page.locator('#newPrivProjectTitle').fill('Sample Private Project');
  await page.locator('#newPrivProjectTitle').press('Enter');
  await expect(page.getByText('PRIVATE').nth(3)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sample Private Project' }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: '+' }).nth(1).click();
  await page.locator('#newSharProjectTitle').fill('Sample Shared Project');
  await page.locator('#newSharProjectTitle').press('Enter');
  await expect(page.getByText('SHARED').nth(2)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sample Shared Project' }).nth(1)).toBeVisible();
  await page.getByRole('link', { name: 'Sample Shared Project' }).nth(1).click();
  await page.locator('div:nth-child(4) > .page-header-icon').click();
  await page.getByRole('link', { name: 'Sample Private Project' }).nth(1).click();
  await page.locator('div:nth-child(4) > .page-header-icon').click();
  setTimeout(() => { console.log("sleep end"); }, 10000);
});

test('Quick Task Operations', async ({ page }) => {
  await page.goto('http://localhost:31000/api/login?key=foo-bar-baz&user=zz330&role=advanced&sub=6722&email=123@example.com');
  await page.locator('#createQuickTaskButton').click();
  await page.locator('#taskTitle').click();
  await page.locator('#taskTitle').fill('Quick Task 1');
  await page.locator('#taskTitle').press('Enter');
  await page.locator('#createQuickTaskButton').click();
  await page.locator('#taskTitle').fill('Quick Task 2');
  await page.locator('#taskTitle').press('Enter');
  await page.getByRole('checkbox').nth(1).check();
  await page.locator('div').filter({ hasText: /^Quick Task 1$/ }).nth(2).click();
  await page.getByRole('checkbox').nth(1).uncheck();
  await page.locator('.task-item-tail').nth(-1).click();
  await page.locator('.task-item-tail').nth(-1).click();
  setTimeout(() => { console.log("sleep end"); }, 10000);
});


test('Detailed task operations', async ({ page }) => {
  await page.goto('http://localhost:31000/api/login?key=foo-bar-baz&user=zz330&role=advanced&sub=6722&email=123@example.com');
  await page.locator('#addPrivateProjectButton').click();
  await page.locator('#newPrivProjectTitle').click();
  await page.locator('#newPrivProjectTitle').fill('Sample Project');
  await page.locator('#newPrivProjectTitle').press('Enter');
  await page.getByText('Create New Task').nth(1).click();
  await page.locator('#detailedTaskTitle').fill('Hello World');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('link', { name: 'Sample Project' }).nth(1)).toBeVisible();
  await expect(page.getByText('Hello World')).toBeVisible();
  await page.getByText('Hello World').click();
  await page.getByPlaceholder('Enter task description...').click();
  await page.getByPlaceholder('Enter task description...').fill('Description Sample');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByText('Hello World').click();
  await page.getByPlaceholder('Enter task description...').click();
  await page.getByPlaceholder('Enter task description...').fill('Description Sample Modified');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('link', { name: 'Sample Project' }).nth(1).click();
  await expect(page.locator('div').filter({ hasText: /^Hello World$/ }).nth(1)).toBeVisible();
  await page.locator('div:nth-child(4) > .page-header-icon').click();
});