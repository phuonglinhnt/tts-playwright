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

    await expect(productsPage.productName.first()).toBeVisible();

    const names = await productsPage.productName.allTextContents();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain("áo");
    }
  });

  test("Hiển thị thông báo khi không tìm thấy sản phẩm nào", async ({
    page,
  }) => {
    await productsPage.search("sanpham");

    await expect(productsPage.emptyResult).toBeVisible();
    await expect(productsPage.emptyResult).toContainText(
      "Thử từ khóa ngắn hơn hoặc kiểm tra lại chính tả.",
    );
    await expect(page.getByText("0 sản phẩm")).toBeVisible();
  });
});
