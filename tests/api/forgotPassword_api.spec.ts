import { test, expect } from "@playwright/test";
import { forgotPasswordApiCases } from "../../test-data/api/forgot_password_api";

test.describe("Quên mật khẩu", () => {
  for (const data of forgotPasswordApiCases) {
    test(`QUên mật khẩu - ${data.caseName}`, async ({ request }) => {
      const res = await request.post("/api/auth/forgot-password", {
        data: {
          email: data.email,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      expect(resBody.message).toBe(data.expectedMessage);
    });
  }
});
