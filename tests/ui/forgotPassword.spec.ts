import { test, expect } from "@playwright/test";
import { ForgotPasswordPage } from "../../pages/ForgotPasswordPage";

test.describe("Quên mật khẩu", () => {
  let forgotPassword: ForgotPasswordPage;
  test.beforeEach(async ({ page }) => {
    forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
  });

  test("Gửi yêu cầu thành công với email hợp lệ", async () => {
    await forgotPassword.sendEmail("an@test.com");
    await expect(forgotPassword.success).toBeVisible();
    await expect(forgotPassword.success).toContainText(
      "Nếu email đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
    );
  });

  test("Báo lỗi khi gửi email sai định dạng", async () => {
    await forgotPassword.sendEmail("email_sai_dinh_dang");
    await expect(forgotPassword.error).toBeVisible();
    await expect(forgotPassword.error).toContainText(
      "Email không đúng định dạng",
    );
  });
});
