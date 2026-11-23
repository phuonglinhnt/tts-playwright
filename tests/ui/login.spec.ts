import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { invalidLoginCases } from "../../test-data/ui/users";

test.describe("Đăng nhập", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("Đăng nhập thành công với an@test.com", async ({ page }) => {
    await loginPage.login("an@test.com", "Matkhau123");

    await expect(loginPage.userName).toHaveText("Nguyễn Văn An");
    await expect(page).toHaveURL("/");
    await expect(loginPage.logout).toBeVisible();
  });

  test("Đăng nhập bằng khoa@test.com, kiểm tra thông báo lỗi", async ({
    page,
  }) => {
    await loginPage.login("khoa@test.com", "Matkhau123");

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText("Tài khoản đã bị khóa");
  });

  test("Để trống mật khẩu, kiểm tra thông báo lỗi", async ({ page }) => {
    await loginPage.login("an@test.com", "");

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText("Vui lòng nhập mật khẩu");
  });

  for (const data of invalidLoginCases) {
    test(`Đăng nhập thất bại - ${data.caseName}`, async () => {
      await loginPage.login(data.email, data.password);

      await expect(loginPage.error).toBeVisible();
      await expect(loginPage.error).toContainText(data.expectedError);
    });
  }
});
