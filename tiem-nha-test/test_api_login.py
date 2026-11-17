"""
Kịch bản kiểm thử tự động API Đăng nhập (POST /api/auth/login) - Tiệm Nhà Test
Chạy script: python test_api_login.py
"""

import requests
import json
import sys

BASE_URL = "http://localhost:4000/api"

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def reset_db():
    res = requests.post(f"{BASE_URL}/test/reset")
    if res.status_code != 204:
        raise Exception(f"Không thể reset database: {res.status_code}")

def run_tests():
    print(f"{Colors.BOLD}{Colors.HEADER}========================================================================{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}    BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG API ĐĂNG NHẬP (POST /api/auth/login)     {Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}========================================================================{Colors.ENDC}\n")

    results = []

    def log_result(tc_id, tc_name, technique, is_passed, expected, actual, note=""):
        status_text = f"{Colors.OKGREEN}PASS{Colors.ENDC}" if is_passed else f"{Colors.FAIL}FAIL (BUG){Colors.ENDC}"
        results.append({
            "id": tc_id,
            "name": tc_name,
            "technique": technique,
            "passed": is_passed,
            "expected": expected,
            "actual": actual,
            "note": note
        })
        print(f"[{tc_id}] {tc_name}")
        print(f"  - Kỹ thuật: {technique}")
        print(f"  - Mong đợi : {expected}")
        print(f"  - Thực tế  : {actual}")
        print(f"  - Kết quả  : {status_text}")
        if note:
            print(f"  - Ghi chú  : {Colors.WARNING}{note}{Colors.ENDC}")
        print("-" * 72)

    # -------------------------------------------------------------
    # Nhóm 1: Positive Test Cases (Kiểm thử chức năng hợp lệ)
    # -------------------------------------------------------------

    # TC_API_DN_01: Đăng nhập thành công với tài khoản khách hàng hợp lệ
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "an@test.com", "password": "Matkhau123"})
    data = r.json() if r.status_code == 200 else {}
    passed = (r.status_code == 200 and isinstance(data.get("token"), str) and data.get("user", {}).get("email") == "an@test.com" and data.get("user", {}).get("role") == "customer")
    log_result(
        "TC_API_DN_01",
        "Đăng nhập thành công với tài khoản khách hàng hợp lệ",
        "Phân vùng tương đương (EP - Hợp lệ)",
        passed,
        "HTTP 200, trả về token dạng chuỗi và object user (role: customer)",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_02: Đăng nhập thành công với tài khoản quản trị viên (admin)
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@test.com", "password": "Matkhau123"})
    data = r.json() if r.status_code == 200 else {}
    passed = (r.status_code == 200 and isinstance(data.get("token"), str) and data.get("user", {}).get("role") == "admin")
    log_result(
        "TC_API_DN_02",
        "Đăng nhập thành công với tài khoản quản trị viên (admin)",
        "Phân vùng tương đương (EP - Hợp lệ)",
        passed,
        "HTTP 200, trả về token và user.role = 'admin'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_03: Đăng nhập với email viết hoa (Không phân biệt hoa thường - YC-01)
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "AN@TEST.COM", "password": "Matkhau123"})
    passed = (r.status_code == 200 and "token" in r.json())
    log_result(
        "TC_API_DN_03",
        "Đăng nhập với email viết hoa hoàn toàn (YC-01)",
        "Phân vùng tương đương (EP)",
        passed,
        "HTTP 200, đăng nhập thành công do email không phân biệt chữ hoa/thường",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_04: Đăng nhập với email có khoảng trắng ở đầu và cuối (YC-01)
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "  an@test.com  ", "password": "Matkhau123"})
    passed = (r.status_code == 200 and "token" in r.json())
    log_result(
        "TC_API_DN_04",
        "Đăng nhập với email chứa khoảng trắng ở đầu và cuối (YC-01)",
        "Phân tích giá trị biên (BVA) / Xử lý chuỗi",
        passed,
        "HTTP 200, hệ thống tự động bỏ qua khoảng trắng thừa và trả về token",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}",
        note="BUG: Server không thực hiện trim() khoảng trắng đầu/cuối của email nên báo sai tài khoản (401)!"
    )

    # -------------------------------------------------------------
    # Nhóm 2: Negative Test Cases - Thiếu / Sai dữ liệu đầu vào (400 Bad Request)
    # -------------------------------------------------------------

    # TC_API_DN_05: Để trống trường email (chuỗi rỗng)
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "", "password": "Matkhau123"})
    passed = (r.status_code == 400 and r.json().get("message") == "Vui lòng nhập email và mật khẩu")
    log_result(
        "TC_API_DN_05",
        "Gửi request với email là chuỗi rỗng",
        "Phân tích giá trị biên (BVA)",
        passed,
        "HTTP 400, message: 'Vui lòng nhập email và mật khẩu'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_06: Thiếu trường email trong payload
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"password": "Matkhau123"})
    passed = (r.status_code == 400 and r.json().get("message") == "Vui lòng nhập email và mật khẩu")
    log_result(
        "TC_API_DN_06",
        "Gửi payload JSON không có key email",
        "Phỏng đoán lỗi (Error Guessing)",
        passed,
        "HTTP 400, message: 'Vui lòng nhập email và mật khẩu'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_07: Để trống trường mật khẩu (chuỗi rỗng)
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "an@test.com", "password": ""})
    passed = (r.status_code == 400 and r.json().get("message") == "Vui lòng nhập email và mật khẩu")
    log_result(
        "TC_API_DN_07",
        "Gửi request với password là chuỗi rỗng",
        "Phân tích giá trị biên (BVA)",
        passed,
        "HTTP 400, message: 'Vui lòng nhập email và mật khẩu'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_08: Thiếu trường password trong payload
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "an@test.com"})
    passed = (r.status_code == 400 and r.json().get("message") == "Vui lòng nhập email và mật khẩu")
    log_result(
        "TC_API_DN_08",
        "Gửi payload JSON không có key password",
        "Phỏng đoán lỗi (Error Guessing)",
        passed,
        "HTTP 400, message: 'Vui lòng nhập email và mật khẩu'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_09: Request body là object rỗng {}
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={})
    passed = (r.status_code == 400 and r.json().get("message") == "Vui lòng nhập email và mật khẩu")
    log_result(
        "TC_API_DN_09",
        "Gửi request body rỗng {}",
        "Phỏng đoán lỗi (Error Guessing)",
        passed,
        "HTTP 400, message: 'Vui lòng nhập email và mật khẩu'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # -------------------------------------------------------------
    # Nhóm 3: Negative Test Cases - Sai thông tin xác thực (401 Unauthorized - YC-02)
    # -------------------------------------------------------------

    # TC_API_DN_10: Nhập email không tồn tại trong hệ thống
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "khongtontai@test.com", "password": "Matkhau123"})
    passed = (r.status_code == 401 and r.json().get("message") == "Email hoặc mật khẩu không đúng")
    log_result(
        "TC_API_DN_10",
        "Đăng nhập với email không tồn tại trong database (YC-02)",
        "Phân vùng tương đương (EP - Không hợp lệ)",
        passed,
        "HTTP 401, message: 'Email hoặc mật khẩu không đúng' (không làm lộ việc email tồn tại hay không)",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_11: Nhập đúng email nhưng sai mật khẩu
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "an@test.com", "password": "SaiMatKhau999"})
    passed = (r.status_code == 401 and r.json().get("message") == "Email hoặc mật khẩu không đúng")
    log_result(
        "TC_API_DN_11",
        "Đăng nhập đúng email nhưng sai mật khẩu (YC-02)",
        "Phân vùng tương đương (EP - Không hợp lệ)",
        passed,
        "HTTP 401, message: 'Email hoặc mật khẩu không đúng'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # -------------------------------------------------------------
    # Nhóm 4: Tài khoản bị khóa & Chuyển trạng thái (403 Forbidden - YC-04, YC-05)
    # -------------------------------------------------------------

    # TC_API_DN_12: Đăng nhập vào tài khoản đã bị khóa vĩnh viễn
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "khoa@test.com", "password": "Matkhau123"})
    passed = (r.status_code == 403 and "Tài khoản đã bị khóa" in r.json().get("message", ""))
    log_result(
        "TC_API_DN_12",
        "Đăng nhập vào tài khoản đã bị khóa vĩnh viễn (khoa@test.com - YC-05)",
        "Phân vùng tương đương (EP)",
        passed,
        "HTTP 403, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.'",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_13: Nhập sai mật khẩu 5 lần liên tiếp kích hoạt khóa tạm thời 15 phút (YC-04)
    reset_db()
    statuses = []
    for i in range(1, 6):
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "binh@test.com", "password": f"Wrong_{i}"})
        statuses.append(resp.status_code)
    
    passed = (statuses[:4] == [401, 401, 401, 401] and statuses[4] == 403)
    log_result(
        "TC_API_DN_13",
        "Nhập sai mật khẩu 5 lần liên tiếp kích hoạt khóa tạm thời 15 phút (YC-04)",
        "Kiểm thử chuyển trạng thái (State Transition) / Phân tích giá trị biên (BVA)",
        passed,
        "Lần 1-4 trả về HTTP 401; Lần 5 trả về HTTP 403 'Tài khoản tạm khóa 15 phút...'",
        f"Chuỗi status code nhận được: {statuses}"
    )

    # TC_API_DN_14: Cố gắng đăng nhập khi tài khoản đang trong 15 phút bị khóa tạm (kể cả nhập đúng mật khẩu)
    # Tiếp nối trạng thái của binh@test.com sau khi vừa bị khóa ở TC_API_DN_13
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "binh@test.com", "password": "Matkhau123"})
    passed = (r.status_code == 403 and "Tài khoản tạm khóa 15 phút" in r.json().get("message", ""))
    log_result(
        "TC_API_DN_14",
        "Cố gắng đăng nhập với mật khẩu ĐÚNG khi tài khoản đang bị tạm khóa (YC-04)",
        "Kiểm thử chuyển trạng thái (State Transition)",
        passed,
        "HTTP 403, từ chối đăng nhập do tài khoản đang trong thời gian tạm khóa",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # TC_API_DN_15: Đăng nhập đúng mật khẩu phải reset bộ đếm failed_attempts về 0 (YC-04)
    reset_db()
    # Bước 1: Nhập sai 3 lần liên tiếp
    for _ in range(3):
        requests.post(f"{BASE_URL}/auth/login", json={"email": "binh@test.com", "password": "WrongPassword"})
    # Bước 2: Đăng nhập đúng mật khẩu (kỳ vọng thành công và reset counter về 0)
    r_success = requests.post(f"{BASE_URL}/auth/login", json={"email": "binh@test.com", "password": "Matkhau123"})
    # Bước 3: Nhập sai thêm 2 lần nữa. Nếu counter đã về 0 thì lần 1 và 2 mới này CHƯA thể bị khóa (phải là 401).
    # Nhưng nếu hệ thống không reset counter, lần 2 mới sẽ là lần 5 cộng dồn => bị khóa 403!
    r_wrong1 = requests.post(f"{BASE_URL}/auth/login", json={"email": "binh@test.com", "password": "WrongPassword"})
    r_wrong2 = requests.post(f"{BASE_URL}/auth/login", json={"email": "binh@test.com", "password": "WrongPassword"})
    
    passed = (r_success.status_code == 200 and r_wrong1.status_code == 401 and r_wrong2.status_code == 401)
    log_result(
        "TC_API_DN_15",
        "Đăng nhập đúng phải reset số lần sai về 0 (YC-04)",
        "Kiểm thử chuyển trạng thái (State Transition)",
        passed,
        "Sau khi đăng nhập đúng, nhập sai tiếp 2 lần chỉ trả về 401 (chưa đủ 5 lần liên tiếp để bị khóa)",
        f"Đăng nhập đúng: {r_success.status_code}, Sau đó sai lần 1: {r_wrong1.status_code}, Sai lần 2: {r_wrong2.status_code}",
        note="BUG: Sau khi đăng nhập đúng, server KHÔNG reset failed_attempts về 0, dẫn đến việc bị khóa sớm khi chỉ mới sai 2 lần tiếp theo!"
    )

    # -------------------------------------------------------------
    # Nhóm 5: Security / Robustness Test
    # -------------------------------------------------------------

    # TC_API_DN_16: Thử payload SQL Injection vào trường email
    reset_db()
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "an@test.com' OR '1'='1", "password": "Matkhau123"})
    passed = (r.status_code == 401 and r.json().get("message") == "Email hoặc mật khẩu không đúng")
    log_result(
        "TC_API_DN_16",
        "Kiểm tra bảo mật: SQL Injection qua trường email",
        "Kiểm thử bảo mật (Security Testing)",
        passed,
        "HTTP 401, không bị bypass authentication hay crash database",
        f"HTTP {r.status_code}, body: {json.dumps(r.json(), ensure_ascii=False)}"
    )

    # -------------------------------------------------------------
    # Tổng kết
    # -------------------------------------------------------------
    total = len(results)
    total_passed = sum(1 for x in results if x["passed"])
    total_failed = total - total_passed

    print("\n" + "=" * 72)
    print(f"{Colors.BOLD}BÁO CÁO TỔNG HỢP KIỂM THỬ API ĐĂNG NHẬP:{Colors.ENDC}")
    print(f"Tổng số test case thực thi : {total}")
    print(f"Số lượng ĐẠT (Passed)       : {Colors.OKGREEN}{total_passed}{Colors.ENDC}")
    print(f"Số lượng LỖI (Failed / Bugs): {Colors.FAIL}{total_failed}{Colors.ENDC}")
    print(f"Tỷ lệ thành công            : {total_passed / total * 100:.1f}%")
    print("=" * 72)

if __name__ == "__main__":
    run_tests()
