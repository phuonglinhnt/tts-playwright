import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import {
  invaildCheckoutCases,
  validCheckoutCases,
} from "../../test-data/ui/inform";
import { login, addProductAndCheckout } from "../../pages/callBack";

test.describe("Mua hàng", () => {
  test.describe.configure({ mode: "serial" });
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let countErrorFullname: number;
  let countErrorPhone: number;
  let countErrorAddress: number;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await request.post("/api/test/reset");

    await login(loginPage, page);
  });

  test("Sắp xếp giá từ thấp đến cao, kiểm tra danh sách giá tăng dần", async () => {
    await productsPage.sortBy("price_asc");
    await expect
      .poll(async () => {
        const prices = await productsPage.getAllPrices();

        return (
          prices.length > 0 &&
          prices.every(
            (price, index) => index === 0 || prices[index - 1] <= price,
          )
        );
      })
      .toBe(true);
  });

  test("Thêm rồi xóa sản phẩm, kiểm tra giỏ hàng trống", async ({ page }) => {
    await productsPage.addFirstProductToCart();
    await productsPage.goToCart();
    await cartPage.removeFirstItem();

    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.emptyCartMessage).toContainText(
      "Giỏ hàng đang trống",
    );
  });

  test("Đi hết luồng thanh toán, kiểm tra trang hoàn tất", async () => {
    await productsPage.addFirstProductToCart();
    await productsPage.goToCart();
    await expect(cartPage.cartItem).toBeVisible();

    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      "Nguyen Van An",
      "0697511243",
      "Cau Giay, Ha Noi",
    );

    await checkoutPage.submitOrder();

    await expect(checkoutPage.orderSuccess).toBeVisible();
  });

  //   test("Bỏ trống họ tên khi thanh toán, kiểm tra thông báo lỗi", async ({
  //     page,
  //   }) => {
  //     await productsPage.addFirstProductToCart();
  //     await productsPage.goToCart();
  //     await expect(cartPage.cartItem).toBeVisible();

  //     await cartPage.proceedToCheckout();
  //     await checkoutPage.fillShippingInfo("", "0697511243", "Cau Giay, Ha Noi");
  //     await checkoutPage.submitOrder();

  //     await expect(checkoutPage.errorFullname).toHaveText(
  //       "Vui lòng nhập họ tên người nhận",
  //     );
  //     await expect(checkoutPage.orderSuccessElements).toHaveCount(0);
  //   });

  for (const data of validCheckoutCases) {
    test(`Đi hết luồng thanh toán - ${data.caseName}`, async () => {
      await addProductAndCheckout(
        productsPage,
        cartPage,
        checkoutPage,
        data.fullname,
        data.phone,
        data.address,
      );

      await expect(checkoutPage.orderSuccess).toBeVisible();
    });
  }

  for (const data of invaildCheckoutCases) {
    test(`Lỗi thanh toán - ${data.caseName}`, async () => {
      await addProductAndCheckout(
        productsPage,
        cartPage,
        checkoutPage,
        data.fullname,
        data.phone,
        data.address,
      );

      countErrorFullname = await checkoutPage.errorFullname.count();
      if (countErrorFullname > 0) {
        await expect(checkoutPage.errorFullname).toBeVisible();
        await expect(checkoutPage.errorFullname).toContainText(
          data.expectedError,
        );
      }

      countErrorPhone = await checkoutPage.errorPhone.count();
      if (countErrorPhone > 0) {
        await expect(checkoutPage.errorPhone).toBeVisible();
        await expect(checkoutPage.errorPhone).toContainText(data.expectedError);
      }

      countErrorAddress = await checkoutPage.errorAddress.count();
      if (countErrorAddress > 0) {
        await expect(checkoutPage.errorAddress).toBeVisible();
        await expect(checkoutPage.errorAddress).toContainText(
          data.expectedError,
        );
      }
    });
  }
  test("Tài khoản thành viên được hiển thị giảm giá 5%", async () => {
    await productsPage.addFirstProductToCart();
    await productsPage.goToCart();

    await expect(cartPage.memberNote).toBeVisible();
    await expect(cartPage.memberNote).toContainText("Bạn là thành viên");

    await expect(cartPage.discount).toBeVisible();
  });
});
