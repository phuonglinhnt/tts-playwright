import { type Page, type Locator } from "@playwright/test";

export class CheckoutPage {
  readonly fullname: Locator;
  readonly phone: Locator;
  readonly address: Locator;
  readonly placeOrderButton: Locator;
  readonly orderSuccess: Locator;
  readonly errorFullname: Locator;
  readonly errorPhone: Locator;
  readonly errorAddress: Locator;
  readonly orderSuccessElements: Locator;

  constructor(private page: Page) {
    this.fullname = page.locator('[data-test="fullname"]');
    this.phone = page.locator('[data-test="phone"]');
    this.address = page.locator('[data-test="address"]');
    this.placeOrderButton = page.locator('[data-test="place-order"]');
    this.orderSuccess = page.locator('[data-test="order-success"]');
    this.errorFullname = page.locator('[data-test="error-fullname"]');
    this.errorPhone = page.locator('[data-test="error-phone"]');
    this.errorAddress = page.locator('[data-test="error-address"]');
    this.orderSuccessElements = page.locator('[data-test="order-success"]');
  }

  async fillShippingInfo(fullname: string, phone: string, address: string) {
    await this.fullname.fill(fullname);
    await this.phone.fill(phone);
    await this.address.fill(address);
  }

  async submitOrder() {
    await this.placeOrderButton.click();
  }
}
