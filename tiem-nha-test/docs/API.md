# Tài liệu API: Tiệm Nhà Test

Địa chỉ gốc: `http://localhost:4000/api`

Dữ liệu gửi và nhận ở dạng JSON. Với request có body, gửi header `Content-Type: application/json`.

## Xác thực

1. Gọi `POST /auth/login` để lấy `token`.
2. Gửi kèm header `Authorization: Bearer <token>` ở mọi request cần đăng nhập (đánh dấu 🔒).

Thiếu hoặc sai token: `401`. Đã đăng nhập nhưng không có quyền: `403`.

Mọi lỗi trả về dạng:

```json
{ "message": "Mô tả lỗi", "errors": { "tenTruong": "Lỗi của trường này" } }
```

`errors` chỉ có khi lỗi gắn với từng trường dữ liệu.

## Tóm tắt

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/health` | Kiểm tra server đang chạy |
| POST | `/test/reset` | Đặt lại toàn bộ dữ liệu mẫu |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/logout` 🔒 | Đăng xuất |
| GET | `/me` 🔒 | Thông tin người đang đăng nhập |
| GET | `/products` 🔒 | Danh sách sản phẩm |
| GET | `/products/{id}` 🔒 | Chi tiết sản phẩm |
| GET | `/products/{id}/reviews` 🔒 | Đánh giá của sản phẩm |
| GET | `/cart` 🔒 | Xem giỏ hàng |
| POST | `/cart/items` 🔒 | Thêm sản phẩm vào giỏ |
| PATCH | `/cart/items/{productId}` 🔒 | Đổi số lượng |
| DELETE | `/cart/items/{productId}` 🔒 | Xóa một sản phẩm khỏi giỏ |
| DELETE | `/cart` 🔒 | Xóa toàn bộ giỏ |
| POST | `/orders` 🔒 | Đặt hàng từ giỏ hiện tại |
| GET | `/orders` 🔒 | Danh sách đơn hàng |
| GET | `/orders/{id}` 🔒 | Chi tiết đơn hàng |
| PATCH | `/orders/{id}/status` 🔒 | Đổi trạng thái đơn |
| DELETE | `/orders/{id}` 🔒 | Xóa đơn (chỉ quản trị viên) |

---

## Hệ thống

### GET /health
`200` `{ "status": "ok" }`

### POST /test/reset
Xóa toàn bộ dữ liệu và tạo lại dữ liệu mẫu. Không cần đăng nhập. Mọi token cũ đều hết hiệu lực.
`204` không có body.

## Tài khoản

### POST /auth/login

```json
{ "email": "an@test.com", "password": "Matkhau123" }
```

`200`
```json
{
  "token": "3f9c…",
  "user": { "id": 1, "email": "an@test.com", "name": "Nguyễn Văn An", "age": 25,
            "isMember": true, "role": "customer", "mode": "standard" }
}
```

| Mã | Khi nào |
|---|---|
| 400 | Thiếu email hoặc mật khẩu |
| 401 | Sai email hoặc mật khẩu |
| 403 | Tài khoản bị khóa, hoặc tạm khóa do nhập sai 5 lần |

### POST /auth/register

```json
{ "name": "Lê Thu", "email": "thu@test.com", "password": "Matkhau123",
  "confirmPassword": "Matkhau123", "age": 22 }
```

`confirmPassword` không bắt buộc ở API; nếu gửi thì phải khớp `password`.

`201` `{ "user": { … } }`

| Mã | Khi nào |
|---|---|
| 400 | Dữ liệu không hợp lệ, xem `errors` |
| 409 | Email đã được sử dụng |

### POST /auth/forgot-password
`{ "email": "an@test.com" }` → `200` `{ "message": "…" }`. Email trống hoặc sai định dạng: `400`.

### POST /auth/logout 🔒
`204`. Token hiện tại hết hiệu lực: dùng lại token này sẽ nhận `401`.

### GET /me 🔒
`200` thông tin người dùng như trong phản hồi đăng nhập.

## Sản phẩm

### GET /products 🔒

| Tham số | Giá trị |
|---|---|
| `sort` | `name_asc` (mặc định), `name_desc`, `price_asc`, `price_desc` |
| `q` | Từ khóa tìm theo tên |

