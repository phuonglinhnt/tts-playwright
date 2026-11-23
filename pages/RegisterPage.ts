import { type Page, type Locator } from "@playwright/test";

export class RegisterPage {
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly age: Locator;
  readonly registerButton: Locator;

  readonly errorName: Locator;
  readonly errorEmail: Locator;
  readonly errorPassword: Locator;
  readonly errorConfirmPassword: Locator;
  readonly errorAge: Locator;

  readonly registerSuccess: Locator;

  constructor(private page: Page) {
    this.name = page.locator('[data-test="name"]');
    this.email = page.locator('[data-test="email"]');
    this.password = page.locator('[data-test="password"]');
    this.confirmPassword = page.locator('[data-test="confirm-password"]');
    this.age = page.locator('[data-test="age"]');
    this.registerButton = page.locator('[data-test="register-button"]');

    this.errorName = page.locator('[data-test="error-name"]');
    this.errorEmail = page.locator('[data-test="error-email"]');
    this.errorPassword = page.locator('[data-test="error-password"]');
    this.errorConfirmPassword = page.locator(
      '[data-test="error-confirmPassword"]',
    );
    this.errorAge = page.locator('[data-test="error-age"]');

    this.registerSuccess = page.locator('[data-test="register-success"]');
  }

  async goto() {
    await this.page.goto("http://localhost:4000/register");
  }

  async fillInfo(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    age: number | string,
  ) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirmPassword.fill(confirmPassword);
    await this.age.fill(String(age));
  }

  async registerClick() {
    await this.registerButton.click();
  }
}
