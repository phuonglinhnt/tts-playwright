import { test, expect } from "@playwright/test";
import {
  validCheckoutApiCases,
  invalidCheckoutApiCases,
} from "../../test-data/api/inform_api";
import { getToken } from "./callBackApi";

test.describe("Mua hàng_API", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");
  });
  for (const data of validCheckoutApiCases) {
    test(`Đi hết luồng thanh toán - ${data.caseName}`, async ({ request }) => {
      const token = await getToken(request);
      await request.post("/api/cart/items", {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 },
      });
      const res = await request.post("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          fullname: data.fullname,
          phone: data.phone,
          address: data.address,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      expect(resBody.id).toBeTruthy();
      expect(resBody.status).toBe("NEW");
      expect(resBody.fullname).toBe(data.fullname);

    });
  }

  for (const data of invalidCheckoutApiCases) {
    test(`Lỗi thanh toán - ${data.caseName}`, async ({ request }) => {
      const token = await getToken(request);
      await request.post("/api/cart/items", {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 },
      });
      const res = await request.post("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          fullname: data.fullname,
          phone: data.phone,
          address: data.address,
        },
      });
      expect(res.status()).toBe(data.expectedStatus);
      const resBody = await res.json();
      if (data.expectedMessage) {
        const errorValues = Object.values(resBody.errors || {});
        expect(errorValues).toContain(data.expectedMessage);
      }
    });
  }
});
