import { test, expect } from '@playwright/test';

test.describe('Đăng nhập', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/login');
  });

  test('Đăng nhập thành công với an@test.com', async ({ page }) => {

    await page.locator('[data-test="email"]').fill('an@test.com');
    await page.locator('[data-test="password"]').fill('Matkhau123');

    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="logout"]')).toBeVisible();
    await expect(page.locator('[data-test="user-name"]')).toBeVisible();

  });

  test('Đăng nhập bằng khoa@test.com, kiểm tra thông báo lỗi', async ({ page }) => {

    await page.locator('[data-test="email"]').fill('khoa@test.com');
    await page.locator('[data-test="password"]').fill('Matkhau123');

    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Tài khoản đã bị khóa');
  });

  test('Để trống mật khẩu, kiểm tra thông báo lỗi', async ({ page }) => {

    await page.locator('[data-test="email"]').fill('khoa@test.com');
    await page.locator('[data-test="password"]').fill('');

    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Vui lòng nhập mật khẩu');
  });
});
