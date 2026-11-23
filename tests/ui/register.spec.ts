import { test, expect, Locator } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";
import { LoginPage } from "../../pages/LoginPage";
import { vaildCreateCases, invalidCreateCases } from "../../test-data/ui/register";

test.describe("Đăng ký", () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);

    await request.post("/api/test/reset");

    await registerPage.goto();
  });

  for (const data of vaildCreateCases) {
    test(`Đi hết luồng đăng kí thành công - ${data.caseName}`, async ({
      page,
    }) => {
      if (data.bug) {
        test.fail(true, data.bug);
      }
      await registerPage.fillInfo(
        data.name,
        data.email,
        data.password,
        data.confirmPassword,
        data.age,
      );

      await registerPage.registerClick();

      await expect(page).toHaveURL("http://localhost:4000/login");
      await expect(registerPage.registerSuccess).toBeVisible();
    });
  }

  for (const data of invalidCreateCases) {
    test(`Lỗi đăng ký - ${data.caseName}`, async ({ page }) => {
      if (data.bug) {
        test.fail(true, data.bug);
      }
      await registerPage.fillInfo(
        data.name,
        data.email,
        data.password,
        data.confirmPassword,
        data.age,
      );
      await registerPage.registerClick();

      const targetError = registerPage[data.errorField as keyof RegisterPage] as Locator;

      await expect(targetError).toBeVisible();
      await expect(targetError).toContainText(data.expectedError);


    });
  }
});
