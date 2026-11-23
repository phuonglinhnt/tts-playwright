import { test, expect } from "@playwright/test";
import {
  invalidLoginAPICases,
  validLoginApiCases,
} from "../../test-data/api/users_api";

test.describe("API-Đăng nhập", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");
  });

  for (const data of validLoginApiCases) {
    test(`API Đăng nhập thành công - ${data.caseName}`, async ({ request }) => {
      const res = await request.post("/api/auth/login", {
        data: {
          email: data.email,
          password: data.password,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      expect(resBody.token).toBeTruthy();
    });
  }

  for (const data of invalidLoginAPICases) {
    test(`API đăng nhập lỗi - ${data.caseName}`, async ({ request }) => {
      const res = await request.post("/api/auth/login", {
        data: {
          email: data.email,
          password: data.password,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      expect(resBody.message).toBe(data.expectedMessage);
    });
  }
});
