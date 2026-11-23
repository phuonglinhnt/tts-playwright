import { Page, expect } from "@playwright/test";
import { ProductsPage } from "./ProductsPage";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";
import { LoginPage } from "./LoginPage";

export async function login(
  loginPage: LoginPage,
  page: Page,
  email = "an@test.com",
  password = "Matkhau123",
) {
  await loginPage.goto();
  await loginPage.login(email, password);
  await expect(page).toHaveURL("/");
}

export async function addProductAndCheckout(
  productsPage: ProductsPage,
  cartPage: CartPage,
  checkoutPage: CheckoutPage,
  fullname: string,
  phone: string,
  address: string,
) {
  await productsPage.addFirstProductToCart();
  await productsPage.goToCart();
  await cartPage.proceedToCheckout();
  await checkoutPage.fillShippingInfo(fullname, phone, address);
  await checkoutPage.submitOrder();
}
