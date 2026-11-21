import { type Page, type Locator } from "@playwright/test";

export class OrderPage {
  readonly cancelOrderButton: Locator;
  readonly confirmCancelButton: Locator;
  readonly orderStatus: Locator;
  readonly cancelledNote: Locator;

  constructor(private page: Page) {
    this.cancelOrderButton = page.locator('[data-test="cancel-order"]');
    this.confirmCancelButton = page.locator('[data-test="confirm-cancel"]');
    this.cancelledNote = page.locator('[data-test="cancelled-note"]');
    this.orderStatus = page.locator('[data-test="order-status"]');
  }

  async cancelOrder() {
    await this.cancelOrderButton.click();
    await this.confirmCancelButton.click();
  }
}
