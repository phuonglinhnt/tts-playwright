# Tiệm Nhà Test

Website bán hàng mẫu để thực tập sinh luyện kiểm thử: test thủ công, báo bug, test API, SQL và automation.

Website **có cài sẵn một số lỗi**. Nhiệm vụ của bạn là tìm ra, báo cáo, và viết test để chúng không quay lại. Kết quả mong đợi của mọi chức năng nằm trong [docs/YEU_CAU.md](docs/YEU_CAU.md). Thấy website chạy khác tài liệu yêu cầu thì đó là bug.

## Cài đặt và chạy

Cần Node.js bản LTS (20 trở lên).

```bash
npm install
npm start
```

Mở http://localhost:4000. Lệnh `npm start` sẽ build giao diện rồi chạy server, giao diện và API dùng chung cổng 4000.

| Lệnh | Tác dụng |
|---|---|
| `npm start` | Build giao diện và chạy website ở cổng 4000 |
| `npm run serve` | Chạy lại server mà không build (khi đã build trước đó) |
| `npm run dev` | Chế độ phát triển: giao diện ở cổng 5173, tự tải lại khi sửa code |
| `npm run reset` | Xóa toàn bộ dữ liệu, tạo lại dữ liệu mẫu |

Đổi cổng: `PORT=4500 npm start` (Windows PowerShell: `$env:PORT=4500; npm start`).

## Tài khoản thử nghiệm

Mật khẩu chung cho mọi tài khoản: `Matkhau123`

| Email | Đặc điểm |
|---|---|
| an@test.com | Khách hàng, là thành viên |
| binh@test.com | Khách hàng, chưa là thành viên |
| khoa@test.com | Tài khoản đã bị khóa |
| loi@test.com | Khách hàng, là thành viên. Tài khoản này có một số hành vi khác thường |
| admin@test.com | Quản trị viên: xem mọi đơn hàng, đổi trạng thái đơn |

Bạn cũng có thể tự tạo tài khoản ở trang Đăng ký.

## Các trang

| Đường dẫn | Nội dung |
|---|---|
| `/login`, `/register`, `/forgot-password` | Đăng nhập, đăng ký, quên mật khẩu |
| `/` | Danh sách sản phẩm: tìm kiếm, sắp xếp, thêm vào giỏ |
| `/products/:id` | Chi tiết sản phẩm, chọn số lượng, đánh giá |
| `/cart` | Giỏ hàng, đổi số lượng, giảm giá |
| `/checkout` | Nhập thông tin giao hàng, đặt hàng |
| `/orders`, `/orders/:id` | Danh sách đơn hàng (tìm theo tên sản phẩm), chi tiết đơn, hủy đơn |
| `/admin/orders` | Quản lý đơn hàng (chỉ quản trị viên) |

## API

Toàn bộ API nằm dưới `http://localhost:4000/api`. Xem chi tiết từng endpoint, dữ liệu gửi và nhận, mã trạng thái trong [docs/API.md](docs/API.md).

Đăng nhập bằng `POST /api/auth/login` để lấy `token`, rồi gửi kèm header `Authorization: Bearer <token>` ở các request sau.

## Đặt lại dữ liệu

Dữ liệu dùng chung cho mọi người đang dùng cùng một server. Khi cần trạng thái sạch:

- Chạy `npm run reset`, hoặc
- Gọi `POST /api/test/reset` (không cần đăng nhập). Rất tiện để gọi trong `beforeEach` của test automation.

## Cơ sở dữ liệu

Website dùng SQLite, file nằm ở `data/shop.db`. Mở bằng [DB Browser for SQLite](https://sqlitebrowser.org/), DBeaver, hoặc lệnh `sqlite3 data/shop.db`.

Các bảng: `users`, `products`, `cart_items`, `orders`, `order_items`, `sessions`.

```sql
-- Đơn hàng mới nhất của khách an@test.com
SELECT o.id, o.total, o.status, o.created_at
FROM orders o JOIN users u ON u.id = o.user_id
WHERE u.email = 'an@test.com'
ORDER BY o.created_at DESC;

-- Đếm đơn theo trạng thái
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

Chỉ dùng SELECT để kiểm tra dữ liệu. Muốn đưa dữ liệu về ban đầu thì dùng lệnh reset, đừng sửa tay trong database.

## Gợi ý cho automation

Mọi phần tử quan trọng đều có thuộc tính `data-test`, ví dụ `data-test="email"`, `data-test="login-button"`, `data-test="add-to-cart-ao-thun-basic"`, `data-test="cart-badge"`. Mở DevTools để xem tên thuộc tính của từng phần tử.

Cấu hình Playwright gợi ý (`playwright.config.ts` trong repo test của bạn):

```ts
export default defineConfig({
  use: {
    baseURL: 'http://localhost:4000',
    testIdAttribute: 'data-test',   // để dùng page.getByTestId('login-button')
  },
  // Tự khởi động website khi chạy test, kể cả trên CI.
  // Sửa đường dẫn cho đúng nơi bạn đặt thư mục tiem-nha-test.
  webServer: {
    command: 'npm ci && npm start',
    cwd: '../tiem-nha-test',
    url: 'http://localhost:4000/api/health',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

## Website này dùng cho tuần nào?

| Tuần | Luyện gì trên website |
|---|---|
| 1 | Phân tích yêu cầu, viết test case cho đăng nhập, đăng ký (tuổi, mật khẩu), số lượng 1–10, bảng giảm giá, vòng đời đơn hàng |
| 2 | Chạy test case, báo bug, DevTools (Console, Network), Postman với API, SQL với `data/shop.db` |
| 3 | Viết automation bằng Playwright cho giao diện và API, chạy trên CI |
| 4 | Dự án tổng kết: test plan, phân tích rủi ro, RTM theo mã yêu cầu trong docs/YEU_CAU.md |
| Nâng cao | Một số lỗi chỉ lộ ra khi test theo chuỗi thao tác, nhiều người dùng cùng lúc, gửi request thẳng qua API, đối chiếu database, test bảo mật, test tải, đổi múi giờ hoặc màn hình nhỏ |
