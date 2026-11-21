import { type Page, type Locator } from "@playwright/test";

export class ProductsPage {
  readonly sortSelect: Locator;
  readonly productPrices: Locator;
  readonly addToCartButton: Locator;
  readonly cartLink: Locator;
  readonly searchInput: Locator;
  readonly productName: Locator;
  readonly emptyResult: Locator;

  constructor(private page: Page) {
    this.sortSelect = page.locator('[data-test="product-sort"]');
    this.productPrices = page.locator('[data-test="product-price"]');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.cartLink = page.locator('[data-test="cart-link"]');
    this.searchInput = page.locator('[data-test="search"]');
    this.productName = page.locator('[data-test="product-name"]');
    this.emptyResult = page.locator('[data-test="empty-result"]');
  }

  async sortBy(option: string) {
    await this.sortSelect.selectOption("price_asc");
  }

  async getAllPrices(): Promise<number[]> {
    const priceTexts = await this.productPrices.allTextContents();
    return priceTexts.map((text) => parseInt(text.replace(/\D/g, ""), 10));
  }

  async addFirstProductToCart() {
    await this.addToCartButton.first().click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
  }
}
