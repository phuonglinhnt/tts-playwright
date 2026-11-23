export const validlLoginApiCases = [
  {
    caseName: "Thành công",
    email: "an@test.com",
    password: "Matkhau123",
    expectedStatus: 200,
    expectedMessage: null,
  },
  {
    caseName: "Không phân biệt chữ hoa, chữ thường",
    email: "AN@test.com",
    password: "Matkhau123",
    expectedStatus: 200,
    expectedMessage: null,
  },
];

export const invalidLoginAPICases = [
  {
    caseName: "Email không tồn tại trong hệ thống",
    email: "khongtontai@test.com",
    password: "Matkhau123",
    expectedStatus: 401,
    expectedMessage: "Email hoặc mật khẩu không đúng",
  },
  {
    caseName: "Đúng email, sai mật khẩu",
    email: "an@test.com",
    password: "Saimatkhau1223",
    expectedStatus: 401,
    expectedMessage: "Email hoặc mật khẩu không đúng",
  },
  {
    caseName: "Sai email, đúng mật khẩu",
    email: "sai@test.com",
    password: "Matkhau1223",
    expectedStatus: 401,
    expectedMessage: "Email hoặc mật khẩu không đúng",
  },
  {
    caseName: "Để trống trường mật khẩu",
    email: "sai@test.com",
    password: "",
    expectedStatus: 400,
    expectedMessage: "Vui lòng nhập email và mật khẩu",
  },
  {
    caseName: "Để trống trường email",
    email: "",
    password: "Matkhau123",
    expectedStatus: 400,
    expectedMessage: "Vui lòng nhập email và mật khẩu",
  },
  {
    caseName: "Tài khoản bị khóa vĩnh viễn",
    email: "khoa@test.com",
    password: "Matkhau123",
    expectedStatus: 403,
    expectedMessage: "Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.",
  },
];
