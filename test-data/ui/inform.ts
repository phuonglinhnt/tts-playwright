export const validCheckoutCases = [
  {
    caseName: "Địa chỉ đúng 10 ký tự",
    fullname: "Nguyen Van An",
    phone: "0123456789",
    address: "Q.HoangMai",
  },
  {
    caseName: "Địa chỉ 11 ký tự",
    fullname: "Nguyen Van An",
    phone: "0123456789",
    address: "Q. HoangMai",
  },
];

export const invalidCheckoutCases = [
  {
    caseName: "Bỏ trống Họ tên",
    fullname: "",
    phone: "0123456789",
    address: "Q. HoangMai",
    expectedError: "Vui lòng nhập họ tên người nhận",
    errorField: "errorFullname"
  },
  {
    caseName: "Bỏ trống SDT",
    fullname: "Nguyen Van An",
    phone: "",
    address: "Q. HoangMai",
    expectedError: "Vui lòng nhập số điện thoại",
    errorField: "errorPhone"
  },
  {
    caseName: "Bỏ trống địa chỉ",
    fullname: "Nguyen Van An",
    phone: "0123456789",
    address: "",
    expectedError: "Vui lòng nhập địa chỉ giao hàng",
    errorField: "errorAddress"
  },
  {
    caseName: "Địa chỉ 9 ký tự",
    fullname: "Nguyen Van An",
    phone: "0123456789",
    address: "Hoang Mai",
    expectedError: "Địa chỉ quá ngắn, vui lòng nhập đầy đủ",
    errorField: "errorAddress"
  },
];
