import { test, expect, request } from "@playwright/test";
import { createdOrder, getAdminToken, getToken } from "./callBackApi";

test.describe("Bộ kiểm thử API theo Collection", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");
  });

  test("Đăng nhập hợp lệ", async ({ request }) => {
    const token = await getToken(request);

    expect(token).toBeTruthy();
  });

  test("Đăng nhập sai mật khẩu", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "an@test.com", password: "Saimatkhau" },
    });
    expect(res.status()).toBe(401);
  });

  test("Lấy danh sách sản phẩm", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.get("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
  });

  test("Xem sản phẩm không tồn tại", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.get("/api/products/999", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
  });

  test("Xem giỏ hàng không có token", async ({ request }) => {
    const res = await request.get("/api/cart");
    expect(res.status()).toBe(401);
  });

  test("Thêm sản phẩm vào giỏ hàng", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 2 },
    });
    expect(res.status()).toBe(201);
  });

  test("Tạo đơn hàng thành công", async ({ request }) => {
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);

    expect(order.id).toBeDefined();
    expect(order.status).toBe("NEW");
  });

  test("Xem chi tiết đơn hàng vừa tạo", async ({ request }) => {
    const token = await getToken(request);
    const newOrder = await createdOrder(request, token, 1, 1);
    const res = await request.get(`/api/orders/${newOrder.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const orderDetail = await res.json();
    expect(orderDetail.id).toBe(newOrder.id);
  });

  test("Tạo đơn hàng với SĐT không hợp lệ ('01234567891') phải báo lỗi 400", async ({
    request,
  }) => {
    test.info().annotations.push({
      type: "issue",
      description:
        "Jira: INTERN-47 - API tạo đơn chấp nhận SĐT '01234567891' không đúng định dạng 10 chữ số",
    });
    const token = await getToken(request);

    await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });

    const res = await request.post("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        fullname: "Nguyen Van An",
        phone: "01234567891",
        address: "Cau Giay, Ha Noi",
      },
    });
    // Mong đợi: 400 Bad Request
    // Thực tế trả về: 201 Created
    expect(res.status()).toBe(400);
  });

  test("Khách không được phép hủy đơn hàng khi đã DELIVERED", async ({
    request,
  }) => {
    test.info().annotations.push({
      type: "issue",
      description:
        "Jira: INTERN-46 - API trả về 200 OK thay vì 400 khi khách hủy đơn đã giao (DELIVERED)",
    });
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);

    const adminToken = await getAdminToken(request);
    await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "CONFIRMED" },
    });
    await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "SHIPPING" },
    });
    await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "DELIVERED" },
    });
    // Khách gửi yêu cầu hủy đơn đã giao
    const resCancel = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "CANCELLED" },
    });
    // Mong đợi: 400 Bad Request
    // Thực tế trả về: 200 OK
    expect(resCancel.status()).toBe(400);
  });

  test("Xem giỏ hàng hợp lệ khi có Token", async ({ request }) => {
    const token = await getToken(request);
    const res = await request.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const cart = await res.json();
    expect(cart.items).toBeDefined();
  });

  test("Đổi số lượng sản phẩm trong giỏ hàng", async ({ request }) => {
    const token = await getToken(request);

    await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });
    const res = await request.patch("/api/cart/items/1", {
      headers: { Authorization: `Bearer ${token}` },
      data: { quantity: 3 },
    });
    expect(res.status()).toBe(200);
  });

  test("Xóa một sản phẩm khỏi giỏ hàng", async ({ request }) => {
    const token = await getToken(request);
    await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });
    const res = await request.delete("/api/cart/items/1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(204);
  });

  test("Khách tự hủy đơn hàng mới tạo", async ({ request }) => {
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);

    const res = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "CANCELLED" },
    });
    expect(res.status()).toBe(200);
    const updatedOrder = await res.json();
    expect(updatedOrder.status).toBe("CANCELLED");
  });

  test("Khách thường không được phép đổi trạng thái sang SHIPPING", async ({
    request,
  }) => {
    const token = await getToken(request);
    const order = await createdOrder(request, token, 1, 1);
    const res = await request.patch(`/api/orders/${order.id}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "SHIPPING" },
    });
    expect(res.status()).toBe(403);
  });

  test("Lấy thông tin người dùng đang đăng nhập (Me)", async ({
    request,
  }) => {
    const token = await getToken(request);
    const res = await request.get("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const user = await res.json();
    expect(user.email).toBe("an@test.com");
  });

  test("Cập nhật số lượng sản phẩm trong giỏ vượt quá 10 (số lượng = 11) phải báo lỗi 400", async ({
    request,
  }) => {
    test.info().annotations.push({
      type: "issue",
      description:
        "Jira: INTERN-55 - API PATCH /api/cart/items/:id cho phép mua 11 sản phẩm (vượt tối đa 10)",
    });
    const token = await getToken(request);

    await request.post("/api/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });

    const res = await request.patch("/api/cart/items/1", {
      headers: { Authorization: `Bearer ${token}` },
      data: { quantity: 11 },
    });
    // Mong đợi: 400 Bad Request
    // Kết quả trả về: 200 OK
    expect(res.status()).toBe(400);
  });
});
