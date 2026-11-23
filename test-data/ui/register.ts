export const vaildCreateCases = [
  {
    caseName: "Giá trị hợp lệ ",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 21,
  },
  {
    caseName: "Tuổi 18",
    name: "Nguyenvana",
    email: "chuatontai2@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 18,
    bug: "INTERN-21: Backend từ chối tuổi 18"
  },
  {
    caseName: "Tuổi 60",
    name: "A".repeat(50),
    email: "chuatontai3@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 60,
  },
  {
    caseName: "Mật khẩu 8 ký tự",
    name: "A".repeat(50),
    email: "chuatontai3@test.com",
    password: "Mat12345",
    confirmPassword: "Mat12345",
    age: 60,
  },
  {
    caseName: "Mật khẩu 20 ký tự",
    name: "A".repeat(50),
    email: "chuatontai3@test.com",
    password: "Matkhau1234567890123",
    confirmPassword: "Matkhau1234567890123",
    age: 60,
  },
];

export const invalidCreateCases = [
  {
    caseName: "Để trống họ tên",
    name: "",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 25,
    expectedError: "Vui lòng nhập họ tên",
    errorField: "errorName"
  },
  {
    caseName: "Để trống email",
    name: "Nguyenvana",
    email: "",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 25,
    expectedError: "Vui lòng nhập email",
    errorField: "errorEmail"
  },
  {
    caseName: "Email đã tồn tại",
    name: "Nguyenvana",
    email: "an@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 25,
    expectedError: "Email đã được sử dụng",
    errorField: "errorEmail"
  },
  {
    caseName: "Email sai định dạng",
    name: "Nguyenvana",
    email: "an@test.",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 25,
    expectedError: "Email không đúng định dạng",
    errorField: "errorEmail"
  },
  {
    caseName: "Mật khẩu 7 ký tự",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Mat1234",
    confirmPassword: "Mat1234",
    age: 25,
    expectedError: "Mật khẩu phải dài từ 8 đến 20 ký tự",
    errorField: "errorPassword"
  },
  {
    caseName: "Mật khẩu 21 ký tự",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau12345678901234",
    confirmPassword: "Matkhau12345678901234",
    age: 25,
    expectedError: "Mật khẩu phải dài từ 8 đến 20 ký tự",
    errorField: "errorPassword",
    bug: "INTERN-20: Backend vẫn nhận mật khẩu 21 ký tự vượt 20 ký tự"
  },
  {
    caseName: "Mật khẩu thiếu chữ hoa",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "matkhau123",
    confirmPassword: "matkhau123",
    age: 25,
    expectedError: "Mật khẩu cần ít nhất 1 chữ hoa và 1 chữ số",
    errorField: "errorPassword"

  },
  {
    caseName: "Mật khẩu thiếu chữ số",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhaudai",
    confirmPassword: "Matkhaudai",
    age: 25,
    expectedError: "Mật khẩu cần ít nhất 1 chữ hoa và 1 chữ số",
    errorField: "errorPassword"

  },
  {
    caseName: "Nhập lại mật khẩu không khớp/ Để trống",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau",
    age: 25,
    expectedError: "Mật khẩu nhập lại không khớp",
    errorField: "errorConfirmPassword"

  },
  {
    caseName: "Để trống tuổi",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: "",
    expectedError: "Vui lòng nhập tuổi",
    errorField: "errorAge"

  },
  {
    caseName: "Tuổi 17",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 17,
    expectedError: "Tuổi phải từ 18 đến 60",
    errorField: "errorAge"

  },
  {
    caseName: "Tuổi 61",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 61,
    expectedError: "Tuổi phải từ 18 đến 60",
    errorField: "errorAge"

  },
  {
    caseName: "Tuổi là số âm",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: -19,
    expectedError: "Tuổi phải từ 18 đến 60",
    errorField: "errorAge"

  },
  {
    caseName: "Tuổi là ký tự đặc biệt",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: "!@#",
    expectedError: "Tuổi phải là số nguyên",
    errorField: "errorAge"

  },
  {
    caseName: "Tuổi là chữ số thập phân",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: 19.5,
    expectedError: "Tuổi phải là số nguyên",
    errorField: "errorAge"

  },
  {
    caseName: "Tuổi là chữ cái",
    name: "Nguyenvana",
    email: "chuatontai@test.com",
    password: "Matkhau123",
    confirmPassword: "Matkhau123",
    age: "Abc",
    expectedError: "Tuổi phải là số nguyên",
    errorField: "errorAge"

  },
];
