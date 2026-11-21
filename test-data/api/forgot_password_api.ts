export const forgotPasswordApiCases = [
  {
    caseName: "Email chưa từng đăng ký",
    email: "khongtontai@test.com",
    expectedStatus: 200,
    expectedMessage: "Nếu email đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
  },
  {
    caseName: "Email đã tồn tại trong hệ thống",
    email: "an@test.com",
    expectedStatus: 200,
    expectedMessage: "Nếu email đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
  },
  {
    caseName: "Email để trống",
    email: "",
    expectedStatus: 400,
    expectedMessage: "Vui lòng nhập email",
  },
  {
    caseName: "Email sai định dạng",
    email: "test.com",
    expectedStatus: 400,
    expectedMessage: "Email không đúng định dạng",
  },
];