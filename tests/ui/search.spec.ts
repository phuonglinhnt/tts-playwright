import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { login } from "../../pages/callBack";

test.describe("Tìm kiếm sản phẩm", () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);

    await login(loginPage, page);
  });

  test("Tìm kiếm thấy sản phẩm khớp với từ khóa", async () => {
    await productsPage.search("Áo");

    await expect.poll(async () => {
      const names = await productsPage.productName.allTextContents();
      return names.every(name => name.toLowerCase().includes("áo"));
    }).toBeTruthy();
  });

  test("Hiển thị thông báo khi không tìm thấy sản phẩm nào", async ({
    page,
  }) => {
    await productsPage.search("sanpham");

    await expect(productsPage.emptyResult).toBeVisible();

  });
});
