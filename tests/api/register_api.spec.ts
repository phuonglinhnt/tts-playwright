import { test, expect } from "@playwright/test";
import {
  vaildCreateApiCases,
  invalidCreateApiCases,
} from "../../test-data/api/register_api";

test.describe("Đăng ký API", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");
  });

  for (const data of vaildCreateApiCases) {
    test(`Đi hết luồng đăng kí thành công - ${data.caseName}`, async ({
      request,
    }) => {
      if (data.bug) {
        test.fail(true, data.bug);
      }
      const res = await request.post("/api/auth/register", {
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          age: data.age,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      expect(resBody).toBeDefined();
      expect(resBody.user.role).toBe("customer");
    });
  }

  for (const data of invalidCreateApiCases) {
    test(`Lỗi đăng ký - ${data.caseName}`, async ({ request }) => {
      if (data.bug) {
        test.fail(true, data.bug);
      }
      const res = await request.post("/api/auth/register", {
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          age: data.age,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      if (data.expectedError) {
        const allErrors = Object.values(resBody.errors || {}).flat().concat(resBody.message || "");
        expect(allErrors).toContain(data.expectedError);
      }
    });
  }
});
