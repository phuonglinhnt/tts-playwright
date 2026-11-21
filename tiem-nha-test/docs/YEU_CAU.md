# Tài liệu yêu cầu: Tiệm Nhà Test

Tài liệu này mô tả website **phải** hoạt động thế nào. Dùng nó làm kết quả mong đợi khi viết test case. Mỗi yêu cầu có một mã (YC-xx) để dùng trong ma trận truy vết (RTM).

Tài liệu được viết có chủ đích chưa hoàn hảo: có chỗ còn mơ hồ hoặc thiếu. Khi gặp, hãy ghi lại câu hỏi để hỏi BA (mentor), đừng tự đoán.

## 1. Tài khoản

### Đăng nhập

| Mã | Yêu cầu |
|---|---|
| YC-01 | Người dùng đăng nhập bằng email và mật khẩu. Email không phân biệt chữ hoa, chữ thường. Khoảng trắng ở đầu và cuối email được bỏ qua. |
| YC-02 | Nhập sai email hoặc mật khẩu thì hiện thông báo "Email hoặc mật khẩu không đúng". Cả nội dung thông báo lẫn thời gian phản hồi đều không được để lộ email đó có tồn tại trong hệ thống hay không. |
| YC-03 | Để trống email hoặc mật khẩu thì hiện thông báo yêu cầu nhập, không gửi lên server. |
| YC-04 | Nhập sai mật khẩu 5 lần liên tiếp thì tài khoản bị tạm khóa 15 phút. Đăng nhập đúng thì bộ đếm số lần sai được đặt lại. |
| YC-05 | Tài khoản bị khóa không đăng nhập được và nhận thông báo rõ ràng. |
| YC-06 | Có ô "Ghi nhớ đăng nhập". Nếu chọn, người dùng vẫn đăng nhập sau khi đóng hẳn trình duyệt rồi mở lại. Nếu không chọn, đóng trình duyệt là phải đăng nhập lại. |
| YC-07 | Có nút Hiện/Ẩn mật khẩu. |
| YC-08 | Nhấn Enter trong ô mật khẩu có tác dụng như bấm nút Đăng nhập. |
| YC-09 | Đăng xuất thì phiên đăng nhập hết hiệu lực ngay. Token cũ không dùng lại được, kể cả khi gửi thẳng qua API. |

### Đăng ký

| Mã | Yêu cầu |
|---|---|
| YC-10 | Họ tên bắt buộc, tối đa 50 ký tự. |
| YC-11 | Email bắt buộc, đúng định dạng, và chưa được tài khoản nào dùng. |
| YC-12 | Mật khẩu dài từ 8 đến 20 ký tự, có ít nhất 1 chữ hoa và 1 chữ số. |
| YC-13 | Ô nhập lại mật khẩu phải khớp với mật khẩu. |
| YC-14 | Tuổi là số nguyên từ 18 đến 60, tính cả 18 và 60. |
| YC-15 | Mỗi ô sai hiển thị thông báo lỗi ngay dưới ô đó. |
| YC-16 | Đăng ký thành công thì chuyển về trang đăng nhập kèm thông báo. Tài khoản mới là thành viên. |
| YC-18 | Đăng ký luôn tạo tài khoản khách hàng. Người đăng ký không tự đặt được vai trò hay quyền của mình. |

### Quên mật khẩu

| Mã | Yêu cầu |
|---|---|
| YC-17 | Nhập email đúng định dạng thì luôn hiện cùng một thông báo, dù email có tồn tại hay không. |

## 2. Sản phẩm

| Mã | Yêu cầu |
|---|---|
| YC-20 | Tìm kiếm theo tên sản phẩm, không phân biệt chữ hoa, chữ thường. Không có kết quả thì hiện thông báo. |
| YC-21 | Sắp xếp theo: Tên (A-Z), Tên (Z-A) theo thứ tự bảng chữ cái tiếng Việt; Giá thấp đến cao; Giá cao đến thấp. |
| YC-22 | Sản phẩm hết hàng hiển thị "Hết hàng" và không thêm được vào giỏ. Còn từ 3 sản phẩm trở xuống thì hiển thị số lượng còn lại. |
| YC-23 | Trang chi tiết hiển thị tên, giá, mô tả, tồn kho và đánh giá của khách. |
| YC-24 | Trang chi tiết có ô chọn số lượng với nút − và +. Nút − bị vô hiệu khi số lượng là 1. Nút + bị vô hiệu khi đạt 10 hoặc đạt số lượng tồn kho. |

## 3. Giỏ hàng