`200`
```json
[
  { "id": 1, "slug": "ao-thun-basic", "name": "Áo thun basic", "price": 199000,
    "stock": 20, "inStock": true, "color": "#3B6FD8", "icon": "👕",
    "description": "…" }
]
```
`sort` không hợp lệ: `400`.

### GET /products/{id} 🔒
`200` một sản phẩm. `id` không phải số nguyên dương: `400`. Không tồn tại: `404`.

### GET /products/{id}/reviews 🔒
`200` `[ { "author": "Hà", "rating": 5, "text": "…" } ]`. Không tìm thấy: `404`.

## Giỏ hàng

Mọi API giỏ hàng (trừ DELETE) trả về toàn bộ giỏ:

```json
{
  "items": [
    { "productId": 1, "slug": "ao-thun-basic", "name": "Áo thun basic", "price": 199000,
      "stock": 20, "quantity": 2, "lineTotal": 398000, "color": "…", "icon": "👕" }
  ],
  "itemCount": 2,
  "subtotal": 398000,
  "discountRate": 5,
  "discount": 19900,
  "total": 378100
}
```

### GET /cart 🔒
`200`

### POST /cart/items 🔒
`{ "productId": 1, "quantity": 2 }`. Bỏ `quantity` thì mặc định là 1. Sản phẩm đã có trong giỏ thì cộng dồn số lượng.

| Mã | Khi nào |
|---|---|
| 201 | Thêm thành công |
| 400 | Thiếu `productId`, sản phẩm hết hàng, vượt tồn kho, số lượng không hợp lệ |
| 404 | Không tìm thấy sản phẩm |

### PATCH /cart/items/{productId} 🔒
`{ "quantity": 3 }`. `200` giỏ hàng. Số lượng không hợp lệ hoặc vượt tồn kho: `400`. Sản phẩm không có trong giỏ: `404`.

### DELETE /cart/items/{productId} 🔒
`204`. Sản phẩm không có trong giỏ: `404`.

### DELETE /cart 🔒
`204`.

## Đơn hàng

Một đơn hàng:

```json
{
  "id": 7, "userId": 1, "customerEmail": "an@test.com",
  "status": "NEW", "statusLabel": "Mới",
  "subtotal": 398000, "discount": 19900, "total": 378100,
  "fullname": "Nguyễn Văn An", "phone": "0901234567", "address": "12 Nguyễn Huệ, Quận 1",
  "createdAt": "2026-10-16 08:30:00", "updatedAt": "2026-10-16 08:30:00",
  "items": [ { "productId": 1, "name": "Áo thun basic", "price": 199000, "quantity": 2, "lineTotal": 398000 } ]
}
```

Thời gian lưu theo giờ UTC.

Trạng thái: `NEW` (Mới), `CONFIRMED` (Đã xác nhận), `SHIPPING` (Đang giao), ` ` (Đã giao), `CANCELLED` (Đã hủy).

### POST /orders 🔒
Tạo đơn từ giỏ hàng hiện tại, sau đó làm trống giỏ.
```json
{ "fullname": "Nguyễn Văn An", "phone": "0901234567", "address": "12 Nguyễn Huệ, Quận 1" }
```

| Mã | Khi nào |
|---|---|
| 201 | Đặt hàng thành công, trả về đơn hàng |
| 400 | Thiếu hoặc sai thông tin giao hàng (xem `errors`), giỏ hàng trống |

### GET /orders 🔒
Khách hàng: đơn của mình. Quản trị viên: mọi đơn.

| Tham số | Giá trị |
|---|---|
| `status` | Lọc theo trạng thái, ví dụ `NEW` |
| `q` | Tìm đơn có chứa sản phẩm mà tên khớp từ khóa |

### GET /orders/{id} 🔒
`200` đơn hàng. `404` nếu không tồn tại.

### PATCH /orders/{id}/status 🔒
`{ "status": "CANCELLED" }`

| Mã | Khi nào |
|---|---|
| 200 | Đổi thành công, trả về đơn hàng |
| 400 | Trạng thái không hợp lệ, hoặc không được phép chuyển từ trạng thái hiện tại |
| 403 | Khách hàng đổi đơn của người khác, hoặc đổi sang trạng thái khác `CANCELLED` |
| 404 | Không tìm thấy đơn |

### DELETE /orders/{id} 🔒 (quản trị viên)
`204`. Không phải quản trị viên: `403`. Không tìm thấy: `404`.
