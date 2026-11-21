import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";
import { LoginPage } from "../../pages/LoginPage";
import { vaildCreateCases, invalidCreateCases } from "../../test-data/ui/register";

test.describe("Đăng ký", () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let counterrorName: number;
  let counterrorEmail: number;
  let counterrorPassword: number;
  let counterrorconfirmPassword: number;
  let counterrorAge: number;

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
      await registerPage.fillInfo(
        data.name,
        data.email,
        data.password,
        data.confirmPassword,
        data.age,
      );
      await registerPage.registerClick();

      counterrorName = await registerPage.errorName.count();
      if (counterrorName > 0) {
        await expect(registerPage.errorName).toBeVisible();
        await expect(registerPage.errorName).toContainText(data.expectedError);
      }
      counterrorEmail = await registerPage.errorEmail.count();
      if (counterrorEmail > 0) {
        await expect(registerPage.errorEmail).toBeVisible();
        await expect(registerPage.errorEmail).toContainText(data.expectedError);
      }
      counterrorPassword = await registerPage.errorPassword.count();
      if (counterrorPassword > 0) {
        await expect(registerPage.errorPassword).toBeVisible();
        await expect(registerPage.errorPassword).toContainText(
          data.expectedError,
        );
      }
      counterrorconfirmPassword =
        await registerPage.errorConfirmPassword.count();
      if (counterrorconfirmPassword > 0) {
        await expect(registerPage.errorConfirmPassword).toBeVisible();
        await expect(registerPage.errorConfirmPassword).toContainText(
          data.expectedError,
        );
      }
      counterrorAge = await registerPage.errorAge.count();
      if (counterrorAge > 0) {
        await expect(registerPage.errorAge).toBeVisible();
        await expect(registerPage.errorAge).toContainText(data.expectedError);
      }
    });
  }
});