| Mã | Yêu cầu |
|---|---|
| YC-30 | Số lượng mỗi sản phẩm trong giỏ là số nguyên từ 1 đến 10 và không vượt quá tồn kho, dù nhập bằng nút hay gõ tay. |
| YC-31 | Khi đổi số lượng, thành tiền của dòng, tạm tính, giảm giá, tổng cộng và số trên biểu tượng giỏ hàng cập nhật ngay. |
| YC-32 | Giảm giá theo bảng dưới đây, tính trên tạm tính, làm tròn đến đồng. |
| YC-33 | Có thể xóa từng sản phẩm khỏi giỏ. |

Bảng giảm giá (YC-32):

| | Quy tắc 1 | Quy tắc 2 | Quy tắc 3 | Quy tắc 4 |
|---|---|---|---|---|
| Là thành viên? | Có | Có | Không | Không |
| Tạm tính từ 500.000đ trở lên? | Có | Không | Có | Không |
| **Giảm giá** | **15%** | **5%** | **10%** | **0%** |

## 4. Thanh toán

| Mã | Yêu cầu |
|---|---|
| YC-40 | Họ tên người nhận, số điện thoại, địa chỉ là bắt buộc. Số điện thoại gồm đúng 10 chữ số và bắt đầu bằng số 0. Địa chỉ tối thiểu 10 ký tự. |
| YC-41 | Mỗi lần đặt hàng chỉ tạo đúng một đơn, kể cả khi người dùng bấm nút Đặt hàng nhiều lần. |
| YC-42 | Đặt hàng thành công thì hiển thị "Đặt hàng thành công" kèm mã đơn, giỏ hàng trở về trống, tồn kho giảm tương ứng. |
| YC-43 | Giỏ hàng trống thì không thể thanh toán. |
| YC-44 | Không bán vượt tồn kho. Khi đặt hàng mà tồn kho không còn đủ (ví dụ khách khác vừa mua) thì báo lỗi rõ ràng và không tạo đơn. |
| YC-45 | Tạm tính, giảm giá và tổng tiền của đơn hàng luôn do server tính từ giỏ hàng. |

## 5. Đơn hàng

| Mã | Yêu cầu |
|---|---|
| YC-50 | Khách hàng chỉ xem được đơn hàng của chính mình. Quản trị viên xem được mọi đơn. |
| YC-51 | Vòng đời đơn hàng theo sơ đồ dưới đây. Mọi chuyển trạng thái không có trong sơ đồ đều bị từ chối. |
| YC-52 | Khách hàng chỉ được hủy đơn của mình khi đơn đang ở trạng thái Mới hoặc Đã xác nhận. Các chuyển trạng thái khác do quản trị viên thực hiện. |
| YC-53 | Hủy đơn thì số lượng sản phẩm được hoàn lại vào tồn kho. |
| YC-54 | Ngày đặt hàng hiển thị theo giờ Việt Nam (UTC+7). |
| YC-55 | Khách hàng tìm được đơn hàng của mình theo tên sản phẩm có trong đơn. |

Sơ đồ trạng thái (YC-51):

```
Mới ──► Đã xác nhận ──► Đang giao ──► Đã giao
 │            │
 └──► Đã hủy ◄┘
```

## 6. API

| Mã | Yêu cầu |
|---|---|
| YC-60 | Dữ liệu gửi lên không hợp lệ thì API trả mã 4xx kèm thông báo rõ ràng. API không bao giờ trả 500 vì dữ liệu người dùng gửi lên. |
| YC-61 | Mọi ràng buộc trên giao diện (số lượng, trạng thái đơn, quyền xem đơn…) cũng phải được kiểm tra ở API. |
| YC-62 | Request cần đăng nhập mà thiếu hoặc sai token thì trả 401. Đã đăng nhập nhưng không có quyền thì trả 403. |

## 7. Bảo mật

| Mã | Yêu cầu |
|---|---|
| YC-63 | Dữ liệu người dùng nhập (họ tên, địa chỉ…) luôn được hiển thị như văn bản thuần, trình duyệt không được thực thi nó như mã. |
| YC-64 | Thông báo lỗi không để lộ thông tin nội bộ như câu lệnh SQL, tên bảng, đường dẫn file. |
| YC-65 | Ô tìm kiếm và bộ lọc xử lý an toàn mọi ký tự, kể cả dấu nháy và ký tự đặc biệt. |

## 8. Phi chức năng

| Mã | Yêu cầu |
|---|---|
| YC-70 | Giao diện dùng tốt trên màn hình điện thoại rộng 360px. |
| YC-71 | API phản hồi dưới 1 giây. Riêng đặt hàng (có xử lý thanh toán) dưới 2 giây. |
| YC-72 | Không có lỗi JavaScript trong Console khi dùng các chức năng bình thường. |
| YC-73 | Khi 50 người dùng thao tác cùng lúc (kể cả đăng nhập), 95% request phản hồi dưới 1 giây. |
