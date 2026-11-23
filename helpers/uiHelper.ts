import { Page, expect } from "@playwright/test";
import { ProductsPage } from "../pages/ProductsPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { LoginPage } from "../pages/LoginPage";

export async function login(
    page: Page,
    email = "an@test.com",
    password = "Matkhau123",
) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await expect(page).toHaveURL("/");
}

export async function addProductAndCheckout(
    page: Page,
    fullname: string,
    phone: string,
    address: string,
) {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    await productsPage.addFirstProductToCart();
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(fullname, phone, address);
    await checkoutPage.submitOrder();
}