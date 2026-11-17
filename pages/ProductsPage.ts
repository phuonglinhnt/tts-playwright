import { type Page, type Locator } from '@playwright/test';

export class ProductsPage {
    readonly sortSelect: Locator;
    readonly productPrices: Locator;
    readonly addToCartButton: Locator;
    readonly cartLink: Locator;

    constructor(private page: Page) {
        this.sortSelect = page.locator('[data-test="product-sort"]');
        this.productPrices = page.locator('[data-test="product-price"]');
        this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
        this.cartLink = page.locator('[data-test="cart-link"]');
    }

    async sortBy(option: string) {
        await this.sortSelect.selectOption('price_asc');
    }

    async getAllPrices(): Promise<number[]> {
        const priceTexts = await this.productPrices.allTextContents();
        return priceTexts.map(text => parseInt(text.replace(/\D/g, ''), 10));
    }

    async addFirstProductToCart() {
        await this.addToCartButton.first().click();
    }

    async goToCart() {
        await this.cartLink.click();
    }
}