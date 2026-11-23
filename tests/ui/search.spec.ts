import { test, expect } from "@playwright/test";
import { ProductsPage } from "../../pages/ProductsPage";
import { login } from "../../helpers/uiHelper";

test.describe("UI - Tìm kiếm sản phẩm", () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);

    await login(page);
  });

  test("Tìm kiếm thấy sản phẩm khớp với từ khóa", async () => {
    await productsPage.search("Áo");

    await expect.poll(async () => {
      const names = await productsPage.productName.allTextContents();
      return names.length > 0 && names.every((name) => name.toLowerCase().includes("áo"));
    }).toBe(true);
  });

  test("Hiển thị thông báo khi không tìm thấy sản phẩm nào", async () => {
    await productsPage.search("sanpham");

    await expect(productsPage.emptyResult).toBeVisible();
  });
});

