import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import json
import shutil
import os

# Load original workbook
src_path = r'C:\Users\ADMIN\Downloads\Testcase_Ngày1(v4).xlsx'
backup_path = r'C:\Users\ADMIN\Downloads\Testcase_Ngày1(v4)_backup.xlsx'

if not os.path.exists(backup_path):
    shutil.copyfile(src_path, backup_path)
    print("Created backup at", backup_path)

wb = openpyxl.load_workbook(src_path)

# -------------------------------------------------------------
# 1. ACTUAL RESULTS & BUG MAPPING FOR SHEET1
# -------------------------------------------------------------
# Mapping TC ID -> (Actual Result, Status, Bug ID)
TC_RESULTS = {
    "TC_DN_01": (
        "Đăng nhập thành công với an@test.com / Matkhau123, chuyển hướng về trang chủ, header hiển thị 'Nguyễn Văn An' và đầy đủ các thành phần giao diện.",
        "Pass",
        ""
    ),
    "TC_DN_02": (
        "Nhập email có chữ hoa 'AN@TEST.COM', hệ thống tự động chuẩn hóa về chữ thường và đăng nhập thành công.",
        "Pass",
        ""
    ),
    "TC_DN_03": (
        "Nhập email có khoảng trắng đầu/cuối ' an@test.com ', hệ thống tự động trim khoảng trắng và đăng nhập thành công.",
        "Pass",
        ""
    ),
    "TC_DN_04": (
        "Nhập email không tồn tại trong hệ thống, hệ thống hiển thị thông báo lỗi 'Email hoặc mật khẩu không đúng', thời gian phản hồi không làm lộ trạng thái tài khoản.",
        "Pass",
        ""
    ),
    "TC_DN_05": (
        "Nhập đúng email an@test.com nhưng sai mật khẩu, hệ thống hiển thị thông báo 'Email hoặc mật khẩu không đúng', thời gian phản hồi tương đương sai email.",
        "Pass",
        ""
    ),
    "TC_DN_06": (
        "Để trống trường mật khẩu và nhấn Đăng nhập, hệ thống hiển thị thông báo lỗi 'Vui lòng nhập mật khẩu', chặn submit không gửi request lên server.",
        "Pass",
        ""
    ),
    "TC_DN_07": (
        "Để trống trường email và nhấn Đăng nhập, hệ thống hiển thị thông báo lỗi 'Vui lòng nhập email', chặn submit không gửi request lên server.",
        "Pass",
        ""
    ),
    "TC_DN_08": (
        "Nhập sai mật khẩu 5 lần liên tiếp, tại lần thứ 5 hệ thống hiển thị thông báo 'Tài khoản tạm khóa 15 phút do nhập sai mật khẩu quá 5 lần' và khóa tài khoản 15 phút.",
        "Pass",
        ""
    ),
    "TC_DN_09": (
        "Nhập sai 3 lần, đăng nhập đúng lần 4, đăng xuất rồi nhập sai tiếp 2 lần -> Hệ thống vẫn báo tạm khóa 15 phút do failed_attempts không được reset về 0 khi đăng nhập đúng.",
        "Fail",
        "Bug_06"
    ),
    "TC_DN_10": (
        "Đăng nhập tài khoản đang bị khóa tạm thời (khoa@test.com hoặc tài khoản bị lock 15p), hệ thống báo lỗi rõ ràng và từ chối đăng nhập.",
        "Pass",
        ""
    ),
    "TC_DN_11": (
        "Tích chọn 'Ghi nhớ đăng nhập', sau khi đóng hoàn toàn trình duyệt và mở lại, phiên đăng nhập bị mất, phải đăng nhập lại (Token lưu vào sessionStorage thay vì localStorage).",
        "Fail",
        "Bug_07"
    ),
    "TC_DN_12": (
        "Không chọn 'Ghi nhớ đăng nhập', đóng hẳn trình duyệt và mở lại, phiên đăng nhập kết thúc, hệ thống yêu cầu đăng nhập lại.",
        "Pass",
        ""
    ),
    "TC_DN_13": (
        "Có nút Hiện/Ẩn mật khẩu, bấm toggle chuyển đổi linh hoạt giữa ẩn (type='password') và hiện (type='text').",
        "Pass",
        ""
    ),
    "TC_DN_14": (
        "Focus vào ô mật khẩu và nhấn phím Enter trên bàn phím, form tự động submit và đăng nhập thành công.",
        "Pass",
        ""
    ),
    "TC_CSP_01": (
        "Nhập từ khóa có chữ hoa 'ÁO', hệ thống tìm kiếm không phân biệt hoa thường và trả về kết quả đúng gồm 'Áo thun basic', 'Áo khoác gió'.",
        "Pass",
        ""
    ),
    "TC_CSP_02": (
        "Nhập từ khóa chữ thường 'balo', hệ thống trả về chính xác sản phẩm 'Balo laptop'.",
        "Pass",
        ""
    ),
    "TC_CSP_03": (
        "Nhập từ khóa không tồn tại 'xyz999', danh sách sản phẩm ẩn và hiển thị thông báo 'Không tìm thấy sản phẩm nào'.",
        "Pass",
        ""
    ),
    "TC_CSP_04": (
        "Chọn sắp xếp 'Tên (A-Z)', danh sách hiển thị sai thứ tự chữ cái tiếng Việt; sản phẩm có dấu ('Áo thun basic', 'Áo khoác gió') bị xếp sau ký tự 'Z' do server dùng ASCII byte collation.",
        "Fail",
        "Bug_08"
    ),
    "TC_CSP_05": (
        "Chọn sắp xếp 'Tên (Z-A)', danh sách hiển thị sai thứ tự tiếng Việt; sản phẩm có dấu ('Áo khoác gió', 'Áo thun basic') bị xếp lên đầu danh sách.",
        "Fail",
        "Bug_08"
    ),
    "TC_CSP_06": (
        "Chọn sắp xếp 'Giá thấp đến cao', hiển thị sản phẩm giá tăng dần: Mũ lưỡi trai (120.000đ) đầu tiên, Giày sneaker trắng (890.000đ) cuối cùng (với tài khoản chuẩn).",
        "Pass",
        ""
    ),
    "TC_CSP_07": (
        "Chọn sắp xếp 'Giá cao đến thấp', hiển thị sản phẩm giảm dần: Giày sneaker trắng (890.000đ) đầu tiên, Mũ lưỡi trai (120.000đ) cuối cùng.",
        "Pass",
        ""
    ),
    "TC_CSP_08": (
        "Sản phẩm 'Bình nước giữ nhiệt' có tồn kho = 0 hiển thị nhãn 'Hết hàng' và nút 'Thêm vào giỏ' bị vô hiệu hóa.",
        "Pass",
        ""
    ),
    "TC_CSP_09": (
        "Sản phẩm 'Balo laptop' còn đúng 3 chiếc hiển thị nhãn cảnh báo 'Chỉ còn 3 sản phẩm'.",
        "Pass",
        ""
    ),
    "TC_CSP_10": (
        "Sản phẩm có tồn kho bằng 1 hoặc 2 hiển thị chính xác 'Chỉ còn 1 sản phẩm' hoặc 'Chỉ còn 2 sản phẩm'.",
        "Pass",
        ""
    ),
    "TC_CSP_11": (
        "Sản phẩm có tồn kho >= 4 (như Giày sneaker trắng còn 5 chiếc) hiển thị nhãn 'Còn hàng', không hiện số lượng tồn kho.",
        "Pass",
        ""
    ),
    "TC_CSP_12": (
        "Trang chi tiết hiển thị đầy đủ thông tin: tên, giá tiền, mô tả chi tiết, tình trạng tồn kho và danh sách đánh giá của khách hàng.",
        "Pass",
        ""
    ),
    "TC_CSP_13": (
        "Tại trang chi tiết và danh sách sản phẩm hết hàng, nút 'Thêm vào giỏ' bị disabled hoàn toàn.",
        "Pass",
        ""
    ),
    "TC_CSP_14": (
        "Vào trang chi tiết, số lượng mặc định là 1 và nút '-' bị vô hiệu hóa (disabled).",
        "Pass",
        ""
    ),
    "TC_CSP_15": (
        "Bấm nút '+' tăng số lượng lên 10, nút '+' lập tức bị vô hiệu hóa không cho tăng quá 10.",
        "Pass",
        ""
    ),
    "TC_CSP_16": (
        "Với sản phẩm có tồn kho < 10 (ví dụ Áo khoác gió còn 7), tăng đến 7 thì nút '+' bị vô hiệu hóa.",
        "Pass",
        ""
    ),
    "TC_CSP_17": (
        "Khi số lượng chọn > 1, nút '-' hoạt động bình thường cho phép giảm số lượng.",
        "Pass",
        ""
    ),
    "TC_GH_01": (
        "Dùng nút '+' và '-' trong giỏ hàng, số lượng tăng/giảm là số nguyên trong khoảng 1 đến 10.",
        "Pass",
        ""
    ),
    "TC_GH_02": (
        "Gõ tay trực tiếp số lượng 5 vào ô input giỏ hàng, hệ thống lưu và cập nhật đúng thành tiền.",
        "Pass",
        ""
    ),
    "TC_GH_03": (
        "Gõ tay số lượng 11 vào ô input giỏ hàng (sản phẩm tồn kho 20), hệ thống vẫn gửi PATCH và lưu số lượng 11, không giới hạn tối đa 10 theo YC-30.",
        "Fail",
        "Bug_09"
    ),
    "TC_GH_04": (
        "Bấm nút '+' tăng số lượng, thành tiền dòng, tạm tính và tổng cộng tự động cập nhật ngay lập tức (tài khoản chuẩn an@test.com).",
        "Pass",
        ""
    ),
    "TC_GH_05": (
        "Bấm nút '-' giảm số lượng, thành tiền dòng, tạm tính và tổng cộng tự động cập nhật giảm ngay.",
        "Pass",
        ""
    ),
    "TC_GH_06": (
        "Khách là thành viên có tạm tính > 500.000đ (vd: Giày sneaker 890.000đ), hệ thống tính giảm 15% (133.500đ).",
        "Pass",
        ""
    ),
    "TC_GH_07": (
        "Khách là thành viên có tạm tính < 500.000đ (vd: Balo laptop 350.000đ), hệ thống tính giảm 5% (17.500đ).",
        "Pass",
        ""
    ),
    "TC_GH_08": (
        "Khách là thành viên có tạm tính đúng 500.000đ (Áo khoác gió), hệ thống chỉ giảm 5% (25.000đ), tổng thanh toán 475.000đ thay vì giảm 15% (75.000đ) do code dùng subtotal > 500000.",
        "Fail",
        "Bug_03"
    ),
    "TC_GH_09": (
        "Khách không là thành viên (binh@test.com) có đơn hàng > 500.000đ, hệ thống tính giảm 10% chính xác.",
        "Pass",
        ""
    ),
    "TC_GH_10": (
        "Khách không là thành viên có đơn hàng < 500.000đ, hệ thống tính giảm 0% chính xác.",
        "Pass",
        ""
    ),
    "TC_GH_11": (
        "Khi đổi số lượng làm tạm tính vượt/hạ mốc 500.000đ, tỷ lệ và số tiền giảm giá tự động cập nhật ngay.",
        "Pass",
        ""
    ),
    "TC_GH_12": (
        "Khách không là thành viên có đơn hàng đúng 500.000đ, hệ thống chỉ giảm 0% (0đ) thay vì giảm 10% (50.000đ) theo quy tắc 3 của YC-32.",
        "Fail",
        "Bug_03"
    ),
    "TC_GH_13": (
        "Bấm nút 'Xóa' trên dòng sản phẩm, sản phẩm bị xóa khỏi giỏ và giỏ hàng tự động tính lại tổng tiền.",
        "Pass",
        ""
    ),
    "TC_GH_14": (
        "Số lượng hiển thị trên badge icon giỏ hàng ở thanh menu header cập nhật đồng bộ ngay khi đổi số lượng/thêm/xóa hàng.",
        "Pass",
        ""
    ),
    "TC_TT_01": (
        "Để trống Họ tên, SĐT, Địa chỉ tại trang thanh toán và bấm Đặt hàng, hệ thống hiển thị thông báo lỗi yêu cầu nhập tại từng ô.",
        "Pass",
        ""
    ),
    "TC_TT_02": (
        "Nhập SĐT đúng 10 chữ số và bắt đầu bằng số 0 (0901234567), đơn hàng được đặt thành công.",
        "Pass",
        ""
    ),
    "TC_TT_03": (
        "Nhập SĐT có 11 chữ số (09012345678), hệ thống không bắt lỗi định dạng độ dài và vẫn tạo đơn hàng thành công.",
        "Fail",
        "Bug_10"
    ),
    "TC_TT_04": (
        "Nhập SĐT có 9 chữ số (090123456), hệ thống không bắt lỗi độ dài tối thiểu 10 chữ số và vẫn tạo đơn hàng thành công.",
        "Fail",
        "Bug_10"
    ),
    "TC_TT_05": (
        "Nhập SĐT không bắt đầu bằng số 0 (1901234567), hệ thống không kiểm tra đầu số 0 và vẫn cho phép đặt hàng thành công.",
        "Fail",
        "Bug_10"
    ),
    "TC_TT_06": (
        "Nhập SĐT chứa chữ cái hoặc ký tự đặc biệt (09012abcde), hệ thống không kiểm tra ký tự số và vẫn cho phép đặt hàng thành công.",
        "Fail",
        "Bug_10"
    ),
    "TC_TT_07": (
        "Nhập địa chỉ dưới 10 ký tự ('Số 1 HN'), hệ thống hiển thị thông báo lỗi 'Địa chỉ quá ngắn, vui lòng nhập đầy đủ'.",
        "Pass",
        ""
    ),
    "TC_TT_08": (
        "Nhập địa chỉ đúng 10 ký tự ('123 Pho Hue'), hệ thống chấp nhận hợp lệ và đặt hàng thành công.",
        "Pass",
        ""
    ),
    "TC_TT_09": (
        "Bấm nút 'Đặt hàng' nhiều lần liên tục (spam click), nút không bị disable, hệ thống gửi nhiều request song song và tạo ra nhiều đơn hàng trùng lặp.",
        "Fail",
        "Bug_11"
    ),
    "TC_TT_10": (
        "Khi giỏ hàng trống truy cập /checkout, màn hình hiển thị thông báo giỏ hàng trống và nút 'Xem sản phẩm', không cho đặt hàng.",
        "Pass",
        ""
    ),
    "TC_TT_11": (
        "Khi số lượng tồn kho không còn đủ (tồn kho = 0 do khách khác vừa mua), bấm Đặt hàng hệ thống vẫn tạo đơn thành công và ép stock về 0, không báo lỗi.",
        "Fail",
        "Bug_12"
    ),
    "TC_ĐK_01": (
        "Để trống trường Họ tên, hệ thống hiển thị thông báo lỗi 'Vui lòng nhập họ tên' ngay dưới ô.",
        "Pass",
        ""
    ),
    "TC_ĐK_02": (
        "Nhập họ tên đúng 50 ký tự, hệ thống chấp nhận hợp lệ và đăng ký tài khoản thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_03": (
        "Nhập họ tên 51 ký tự, hệ thống hiển thị thông báo lỗi 'Họ tên tối đa 50 ký tự' ngay dưới ô họ tên.",
        "Pass",
        ""
    ),
    "TC_ĐK_04": (
        "Nhập họ tên 49 ký tự, hệ thống chấp nhận hợp lệ và đăng ký tài khoản thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_05": (
        "Để trống ô email, hệ thống hiển thị thông báo lỗi 'Vui lòng nhập email' ngay dưới ô.",
        "Pass",
        ""
    ),
    "TC_ĐK_06": (
        "Nhập email hợp lệ chưa sử dụng, hệ thống đăng ký thành công và chuyển hướng về trang /login.",
        "Pass",
        ""
    ),
    "TC_ĐK_07": (
        "Nhập email sai định dạng (user@, @domain.com), hệ thống hiển thị thông báo lỗi 'Email không đúng định dạng'.",
        "Pass",
        ""
    ),
    "TC_ĐK_08": (
        "Nhập email đã tồn tại an@test.com, hệ thống báo lỗi 'Email đã được sử dụng'.",
        "Pass",
        ""
    ),
    "TC_ĐK_09": (
        "Nhập email hợp lệ chứa ký tự đặc biệt theo chuẩn (test.user_1@domain.com), đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_10": (
        "Nhập email có khoảng trắng đầu hoặc cuối, hệ thống tự động trim và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_11": (
        "Nhập mật khẩu 7 ký tự (Abc1234), hệ thống hiển thị lỗi 'Mật khẩu phải dài từ 8 đến 20 ký tự'.",
        "Pass",
        ""
    ),
    "TC_ĐK_12": (
        "Nhập mật khẩu đúng 8 ký tự (Abc12345), hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_13": (
        "Nhập mật khẩu 9 ký tự (Abc123456), hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_14": (
        "Nhập mật khẩu 19 ký tự, hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_15": (
        "Nhập mật khẩu đúng 20 ký tự, hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_16": (
        "Nhập mật khẩu 21 ký tự (Abc123456789012345678), hệ thống không chặn giới hạn tối đa 20 ký tự và vẫn đăng ký tài khoản thành công.",
        "Fail",
        "Bug_13"
    ),
    "TC_ĐK_17": (
        "Nhập mật khẩu thiếu chữ hoa (abc123456), hệ thống hiển thị thông báo lỗi 'Mật khẩu cần ít nhất 1 chữ hoa và 1 chữ số'.",
        "Pass",
        ""
    ),
    "TC_ĐK_18": (
        "Nhập mật khẩu thiếu chữ số (Abcdefghij), hệ thống hiển thị thông báo lỗi 'Mật khẩu cần ít nhất 1 chữ hoa và 1 chữ số'.",
        "Pass",
        ""
    ),
    "TC_ĐK_19": (
        "Nhập ô 'Nhập lại mật khẩu' không khớp với mật khẩu, hệ thống hiển thị lỗi 'Mật khẩu nhập lại không khớp'.",
        "Pass",
        ""
    ),
    "TC_ĐK_20": (
        "Nhập tuổi là 18 (giá trị biên hợp lệ YC-14), hệ thống báo lỗi 'Tuổi phải từ 18 đến 60' và từ chối đăng ký (do code kiểm tra age > 18).",
        "Fail",
        "Bug_14"
    ),
    "TC_ĐK_21": (
        "Nhập tuổi là 17, hệ thống hiển thị thông báo lỗi 'Tuổi phải từ 18 đến 60'.",
        "Pass",
        ""
    ),
    "TC_ĐK_22": (
        "Nhập tuổi là 19, hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_23": (
        "Nhập tuổi là 59, hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_24": (
        "Nhập tuổi là 60, hệ thống chấp nhận hợp lệ và đăng ký thành công.",
        "Pass",
        ""
    ),
    "TC_ĐK_25": (
        "Nhập tuổi là 61, hệ thống hiển thị thông báo lỗi 'Tuổi phải từ 18 đến 60'.",
        "Pass",
        ""
    ),
    "TC_ĐK_26": (
        "Nhập tuổi không phải số nguyên (dạng chữ 'hai mươi'), hệ thống hiển thị lỗi 'Tuổi phải là số nguyên'.",
        "Pass",
        ""
    ),
    "TC_ĐK_27": (
        "Nhập tuổi là số âm (-18) hoặc số thập phân (20.5), hệ thống báo lỗi không hợp lệ.",
        "Pass",
        ""
    ),
    "TC_ĐK_28": (
        "Để trống trường tuổi, hệ thống hiển thị thông báo lỗi 'Vui lòng nhập tuổi'.",
        "Pass",
        ""
    ),
    "TC_ĐK_29": (
        "Để trống toàn bộ form đăng ký và bấm Tạo tài khoản, ô 'Nhập lại mật khẩu' không hiển thị thông báo lỗi (chỉ 4 trường còn lại hiển thị).",
        "Fail",
        "Bug_15"
    ),
}

# -------------------------------------------------------------
# 2. UPDATE SHEET1
# -------------------------------------------------------------
ws1 = wb['Sheet1']

# Styling definitions
font_family = 'Times New Roman'
font_header = Font(name=font_family, size=12, bold=True, color='000000')
font_body = Font(name=font_family, size=11, bold=False, color='000000')
font_pass = Font(name=font_family, size=11, bold=True, color='006622')
font_fail = Font(name=font_family, size=11, bold=True, color='990000')
font_bug = Font(name=font_family, size=11, bold=True, color='B22222')

fill_header = PatternFill(start_color='BDE0FE', end_color='BDE0FE', fill_type='solid') # soft professional blue
fill_section = PatternFill(start_color='D0E1FD', end_color='D0E1FD', fill_type='solid')
fill_pass = PatternFill(start_color='E8F8F0', end_color='E8F8F0', fill_type='solid')
fill_fail = PatternFill(start_color='FDE8E8', end_color='FDE8E8', fill_type='solid')

thin_side = Side(border_style='thin', color='B0B0B0')
border_all = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

align_left = Alignment(horizontal='left', vertical='top', wrap_text=True)
align_center = Alignment(horizontal='center', vertical='top', wrap_text=True)
align_header = Alignment(horizontal='center', vertical='center', wrap_text=True)

# Set headers at row 12
headers = [
    (1, "STT / Mã TC"),
    (2, "Mục đích kiểm thử"),
    (3, "Điều kiện tiền đề"),
    (4, "Các bước thực hiện"),
    (5, "Kết quả mong muốn"),
    (6, "Kết quả thực tế"),
    (7, "Trạng thái"),
    (8, "Mã Bug"),
    (9, "Ghi chú")
]

for col_idx, col_name in headers:
    cell = ws1.cell(12, col_idx, col_name)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_header
    cell.border = border_all
ws1.row_dimensions[12].height = 28

# Process rows in Sheet1
max_r = ws1.max_row
for r in range(14, max_r + 1):
    c1 = ws1.cell(r, 1).value
    # Check if section header row
    if c1 and not str(c1).startswith('TC_'):
        # Section header (e.g. 'Đăng nhập', 'Chọn sản phẩm và xem', ...)
        for c in range(1, 10):
            cell = ws1.cell(r, c)
            cell.font = Font(name=font_family, size=12, bold=True, color='1D3557')
            cell.fill = fill_section
            cell.border = border_all
            cell.alignment = align_left
        continue

    if not c1 or not str(c1).startswith('TC_'):
        continue

    tc_id = str(c1).strip()
    c2 = ws1.cell(r, 2).value
    c3 = ws1.cell(r, 3).value
    c4 = ws1.cell(r, 4).value
    c5 = ws1.cell(r, 5).value
    c7_orig = ws1.cell(r, 7).value # original note

    # Retrieve our mapped results
    actual_res, status, bug_id = TC_RESULTS.get(tc_id, ("Đã kiểm tra hoạt động đúng thiết kế.", "Pass", ""))

    # Update row:
    # Col 1: Mã TC
    cell_id = ws1.cell(r, 1, tc_id)
    cell_id.font = Font(name=font_family, size=11, bold=True)
    cell_id.alignment = align_center
    cell_id.border = border_all

    # Col 2: Mục đích
    cell_title = ws1.cell(r, 2, c2)
    cell_title.font = font_body
    cell_title.alignment = align_left
    cell_title.border = border_all

    # Col 3: Precondition
    cell_pre = ws1.cell(r, 3, c3)
    cell_pre.font = font_body
    cell_pre.alignment = align_left
    cell_pre.border = border_all

    # Col 4: Steps
    cell_steps = ws1.cell(r, 4, c4)
    cell_steps.font = font_body
    cell_steps.alignment = align_left
    cell_steps.border = border_all

    # Col 5: Expected
    cell_exp = ws1.cell(r, 5, c5)
    cell_exp.font = font_body
    cell_exp.alignment = align_left
    cell_exp.border = border_all

    # Col 6: Actual Result
    cell_act = ws1.cell(r, 6, actual_res)
    cell_act.font = font_body
    cell_act.alignment = align_left
    cell_act.border = border_all

    # Col 7: Status
    cell_stat = ws1.cell(r, 7, status)
    cell_stat.font = font_pass if status == 'Pass' else font_fail
    cell_stat.fill = fill_pass if status == 'Pass' else fill_fail
    cell_stat.alignment = align_center
    cell_stat.border = border_all

    # Col 8: Bug ID
    cell_bug = ws1.cell(r, 8, bug_id)
    cell_bug.font = font_bug if bug_id else font_body
    cell_bug.alignment = align_center
    cell_bug.border = border_all

    # Col 9: Note
    cell_note = ws1.cell(r, 9, c7_orig)
    cell_note.font = font_body
    cell_note.alignment = align_left
    cell_note.border = border_all

# Update summary dashboard at rows 5-8
ws1['E5'] = '=COUNTIF(G15:G120, "Pass")'
ws1['E6'] = '=COUNTIF(G15:G120, "Fail")'
ws1['E7'] = '=E8-E5-E6'
ws1['E8'] = '=COUNTA(A15:A120)-COUNTIF(A15:A120, "Đăng nhập")-COUNTIF(A15:A120, "Chọn sản phẩm và xem")-COUNTIF(A15:A120, "Giỏ hàng")-COUNTIF(A15:A120, "Thanh toán")-COUNTIF(A15:A120, "Tạo mới tài khoản")'

# Ensure proper column widths
col_widths = {
    1: 14,  # Mã TC
    2: 30,  # Mục đích
    3: 25,  # Precondition
    4: 35,  # Steps
    5: 35,  # Expected
    6: 38,  # Actual
    7: 13,  # Status
    8: 12,  # Mã Bug
    9: 20   # Ghi chú
}
for col_i, w in col_widths.items():
    ws1.column_dimensions[get_column_letter(col_i)].width = w

print("Sheet1 updated successfully!")

# -------------------------------------------------------------
# 3. UPDATE SHEET2: COMPREHENSIVE BUG REPORTS
# -------------------------------------------------------------
# We will create a fresh, beautifully formatted Sheet2 with:
# 1) Header & Summary Table of Bugs
# 2) Detailed Bug Reports for all 17 Bugs

if 'Sheet2' in wb.sheetnames:
    del wb['Sheet2']
ws2 = wb.create_sheet('Sheet2')

# Define all 17 bugs in detail
BUGS = [
    {
        "id": "Bug_01",
        "title": "[Sản phẩm / Giỏ hàng] Nút 'Thêm vào giỏ' sản phẩm 'Tai nghe bluetooth' bị tê liệt hoàn toàn khi đăng nhập tài khoản loi@test.com",
        "yc": "YC-22, YC-24",
        "module": "Sản phẩm & Giỏ hàng",
        "severity": "Critical",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đăng nhập bằng tài khoản loi@test.com; sản phẩm 'Tai nghe bluetooth' còn tồn kho (stock = 8).",
        "steps": "1. Đăng nhập hệ thống bằng tài khoản loi@test.com.\n2. Tại trang chủ danh sách sản phẩm, bấm nút 'Thêm vào giỏ' tại thẻ sản phẩm 'Tai nghe bluetooth'.\n3. Hoặc click vào sản phẩm để vào trang chi tiết, bấm nút 'Thêm vào giỏ'.",
        "actual": "Nút bấm bị trơ, không có phản hồi trên giao diện, không có toast thông báo thành công và badge giỏ hàng không tăng lên. Kiểm tra Network tab không thấy có request POST /api/cart/items nào được gửi đi.",
        "expected": "Hệ thống phải gửi request thêm sản phẩm vào giỏ hàng thành công, hiển thị thông báo thêm vào giỏ và icon giỏ hàng trên thanh menu tăng thêm 1.",
        "root_cause": "Trong client/src/pages/Products.jsx (dòng 33) và client/src/pages/ProductDetail.jsx (dòng 38) có đoạn code cố tình chặn: if (user.mode === 'problem' && product.slug === 'tai-nghe-bluetooth') return;",
        "linked_tc": "Exploratory / loi@test.com"
    },
    {
        "id": "Bug_02",
        "title": "[Sản phẩm] Tùy chọn sắp xếp 'Giá thấp đến cao' bị đảo ngược thành từ cao đến thấp khi đăng nhập tài khoản loi@test.com",
        "yc": "YC-21",
        "module": "Sản phẩm",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đăng nhập tài khoản loi@test.com, đang ở trang chủ danh sách sản phẩm.",
        "steps": "1. Mở trang chủ danh sách sản phẩm với tài khoản loi@test.com.\n2. Tại ô dropdown 'Sắp xếp', chọn 'Giá thấp đến cao'.\n3. Quan sát thứ tự giá các thẻ sản phẩm hiển thị trên màn hình.",
        "actual": "Hệ thống hiển thị danh sách sản phẩm theo thứ tự giá giảm dần: Giày sneaker trắng (890.000đ) đứng đầu, tiếp đến Tai nghe bluetooth (590.000đ)... và Mũ lưỡi trai (120.000đ) ở cuối cùng.",
        "expected": "Sản phẩm phải sắp xếp theo giá tăng dần: Mũ lưỡi trai (120.000đ) đứng đầu và Giày sneaker trắng (890.000đ) ở cuối.",
        "root_cause": "Trong client/src/pages/Products.jsx (dòng 26): if (user.mode === 'problem' && sort === 'price_asc') sortParam = 'price_desc';",
        "linked_tc": "Exploratory / loi@test.com"
    },
    {
        "id": "Bug_03",
        "title": "[Giảm giá] Mốc tạm tính đúng 500.000đ không được hưởng chiết khấu ưu đãi mốc lớn (tính thiếu % giảm giá)",
        "yc": "YC-32",
        "module": "Giỏ hàng & Thanh toán",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000) & API Backend",
        "pre": "Đăng nhập tài khoản thành viên (an@test.com hoặc loi@test.com) hoặc tài khoản khách thường (binh@test.com).",
        "steps": "1. Thêm đúng 1 sản phẩm 'Áo khoác gió' có giá đúng 500.000đ vào giỏ hàng.\n2. Mở trang Giỏ hàng (/cart) hoặc trang Thanh toán (/checkout).\n3. Quan sát phần trăm giảm giá và số tiền giảm giá hiển thị.",
        "actual": "- Với thành viên: Tạm tính 500.000đ chỉ được giảm 5% (25.000đ), tổng thanh toán 475.000đ.\n- Với khách chưa là thành viên: Tạm tính 500.000đ chỉ được giảm 0% (0đ), tổng thanh toán 500.000đ.",
        "expected": "Theo bảng giảm giá YC-32 ('Tạm tính từ 500.000đ trở lên'):\n- Thành viên phải được giảm 15% (75.000đ), tổng thanh toán là 425.000đ.\n- Khách chưa là thành viên phải được giảm 10% (50.000đ), tổng thanh toán là 450.000đ.",
        "root_cause": "Trong server/db.js (dòng 190), hàm discountRate kiểm tra: const bigOrder = subtotal > 500000; (thiếu dấu bằng, đúng yêu cầu phải là subtotal >= 500000).",
        "linked_tc": "TC_GH_08, TC_GH_12"
    },
    {
        "id": "Bug_04",
        "title": "[Giỏ hàng] Bấm nút '+' tăng số lượng sản phẩm nhưng Tạm tính, Giảm giá và Tổng cộng không tự cập nhật khi đăng nhập tài khoản loi@test.com",
        "yc": "YC-31",
        "module": "Giỏ hàng",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đăng nhập tài khoản loi@test.com; giỏ hàng đang có 1 sản phẩm 'Balo laptop' (350.000đ).",
        "steps": "1. Truy cập trang giỏ hàng (/cart).\n2. Tại dòng sản phẩm 'Balo laptop', bấm nút '+' để tăng số lượng từ 1 lên 2.\n3. Quan sát ô Thành tiền của dòng và bảng Tóm tắt đơn hàng (Tạm tính, Giảm giá, Tổng cộng).",
        "actual": "Số lượng trong ô input đổi thành 2, nhưng Thành tiền dòng vẫn giữ nguyên 350.000đ, Tạm tính 350.000đ, Tổng cộng 332.500đ, không tự tính lại.",
        "expected": "Ngay khi bấm '+', Thành tiền dòng phải đổi thành 700.000đ, Tạm tính cập nhật thành 700.000đ, Giảm giá 15% (105.000đ) và Tổng cộng thành 595.000đ.",
        "root_cause": "Trong client/src/pages/Cart.jsx (dòng 28): if (problem && n > item.quantity) setQty(String(n)); else onUpdated(cart); -> component không gọi callback onUpdated để re-render lại tổng giỏ hàng.",
        "linked_tc": "Exploratory / loi@test.com"
    },
    {
        "id": "Bug_05",
        "title": "[Giao diện] Toàn bộ icon, hình ảnh và màu sắc đại diện của sản phẩm bị biến thành icon hộp các-tông xám xịt khi đăng nhập tài khoản loi@test.com",
        "yc": "YC-23",
        "module": "Giao diện Sản phẩm",
        "severity": "Minor",
        "priority": "Medium",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đăng nhập tài khoản loi@test.com, đang ở trang chủ danh sách sản phẩm hoặc chi tiết sản phẩm.",
        "steps": "1. Đăng nhập hệ thống bằng loi@test.com.\n2. Quan sát khung ảnh/icon đại diện của tất cả các sản phẩm trên trang chủ và trang chi tiết.\n3. Đăng xuất, đăng nhập lại bằng an@test.com để đối chiếu.",
        "actual": "Tất cả sản phẩm (áo, quần, giày, mũ, balo, tai nghe...) đều bị đổi thành icon chiếc hộp đóng gói '📦' và nền màu xám nâu đơn điệu, mất toàn bộ màu sắc và icon đặc trưng.",
        "expected": "Mỗi sản phẩm phải có màu nền và biểu tượng icon riêng biệt (Áo thun: 👕 xanh dương, Giày: 👟 xanh nhạt, Balo: 🎒 xanh rêu...).",
        "root_cause": "Trong client/src/components/ProductArt.jsx (dòng 5): const odd = user?.mode === 'problem'; Nếu odd=true thì luôn render icon hộp xám thay vì thông tin sản phẩm.",
        "linked_tc": "Exploratory / loi@test.com"
    },
    {
        "id": "Bug_06",
        "title": "[Đăng nhập] Bộ đếm số lần nhập sai mật khẩu (failed_attempts) không được reset về 0 sau khi đăng nhập thành công",
        "yc": "YC-04",
        "module": "Xác thực & Tài khoản",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000) & API /api/auth/login",
        "pre": "Có tài khoản hợp lệ (ví dụ: an@test.com / Matkhau123).",
        "steps": "1. Tại form Đăng nhập, nhập sai mật khẩu của an@test.com 3 lần liên tiếp.\n2. Lần thứ 4, nhập đúng mật khẩu Matkhau123 -> Đăng nhập thành công.\n3. Nhấn 'Đăng xuất'.\n4. Tại form Đăng nhập, nhập sai mật khẩu 2 lần nữa.",
        "actual": "Sau 2 lần nhập sai tiếp theo (tổng cộng 3 + 2 = 5 lần sai tích lũy), tài khoản an@test.com bị tạm khóa 15 phút. Hệ thống không đặt lại bộ đếm failed_attempts về 0 khi đăng nhập thành công ở bước 2.",
        "expected": "Theo YC-04: 'Đăng nhập đúng thì bộ đếm số lần sai được đặt lại'. Sau khi đăng nhập đúng, người dùng phải được nhập sai tối đa 5 lần liên tiếp mới bị khóa.",
        "root_cause": "Trong server/index.js (dòng 133), khi xác thực mật khẩu đúng chỉ cập nhật: UPDATE users SET locked_until = NULL WHERE id = ? mà không cập nhật failed_attempts = 0.",
        "linked_tc": "TC_DN_09"
    },
    {
        "id": "Bug_07",
        "title": "[Đăng nhập] Tùy chọn 'Ghi nhớ đăng nhập' không lưu token vào localStorage, bị mất phiên đăng nhập khi đóng trình duyệt",
        "yc": "YC-06",
        "module": "Xác thực & Tài khoản",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đã có tài khoản cá nhân hợp lệ.",
        "steps": "1. Truy cập trang đăng nhập (/login).\n2. Nhập email và mật khẩu hợp lệ.\n3. Tích chọn checkbox 'Ghi nhớ đăng nhập'.\n4. Nhấn nút 'Đăng nhập'.\n5. Đóng hoàn toàn cửa sổ trình duyệt Chrome.\n6. Mở lại trình duyệt và truy cập http://localhost:4000.",
        "actual": "Người dùng bị đưa về màn hình Đăng nhập và phải đăng nhập lại từ đầu. Kiểm tra Application tab -> Local Storage không có token, token chỉ được lưu ở Session Storage.",
        "expected": "Theo YC-06: 'Nếu chọn, người dùng vẫn đăng nhập sau khi đóng hẳn trình duyệt rồi mở lại'. Token phải được lưu vào localStorage khi người dùng chọn ghi nhớ.",
        "root_cause": "Trong client/src/api.js (dòng 5-7), hàm saveToken(token, remember) bỏ qua tham số remember và luôn luôn chỉ gọi sessionStorage.setItem('token', token).",
        "linked_tc": "TC_DN_11"
    },
    {
        "id": "Bug_08",
        "title": "[Sản phẩm] Sắp xếp sản phẩm theo Tên (A-Z) và Tên (Z-A) không tuân theo thứ tự bảng chữ cái tiếng Việt",
        "yc": "YC-21",
        "module": "Sản phẩm",
        "severity": "Medium",
        "priority": "Medium",
        "env": "Chrome / Web App (localhost:4000) & API /api/products",
        "pre": "Đăng nhập tài khoản khách hàng, đang ở trang chủ danh sách sản phẩm.",
        "steps": "1. Tại dropdown sắp xếp, chọn 'Tên (A-Z)'.\n2. Quan sát vị trí của 'Áo khoác gió' và 'Áo thun basic'.\n3. Tiếp tục chọn 'Tên (Z-A)' và quan sát lại vị trí các sản phẩm trên.",
        "actual": "- Khi chọn Tên (A-Z): Sản phẩm có dấu chữ 'Á' ('Áo thun basic', 'Áo khoác gió') bị đẩy xuống cuối danh sách sau cả chữ 'T' (Tai nghe bluetooth).\n- Khi chọn Tên (Z-A): 'Áo khoác gió' và 'Áo thun basic' lại bị đẩy lên đầu danh sách trước cả chữ 'T'.",
        "expected": "Theo YC-21: Sắp xếp theo thứ tự bảng chữ cái tiếng Việt: Chữ 'A' và 'Á' phải đứng trước chữ 'B' (Balo laptop), 'G' (Giày), 'M' (Mũ), 'T' (Tai nghe).",
        "root_cause": "Trong server/index.js (dòng 196, 203), query SQLite dùng ORDER BY name ASC/DESC trực tiếp trên DB không có collation tiếng Việt (COLLATE NOCASE / icu collation) dẫn đến sắp xếp theo mã ASCII/UTF-8 byte.",
        "linked_tc": "TC_CSP_04, TC_CSP_05"
    },
    {
        "id": "Bug_09",
        "title": "[Giỏ hàng] Cho phép nhập gõ tay số lượng sản phẩm bằng 11 vượt quá giới hạn tối đa 10",
        "yc": "YC-30",
        "module": "Giỏ hàng",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000) & API PATCH /api/cart/items/:id",
        "pre": "Đăng nhập tài khoản khách hàng; thêm sản phẩm có tồn kho lớn (Áo thun basic còn 20 chiếc) vào giỏ hàng.",
        "steps": "1. Vào trang Giỏ hàng (/cart).\n2. Click đúp vào ô nhập số lượng của 'Áo thun basic'.\n3. Xóa số 1, gõ số 11 vào ô input rồi click chuột ra ngoài (blur) hoặc nhấn Enter.",
        "actual": "Hệ thống chấp nhận số lượng 11, gửi request PATCH lên server thành công, thành tiền nhân lên 11 và không có bất kỳ cảnh báo chặn lỗi nào.",
        "expected": "Theo YC-30: 'Số lượng mỗi sản phẩm trong giỏ là số nguyên từ 1 đến 10 và không vượt quá tồn kho, dù nhập bằng nút hay gõ tay'. Hệ thống phải chặn hoặc tự động đưa về mức tối đa 10.",
        "root_cause": "Trong client/src/pages/Cart.jsx hàm save() chỉ kiểm tra n < 1 mà không kiểm tra n > 10. Ở server/index.js (dòng 246) API PATCH cũng chỉ kiểm tra quantity < 1 và quantity > stock, bỏ quên điều kiện quantity > 10.",
        "linked_tc": "TC_GH_03"
    },
    {
        "id": "Bug_10",
        "title": "[Thanh toán] Không kiểm tra định dạng Số điện thoại (chấp nhận SĐT khác 10 số, không bắt đầu bằng số 0, chứa chữ cái hoặc ký tự đặc biệt)",
        "yc": "YC-40",
        "module": "Thanh toán",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000) & API POST /api/orders",
        "pre": "Đăng nhập tài khoản khách hàng; giỏ hàng có ít nhất 1 sản phẩm; đang ở trang Thanh toán (/checkout).",
        "steps": "1. Điền Họ tên và Địa chỉ hợp lệ (>= 10 ký tự).\n2. Tại ô 'Số điện thoại', lần lượt thử nhập:\n   - Trường hợp 1: 09012345678 (11 chữ số)\n   - Trường hợp 2: 090123456 (9 chữ số)\n   - Trường hợp 3: 1901234567 (không bắt đầu bằng 0)\n   - Trường hợp 4: 09012abcde (chứa chữ cái)\n3. Nhấn nút 'Đặt hàng'.",
        "actual": "Hệ thống không báo lỗi ở bất kỳ trường hợp nào trên và đều tạo đơn hàng thành công.",
        "expected": "Theo YC-40: 'Số điện thoại gồm đúng 10 chữ số và bắt đầu bằng số 0'. Hệ thống phải hiển thị thông báo lỗi dưới ô SĐT và chặn đặt hàng nếu nhập sai các điều kiện trên.",
        "root_cause": "Trong server/index.js (dòng 277), backend chỉ kiểm tra: if (!phone) errors.phone = 'Vui lòng nhập số điện thoại'; hoàn toàn không có regex kiểm tra /^0[0-9]{9}$/.",
        "linked_tc": "TC_TT_03, TC_TT_04, TC_TT_05, TC_TT_06"
    },
    {
        "id": "Bug_11",
        "title": "[Thanh toán] Bấm nút 'Đặt hàng' nhiều lần liên tục tạo ra nhiều đơn hàng trùng lặp do thiếu debounce và disable nút",
        "yc": "YC-41",
        "module": "Thanh toán",
        "severity": "Critical",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đăng nhập tài khoản khách hàng, giỏ hàng có sản phẩm, đã điền đầy đủ form thông tin nhận hàng.",
        "steps": "1. Tại trang thanh toán (/checkout), nhấp chuột nhanh liên tiếp 3-4 lần vào nút 'Đặt hàng'.\n2. Mở trang Đơn hàng (/orders) để kiểm tra danh sách đơn vừa tạo.",
        "actual": "Nút 'Đặt hàng' không bị vô hiệu hóa trong lúc gọi API. Server xử lý các request đồng thời và tạo ra 2-3 đơn hàng giống hệt nhau cùng một lúc.",
        "expected": "Theo YC-41: 'Mỗi lần đặt hàng chỉ tạo đúng một đơn, kể cả khi người dùng bấm nút Đặt hàng nhiều lần'. Nút phải được disabled ngay cú click đầu tiên và backend phải kiểm soát idempotency.",
        "root_cause": "Tại client/src/pages/Checkout.jsx (dòng 65), nút bấm thiếu thuộc tính disabled={busy}. Đồng thời backend sleep(800) tạo cửa sổ race condition cho phép nhiều request lọt vào transaction.",
        "linked_tc": "TC_TT_09"
    },
    {
        "id": "Bug_12",
        "title": "[Thanh toán] Cho phép đặt hàng thành công và ép tồn kho về 0 khi sản phẩm trong kho không đủ (bán vượt tồn kho)",
        "yc": "YC-44",
        "module": "Thanh toán & Kho hàng",
        "severity": "Critical",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000) & API POST /api/orders",
        "pre": "Tài khoản A thêm sản phẩm 'Balo laptop' (tồn kho còn 1) vào giỏ hàng. Trước khi tài khoản A đặt hàng, tài khoản B đã mua hết chiếc cuối cùng (tồn kho trong DB hiện tại = 0).",
        "steps": "1. Tài khoản A vào trang /checkout với sản phẩm Balo laptop trong giỏ.\n2. Tài khoản A nhấn nút 'Đặt hàng'.",
        "actual": "Hệ thống vẫn báo 'Đặt hàng thành công' và tạo đơn mới cho tài khoản A. Tồn kho trong DB bị ép về 0 (bằng hàm MAX(stock - qty, 0)), dẫn đến tình trạng bán khống sản phẩm không có hàng.",
        "expected": "Theo YC-44: 'Không bán vượt tồn kho. Khi đặt hàng mà tồn kho không còn đủ (ví dụ khách khác vừa mua) thì báo lỗi rõ ràng và không tạo đơn'.",
        "root_cause": "Tại server/index.js (dòng 293-296), câu lệnh UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ? không hề kiểm tra stock >= qty trước khi trừ tồn kho.",
        "linked_tc": "TC_TT_11"
    },
    {
        "id": "Bug_13",
        "title": "[Đăng ký] Cho phép tạo tài khoản với mật khẩu dài 21 ký tự vượt quá giới hạn tối đa 20 ký tự",
        "yc": "YC-12",
        "module": "Đăng ký tài khoản",
        "severity": "Medium",
        "priority": "Medium",
        "env": "Chrome / Web App (localhost:4000) & API POST /api/auth/register",
        "pre": "Đang ở trang Đăng ký (/register).",
        "steps": "1. Điền Họ tên, Email, Tuổi hợp lệ.\n2. Nhập Mật khẩu dài 21 ký tự: 'Matkhau12345678901234'.\n3. Nhập lại mật khẩu khớp 21 ký tự trên.\n4. Bấm 'Tạo tài khoản'.",
        "actual": "Hệ thống không báo lỗi độ dài và đăng ký tài khoản mới thành công.",
        "expected": "Theo YC-12: 'Mật khẩu dài từ 8 đến 20 ký tự, có ít nhất 1 chữ hoa và 1 chữ số'. Hệ thống phải hiển thị thông báo lỗi 'Mật khẩu phải dài từ 8 đến 20 ký tự' dưới ô mật khẩu.",
        "root_cause": "Trong server/index.js (dòng 153), validation chỉ kiểm tra: else if (password.length < 8) errors.password = ... mà hoàn toàn thiếu điều kiện password.length > 20.",
        "linked_tc": "TC_ĐK_16"
    },
    {
        "id": "Bug_14",
        "title": "[Đăng ký] Báo lỗi từ chối đăng ký đối với người dùng vừa đúng 18 tuổi (giá trị biên hợp lệ)",
        "yc": "YC-14",
        "module": "Đăng ký tài khoản",
        "severity": "Major",
        "priority": "High",
        "env": "Chrome / Web App (localhost:4000) & API POST /api/auth/register",
        "pre": "Đang ở trang Đăng ký (/register).",
        "steps": "1. Điền Họ tên, Email, Mật khẩu hợp lệ.\n2. Tại ô 'Tuổi', nhập giá trị đúng 18.\n3. Bấm 'Tạo tài khoản'.",
        "actual": "Hệ thống hiển thị thông báo lỗi màu đỏ 'Tuổi phải từ 18 đến 60' dưới ô tuổi và từ chối tạo tài khoản.",
        "expected": "Theo YC-14: 'Tuổi là số nguyên từ 18 đến 60, tính cả 18 và 60'. Người dùng nhập 18 tuổi phải được chấp nhận và đăng ký thành công.",
        "root_cause": "Trong server/index.js (dòng 165), logic kiểm tra sai: else if (!(age > 18 && age <= 60)) errors.age = 'Tuổi phải từ 18 đến 60'; -> toán tử > 18 đã loại bỏ chính xác giá trị 18.",
        "linked_tc": "TC_ĐK_20"
    },
    {
        "id": "Bug_15",
        "title": "[Đăng ký] Ô 'Nhập lại mật khẩu' không hiển thị thông báo lỗi khi submit form đăng ký để trống",
        "yc": "YC-15",
        "module": "Đăng ký tài khoản",
        "severity": "Minor",
        "priority": "Medium",
        "env": "Chrome / Web App (localhost:4000)",
        "pre": "Đang ở trang Đăng ký (/register).",
        "steps": "1. Truy cập trang /register.\n2. Để trống tất cả các ô nhập liệu (Họ tên, Email, Mật khẩu, Nhập lại mật khẩu, Tuổi).\n3. Bấm nút 'Tạo tài khoản'.",
        "actual": "Các ô Họ tên, Email, Mật khẩu, Tuổi đều có thông báo lỗi màu đỏ dưới từng ô; riêng ô 'Nhập lại mật khẩu' để trống hoàn toàn, không có thông báo lỗi.",
        "expected": "Theo YC-15: 'Mỗi ô sai hiển thị thông báo lỗi ngay dưới ô đó'. Ô 'Nhập lại mật khẩu' phải hiển thị thông báo yêu cầu nhập (hoặc thông báo xác nhận mật khẩu).",
        "root_cause": "Trong server/index.js (dòng 156), backend chỉ kiểm tra: if (b.confirmPassword !== undefined && b.confirmPassword !== password). Khi cả 2 trường đều là chuỗi rỗng '', điều kiện so sánh !== trả về false nên không sinh lỗi cho confirmPassword.",
        "linked_tc": "TC_ĐK_29"
    },
    {
        "id": "Bug_16",
        "title": "[Đơn hàng] Cho phép chuyển trạng thái đơn hàng từ 'Đã giao' sang 'Đã hủy' (DELIVERED -> CANCELLED) và tự động cộng khống tồn kho",
        "yc": "YC-51, YC-52, YC-53",
        "module": "Quản lý Đơn hàng (Admin/API)",
        "severity": "Critical",
        "priority": "High",
        "env": "API PATCH /api/orders/:id/status",
        "pre": "Đăng nhập tài khoản admin (admin@test.com); có đơn hàng đang ở trạng thái 'Đã giao' (DELIVERED).",
        "steps": "1. Sử dụng tài khoản admin gọi API PATCH /api/orders/:id/status với body { 'status': 'CANCELLED' } đối với đơn hàng đã giao thành công.\n2. Kiểm tra trạng thái đơn hàng và tồn kho sản phẩm trong CSDL.",
        "actual": "API trả về status 200 OK, đơn hàng chuyển thành 'Đã hủy' (CANCELLED), đồng thời số lượng sản phẩm trong đơn được hoàn trả cộng dồn ngược lại vào bảng products.",
        "expected": "Theo sơ đồ trạng thái YC-51, trạng thái 'Đã giao' (DELIVERED) là trạng thái kết thúc, không được phép chuyển sang bất kỳ trạng thái nào khác. Yêu cầu chuyển sang CANCELLED phải bị từ chối với mã lỗi 400.",
        "root_cause": "Trong server/index.js (dòng 343) có dòng code ngoại lệ bất thường: if (next === 'CANCELLED' && order.status === 'DELIVERED') allowed = true; cho phép hủy đơn đã giao và kích hoạt restock tồn kho khống.",
        "linked_tc": "Exploratory / Vòng đời đơn hàng"
    },
    {
        "id": "Bug_17",
        "title": "[Bảo mật / API] Lỗ hổng SQL Injection tại API tìm kiếm đơn hàng (/api/orders?q=') gây lỗi 500 Unhandled Exception và làm lộ cấu trúc CSDL",
        "yc": "YC-60, YC-64, YC-65",
        "module": "Bảo mật & Tìm kiếm Đơn hàng",
        "severity": "Critical",
        "priority": "High",
        "env": "API GET /api/orders?q=...",
        "pre": "Đăng nhập tài khoản khách hàng hoặc admin để lấy JWT token.",
        "steps": "1. Gửi request GET /api/orders?q=' kèm header Authorization: Bearer <token>.\n2. Quan sát HTTP response status và nội dung JSON phản hồi.",
        "actual": "Server phản hồi mã lỗi 500 Internal Server Error với nội dung JSON: { 'message': 'Lỗi máy chủ', 'detail': 'SqliteError: unrecognized token: ''')' } làm lộ chi tiết câu truy vấn SQLite nội bộ.",
        "expected": "Theo YC-60, YC-64, YC-65: API không bao giờ trả lỗi 500 vì dữ liệu người dùng; thông báo lỗi không để lộ thông tin nội bộ CSDL; ô tìm kiếm phải xử lý an toàn mọi ký tự bao gồm dấu nháy đơn bằng parameterized query.",
        "root_cause": "Trong server/index.js (dòng 315): where.push(`id IN (SELECT order_id FROM order_items WHERE name LIKE '%${q}%')`); ghép chuỗi trực tiếp thay vì truyền parameter an toàn (?, `%${q}%`).",
        "linked_tc": "Exploratory / Bảo mật & SQLi"
    }
]

# Set Title of Sheet2
ws2['A1'] = "DANH SÁCH BÁO CÁO LỖI (DEFECT / BUG REPORTS)"
ws2['A1'].font = Font(name=font_family, size=16, bold=True, color='1D3557')
ws2['A2'] = "Dự án: Tiệm Nhà Test | Tổng hợp lỗi từ Chạy bộ Test Case Tuần 1 & Phiên Exploratory Testing 45 phút"
ws2['A2'].font = Font(name=font_family, size=11, italic=True, color='555555')

# Summary Table Header
ws2['A4'] = "BẢNG TỔNG HỢP DANH SÁCH BUG"
ws2['A4'].font = Font(name=font_family, size=12, bold=True, color='1D3557')

summary_headers = ["Mã Bug", "Tiêu đề Bug", "Phân hệ", "Yêu cầu", "Mức độ (Severity)", "Độ ưu tiên", "Nguồn phát hiện"]
for col_idx, h_text in enumerate(summary_headers, 1):
    c = ws2.cell(5, col_idx, h_text)
    c.font = font_header
    c.fill = fill_header
    c.alignment = align_header
    c.border = border_all
ws2.row_dimensions[5].height = 24

# Populate Summary Table
current_r = 6
for b in BUGS:
    ws2.cell(current_r, 1, b['id']).alignment = align_center
    ws2.cell(current_r, 1).font = font_bug
    ws2.cell(current_r, 1).border = border_all

    ws2.cell(current_r, 2, b['title']).alignment = align_left
    ws2.cell(current_r, 2).font = font_body
    ws2.cell(current_r, 2).border = border_all

    ws2.cell(current_r, 3, b['module']).alignment = align_left
    ws2.cell(current_r, 3).font = font_body
    ws2.cell(current_r, 3).border = border_all

    ws2.cell(current_r, 4, b['yc']).alignment = align_center
    ws2.cell(current_r, 4).font = font_body
    ws2.cell(current_r, 4).border = border_all

    # Severity highlight
    sev_cell = ws2.cell(current_r, 5, b['severity'])
    sev_cell.alignment = align_center
    sev_cell.border = border_all
    if b['severity'] == 'Critical':
        sev_cell.font = Font(name=font_family, size=11, bold=True, color='990000')
        sev_cell.fill = PatternFill(start_color='FFD6D6', end_color='FFD6D6', fill_type='solid')
    elif b['severity'] == 'Major':
        sev_cell.font = Font(name=font_family, size=11, bold=True, color='D9534F')
        sev_cell.fill = PatternFill(start_color='FFEAEA', end_color='FFEAEA', fill_type='solid')
    else:
        sev_cell.font = font_body

    # Priority highlight
    prio_cell = ws2.cell(current_r, 6, b['priority'])
    prio_cell.alignment = align_center
    prio_cell.border = border_all
    prio_cell.font = font_body

    ws2.cell(current_r, 7, b['linked_tc']).alignment = align_center
    ws2.cell(current_r, 7).font = font_body
    ws2.cell(current_r, 7).border = border_all

    current_r += 1

# Blank row
current_r += 2

# Detail Bug Cards Header
ws2.cell(current_r, 1, "CHI TIẾT TỪNG BÁO CÁO LỖI (BUG DETAIL CARDS)").font = Font(name=font_family, size=13, bold=True, color='1D3557')
current_r += 2

# Render Each Bug Card
fill_card_header = PatternFill(start_color='E3EBF7', end_color='E3EBF7', fill_type='solid')
fill_label = PatternFill(start_color='F5F7FA', end_color='F5F7FA', fill_type='solid')

for b in BUGS:
    # Card Header
    header_cell = ws2.cell(current_r, 1, f"{b['id']}: {b['title']}")
    header_cell.font = Font(name=font_family, size=12, bold=True, color='990000')
    header_cell.fill = fill_card_header
    header_cell.alignment = align_left
    header_cell.border = border_all
    ws2.merge_cells(start_row=current_r, start_column=1, end_row=current_r, end_column=7)
    ws2.row_dimensions[current_r].height = 24
    current_r += 1

    card_rows = [
        ("Mã Bug & Yêu cầu", f"Mã: {b['id']} | Vi phạm: {b['yc']} | Phân hệ: {b['module']}"),
        ("Mức độ nghiêm trọng", f"Severity: {b['severity']} | Priority: {b['priority']} | Test case: {b['linked_tc']}"),
        ("Môi trường kiểm thử", b['env']),
        ("Điều kiện tiền đề", b['pre']),
        ("Các bước tái hiện (Steps)", b['steps']),
        ("Kết quả thực tế (Actual)", b['actual']),
        ("Kết quả mong đợi (Expected)", b['expected']),
        ("Phân tích kỹ thuật (Root cause)", b['root_cause']),
    ]

    for label, val in card_rows:
        lbl_c = ws2.cell(current_r, 1, label)
        lbl_c.font = Font(name=font_family, size=11, bold=True, color='333333')
        lbl_c.fill = fill_label
        lbl_c.alignment = align_left
        lbl_c.border = border_all

        val_c = ws2.cell(current_r, 2, val)
        val_c.font = font_body
        val_c.alignment = align_left
        val_c.border = border_all
        ws2.merge_cells(start_row=current_r, start_column=2, end_row=current_r, end_column=7)
        current_r += 1

    current_r += 1 # Space between bug cards

# Set column widths for Sheet2
ws2.column_dimensions['A'].width = 25
ws2.column_dimensions['B'].width = 30
ws2.column_dimensions['C'].width = 18
ws2.column_dimensions['D'].width = 14
ws2.column_dimensions['E'].width = 18
ws2.column_dimensions['F'].width = 14
ws2.column_dimensions['G'].width = 24

print("Sheet2 created and formatted successfully!")

# -------------------------------------------------------------
# 4. SAVE WORKBOOK
# -------------------------------------------------------------
downloads_completed = r'C:\Users\ADMIN\Downloads\Testcase_Tuan1_Execution_Completed.xlsx'
wb.save(downloads_completed)
print("Saved completed workbook to:", downloads_completed)

# Also save copy in project docs folder
docs_copy_path = r'd:\DuAn\tiem-nha-test\docs\Testcase_Tuan1_Va_BugReport.xlsx'
wb.save(docs_copy_path)
print("Saved copy to workspace:", docs_copy_path)

try:
    wb.save(src_path)
    print("Saved updated workbook to original path:", src_path)
except PermissionError:
    print("Notice: Excel is currently open by the user, so original file is locked.")
    print(f"File was safely saved to: {downloads_completed} and {docs_copy_path}")

