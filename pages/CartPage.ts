import { type Page, type Locator } from "@playwright/test";

export class CartPage {
  readonly cartItem: Locator;
  readonly removeButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly checkoutButton: Locator;
  readonly discount: Locator;
  readonly memberNote: Locator;

  constructor(private page: Page) {
    this.cartItem = page.locator('[data-test="cart-item"]');
    this.removeButton = page.locator('[data-test="remove-item"]');
    this.emptyCartMessage = page.locator('[data-test="empty-cart"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.discount = page.locator('[data-test="discount"]');
    this.memberNote = page.locator('[data-test="member-note"]');
  }

  async removeFirstItem() {
    await this.removeButton.first().click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
