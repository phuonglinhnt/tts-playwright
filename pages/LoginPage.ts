import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
    readonly email: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly error: Locator;
    readonly logout: Locator;
    readonly userName: Locator;

    constructor(private page: Page) {
        // Khởi tạo các locator
        this.email = page.locator('[data-test="email"]');
        this.password = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.logout = page.locator('[data-test="logout"]');
        this.userName = page.locator('[data-test="user-name"]');
        this.error = page.locator('[data-test="error"]');
    }
    // Điều hướng tới trang đăng nhập
    async goto() {
        await this.page.goto('http://localhost:4000/login');
    }
    // Hành động đăng nhập gom chung
    async login(email: string, password: string) {
        await this.email.fill(email);
        await this.password.fill(password);
        await this.loginButton.click();
    }

}