# Dự Án Automation Testing với Playwright - Tiệm Nhà Test

Dự án kiểm thử tự động (End-to-End Testing) cho website thương mại điện tử **Tiệm Nhà Test** sử dụng framework **Playwright** và áp dụng mô hình thiết kế **Page Object Model (POM)**.

---

## 1. Yêu cầu môi trường (Prerequisites)

- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị bản LTS 20+).
- **Git**: Đã cài đặt trên máy.

---

## 2. Hướng dẫn cài đặt (Installation)

### Bước 1: Clone mã nguồn dự án về máy

```bash
git clone https://github.com/phuonglinhnt/tts-playwright.git
cd tts-playwright
```

### Bước 2: Cài đặt các thư viện phụ thuộc

```bash
npm install
```

### Bước 3: Cài đặt trình duyệt cho Playwright (nếu chạy lần đầu)

```bash
npx playwright install chromium
```

---

## 3. Khởi động Website kiểm thử (Tiệm Nhà Test)

Dự án đã được cấu hình `webServer` trong `playwright.config.ts` để **tự động khởi động** website Tiệm Nhà Test (nằm ở thư mục `./tiem-nha-test`) mỗi khi chạy test.

_(Nếu muốn tự khởi động thủ công: chuyển sang thư mục `tiem-nha-test` và chạy `npm start`, website sẽ chạy ở `http://localhost:4000`)._

---

## 4. Hướng dẫn chạy kiểm thử (Running Tests)

| Mục đích                                                           | Câu lệnh                                     |
| :----------------------------------------------------------------- | :------------------------------------------- |
| **Chạy toàn bộ test (chế độ ngầm - headless)**                     | `npx playwright test`                        |
| **Chạy hiển thị trình duyệt xem trực tiếp**                        | `npx playwright test --headed`               |
| **Chạy với giao diện trực quan (UI Mode - Khuyên dùng khi debug)** | `npx playwright test --ui`                   |
| **Chạy riêng bài test đăng nhập**                                  | `npx playwright test tests/login.spec.ts`    |
| **Chạy riêng bài test mua hàng**                                   | `npx playwright test tests/shopping.spec.ts` |
| **Mở báo cáo kết quả kiểm thử (HTML Report)**                      | `npx playwright show-report`                 |

---

## 5. Cấu trúc thư mục dự án (Project Structure)

Dự án áp dụng mô hình **Page Object Model (POM)** để phân tách rõ ràng giữa định vị phần tử, logic thao tác và kịch bản test:

```text
tts-playwright/
├── pages/                  # Chứa các Page Object (quản lý locator & hành động của từng trang)
│   ├── LoginPage.ts        # Quản lý trang Đăng nhập
│   ├── ProductsPage.ts     # Quản lý trang Danh sách sản phẩm
│   ├── CartPage.ts         # Quản lý trang Giỏ hàng
│   └── CheckoutPage.ts     # Quản lý trang Thanh toán / Đặt hàng
├── tests/                  # Chứa các file kịch bản kiểm thử (Test specs)
│   ├── login.spec.ts       # Test luồng đăng nhập (áp dụng Data-Driven Testing)
│   └── shopping.spec.ts    # Test luồng giỏ hàng, thanh toán và sắp xếp
├── test-data/              # Dữ liệu kiểm thử dùng chung
│   └── users.ts            # Dữ liệu tài khoản mẫu & các trường hợp lỗi
├── playwright.config.ts    # Cấu hình Playwright (baseURL, webServer, timeout, reporter)
└── README.md               # Hướng dẫn cài đặt và chạy test
```

---

## 6. Các kỹ thuật áp dụng trong dự án

- **Page Object Model (POM):** Toàn bộ `locator` được đóng gói trong các class `pages/`, không viết trực tiếp locator trong file test.
- **Data-Driven Testing:** Tự động lặp qua nhiều bộ dữ liệu (`invalidLoginCases` trong `test-data/users.ts`) để kiểm thử validation lỗi.
- **Auto-retry & expect.poll:** Tránh hoàn toàn việc sử dụng `waitForTimeout`, đảm bảo kiểm thử chạy nhanh và ổn định.
