import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { OrderPage } from "../../pages/OrderPage";

test.describe("Hủy đơn hàng", () => {
  test.describe.configure({ mode: "serial" });
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let orderPage: OrderPage;
  test.beforeEach(async ({ page, request }) => {
    await request.post("/api/test/reset");
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    orderPage = new OrderPage(page);

    await loginPage.goto();
    await loginPage.login("an@test.com", "Matkhau123");
    await expect(page).toHaveURL("/");
  });
  test("Người dùng mua hàng rồi tự hủy đơn hàng thành công trên giao diện", async () => {
    test.fail(true, "INTERN-18: Banner 'Đặt hàng thành công' vẫn còn hiển thị khi đã hủy đơn");
    await productsPage.addFirstProductToCart();
    await productsPage.goToCart();

    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      "Nguyen Van An",
      "0901234567",
      "Cau Giay, Ha Noi",
    );
    await checkoutPage.submitOrder();
    await expect(orderPage.orderSuccess).toBeVisible();

    await orderPage.cancelOrder();
    await expect(orderPage.cancelledNote).toBeVisible();
    await expect(orderPage.cancelledNote).toHaveText("Đơn hàng này đã bị hủy.");
    await expect(orderPage.orderSuccess).not.toBeVisible();
  });
});
