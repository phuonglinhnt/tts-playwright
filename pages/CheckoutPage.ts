import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
    readonly fullnameInput: Locator;
    readonly phoneInput: Locator;
    readonly addressInput: Locator;
    readonly placeOrderButton: Locator;
    readonly orderSuccess: Locator;
    readonly errorFullname: Locator;
    readonly orderSuccessElements: Locator;

    constructor(private page: Page) {
        this.fullnameInput = page.locator('[data-test="fullname"]');
        this.phoneInput = page.locator('[data-test="phone"]');
        this.addressInput = page.locator('[data-test="address"]');
        this.placeOrderButton = page.locator('[data-test="place-order"]');
        this.orderSuccess = page.locator('[data-test="order-success"]');
        this.errorFullname = page.locator('[data-test="error-fullname"]');
        this.orderSuccessElements = page.locator('[data-test="order-success"]');
    }

    async fillShippingInfo(fullname: string, phone: string, address: string) {
        await this.fullnameInput.fill(fullname);
        await this.phoneInput.fill(phone);
        await this.addressInput.fill(address);
    }

    async submitOrder() {
        await this.placeOrderButton.click();
    }
}