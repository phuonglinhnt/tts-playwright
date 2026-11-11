import { test, expect } from '@playwright/test';

test.describe('Kiểm thử chức năng đăng nhập', () => {

  // Test 1: Đăng nhập thành công với an@test.com
  test('Đăng nhập thành công với an@test.com', async ({ page }) => {
    await page.goto('/login');

    await page.locator('[data-test="email"]').fill('an@test.com');
    await page.locator('[data-test="password"]').fill('Matkhau123');
    await page.locator('[data-test="login-button"]').click();

    // Kiểm tra chuyển về trang chủ và hiển thị nút đăng xuất hoặc tên người dùng
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="logout"]')).toBeVisible();
    await expect(page.locator('[data-test="user-name"]')).toBeVisible();
  });

  // Test 2: Đăng nhập bằng khoa@test.com, kiểm tra thông báo lỗi
  test('Đăng nhập bằng khoa@test.com, kiểm tra thông báo lỗi', async ({ page }) => {
    await page.goto('/login');

    await page.locator('[data-test="email"]').fill('khoa@test.com');
    await page.locator('[data-test="password"]').fill('Matkhau123');
    await page.locator('[data-test="login-button"]').click();

    // Kiểm tra thông báo lỗi bằng toContainText()
    const errorAlert = page.locator('[data-test="error"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Tài khoản đã bị khóa');
  });

  // Test 3: Để trống mật khẩu, kiểm tra thông báo lỗi
  test('Để trống mật khẩu, kiểm tra thông báo lỗi', async ({ page }) => {
    await page.goto('/login');

    await page.locator('[data-test="email"]').fill('an@test.com');
    await page.locator('[data-test="password"]').fill('');
    await page.locator('[data-test="login-button"]').click();

    // Kiểm tra thông báo lỗi bằng toContainText()
    const errorAlert = page.locator('[data-test="error"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Vui lòng nhập mật khẩu');
  });

});
