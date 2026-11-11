import { test, expect } from '@playwright/test';

test.describe('Mua hàng', () => {
    // Chạy tuần tự 4 bài test để tránh tranh chấp giỏ hàng của nhau
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
        // Đặt lại dữ liệu sạch trước mỗi bài test
        await request.post('/api/test/reset');

        await page.goto('http://localhost:4000/login');
        await page.locator('[data-test="email"]').fill('an@test.com');
        await page.locator('[data-test="password"]').fill('Matkhau123');
        await page.locator('[data-test="login-button"]').click();
        await expect(page).toHaveURL('/');
    });

    test('Sắp xếp giá từ thấp đến cao, kiểm tra danh sách giá tăng dần', async ({ page }) => {
        await page.locator('[data-test="product-sort"]').selectOption('price_asc');

        await expect.poll(async () => {
            const priceText = await page.locator('[data-test="product-price"]').allTextContents();
            const prices = priceText.map(text => parseInt(text.replace(/\D/g, ''), 10));

            return prices.length > 0 && prices.every((price, index) => index === 0 || prices[index - 1] <= price);
        }).toBe(true);
    });

    test('Thêm rồi xóa sản phẩm, kiểm tra giỏ hàng trống', async ({ page }) => {
        await page.locator('[data-test^="add-to-cart"]').first().click();
        await page.locator('[data-test="cart-link"]').click();
        await page.locator('[data-test="remove-item"]').first().click();

        await expect(page.locator('[data-test="empty-cart"]')).toBeVisible();
        await expect(page.locator('[data-test="empty-cart"]')).toContainText('Giỏ hàng đang trống');
    });

    test('Đi hết luồng thanh toán, kiểm tra trang hoàn tất', async ({ page }) => {
        await page.locator('[data-test^="add-to-cart"]').first().click();
        await page.locator('[data-test="cart-link"]').click();
        await expect(page.locator('[data-test="cart-item"]')).toBeVisible();

        await page.locator('[data-test="checkout"]').click();
        await page.locator('[data-test="fullname"]').fill("Nguyen Van An");
        await page.locator('[data-test="phone"]').fill("0697511243");
        await page.locator('[data-test="address"]').fill("Cau Giay, Ha Noi");
        await page.locator('[data-test="place-order"]').click();

        await expect(page.locator('[data-test="order-success"]')).toBeVisible();
    });

    test('Bỏ trống họ tên khi thanh toán, kiểm tra thông báo lỗi', async ({ page }) => {
        await page.locator('[data-test^="add-to-cart"]').first().click();
        await page.locator('[data-test="cart-link"]').click();
        await expect(page.locator('[data-test="cart-item"]')).toBeVisible();

        await page.locator('[data-test="checkout"]').click();
        await page.locator('[data-test="fullname"]').fill('');
        await page.locator('[data-test="phone"]').fill("0697511243");
        await page.locator('[data-test="address"]').fill("Cau Giay, Ha Noi");
        await page.locator('[data-test="place-order"]').click();

        await expect(page.locator('[data-test="error-fullname"]')).toHaveText("Vui lòng nhập họ tên người nhận");
        await expect(page.locator('[data-test="order-succes"]')).toHaveCount(0);
    });
});
