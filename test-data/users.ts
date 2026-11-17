export const invalidLoginCases = [
    {
        caseName: 'Để trống email',
        email: '',
        password: 'Matkhau123',
        expectedError: 'Vui lòng nhập email',
    },
    {
        caseName: 'Sai mật khẩu',
        email: 'an@test.com',
        password: 'Matkhau',
        expectedError: 'Email hoặc mật khẩu không đúng',
    },
    {
        caseName: 'Email không tồn tại',
        email: 'khongtontai@test.com',
        password: 'Matkhau123',
        expectedError: 'Email hoặc mật khẩu không đúng',
    }
];