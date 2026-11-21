import { test, expect } from "@playwright/test";
import { getToken } from "./callBackApi";

test.describe("Tìm kiếm sản phẩm", () => {
  let token: string;
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");

    token = await getToken(request);
  });

  test("Tìm kiếm thành công với từ khóa 'Áo'", async ({ request }) => {
    const res = await request.get("/api/products?q=Áo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);

    for (const p of products) {
      expect(p.name.toLowerCase()).toContain("áo");
    }
  });

  test("Tìm kiếm từ khóa không tồn tại trả về mảng rỗng []", async ({
    request,
  }) => {
    const res = await request.get("/api/products?q=khong_co_that_999", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const products = await res.json();
    expect(products).toEqual([]);
    expect(products.length).toBe(0);
  });

  test("Lỗi khi tìm kiếm sản phẩm mà không truyền token", async ({
    request,
  }) => {
    const res = await request.get("/api/products?q=Áo");
    expect(res.status()).toBe(401);
  });
});
