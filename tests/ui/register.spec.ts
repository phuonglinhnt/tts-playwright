import { test, expect, Locator } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";
import { LoginPage } from "../../pages/LoginPage";
import { validCreateCases, invalidCreateCases } from "../../test-data/ui/register";

test.describe("UI-Đăng ký", () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);

    await request.post("/api/test/reset");

    await registerPage.goto();
  });

  for (const data of validCreateCases) {
    test(`Đi hết luồng đăng kí thành công - ${data.caseName}`, async ({
      page,
    }) => {
      if (data.bug) {
        test.info().annotations.push({
          type: "issue",
          description: data.bug,
        });
      }
      await registerPage.fillInfo(
        data.name,
        data.email,
        data.password,
        data.confirmPassword,
        data.age,
      );

      await registerPage.registerClick();

      await expect(page).toHaveURL("/login");
      await expect(registerPage.registerSuccess).toBeVisible();
    });
  }

  for (const data of invalidCreateCases) {
    test(`Lỗi đăng ký - ${data.caseName}`, async ({ page }) => {
      if (data.bug) {
        test.info().annotations.push({
          type: "issue",
          description: data.bug,
        });
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
