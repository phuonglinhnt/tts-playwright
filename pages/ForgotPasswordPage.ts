import { type Page, type Locator } from "@playwright/test";

export class ForgotPasswordPage {
  readonly email: Locator;
  readonly sendButton: Locator;
  readonly success: Locator;
  readonly error: Locator;

  constructor(private page: Page) {
    this.email = page.locator('[data-test="email"]');
    this.sendButton = page.locator('[data-test="send-button"]');
    this.success = page.locator('[data-test="success"]');
    this.error = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto("/forgot-password");
  }

  async sendEmail(email: string) {
    await this.email.fill(email);
    await this.sendButton.click();
  }
}
